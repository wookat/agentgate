import { Rule, finding } from './rule.js';

const SECRET_KEY_RE = /(api[-_]?key|secret|token|password|passwd|credential|private[-_]?key|access[-_]?key)/i;

/** Values that look like real secrets rather than placeholders/env references. */
const SECRET_VALUE_PATTERNS: RegExp[] = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/, // OpenAI-style
  /\bsk-ant-[A-Za-z0-9_-]{20,}\b/, // Anthropic
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/, // GitHub tokens
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, // Slack
  /\bAKIA[0-9A-Z]{16}\b/, // AWS access key id
  /\bAIza[0-9A-Za-z_-]{35}\b/, // Google API key
  // Require key material after the header so detector code quoting the marker doesn't match.
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\\"'nr]{0,8}[A-Za-z0-9+/]{40}/,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/, // JWT
];

function isPlaceholder(value: string): boolean {
  return (
    value === '' ||
    /^\$\{?[A-Z0-9_]+\}?$/.test(value) || // ${ENV_VAR} / $ENV_VAR
    /^%[A-Z0-9_]+%$/i.test(value) ||
    /^<[^>]+>$/.test(value) ||
    /(\b|_)(your|my|xxx+|placeholder|changeme|example|redacted|dummy|sample|fake|test|testing|mock|demo|do[-_]not)(\b|_)/i.test(value) ||
    // A run of 8+ identical characters (sk-j7caBpkRoxxxxxxxxxxxx…,
    // ghp_aaaa…) is padded demo filler — real key material is high-entropy.
    /(.)\1{7,}/.test(value) ||
    // An all-lowercase kebab body with no digits (sk-user-profile-updated) is
    // an identifier, not key material — real sk- keys are random base62.
    /^sk-[a-z]+(-[a-z]+){2,}$/.test(value) ||
    // AWS reserves credentials ending in the literal EXAMPLE for documentation
    // (AKIAIOSFODNN7EXAMPLE, wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY).
    /EXAMPLE(KEY)?$/.test(value) ||
    // Keyboard-run dummies: a body built entirely from sequential runs
    // (sk-abcdef1234567890abcdef) is demo filler, not key material.
    // A truncated final run (sk-abcdef0123456789abcdef0123) is still a dummy.
    /^([a-z0-9]{1,8}-)*(abcdef(gh)?|0?1234567(89?0?)?|deadbeef)+(abcd(ef?)?|0123(4(56?)?)?)?$/i.test(value) ||
    // Interleaved-run dummies (ghp_A1bC2dE3fH4iJ5kL6…): the letters walk the
    // alphabet and the digits count 1-9-0 in lockstep — demo filler, not key
    // material. Real tokens are random, never monotone.
    isInterleavedRun(value)
  );
}

function isInterleavedRun(value: string): boolean {
  const body = value.replace(/^[a-z0-9]{1,8}[_-]/i, '');
  const digits = body.replace(/[^0-9]/g, '');
  const letters = body.replace(/[^a-z]/gi, '').toLowerCase();
  if (digits.length < 8 || letters.length < 10) return false;
  if (!'12345678901234567890123456789012345678901234567890'.includes(digits)) return false;
  for (let i = 1; i < letters.length; i++) {
    const step = (letters.charCodeAt(i) - letters.charCodeAt(i - 1) + 26) % 26;
    if (step < 1 || step > 2) return false;
  }
  return true;
}

/** Test/fixture trees and test-named files carry deliberate fakes (redaction tests, sample configs). */
function isTestOrFixturePath(file: string): boolean {
  return (
    /(^|\/)(tests?|testing|testdata|__tests__|examples?|fixtures|mocks?|docs?|demos?|postman)\//i.test(file) ||
    /\.(test|spec)\.\w+$/i.test(file) ||
    /(^|\/)test[-_][^/]+$|_(self)?test\.\w+$/i.test(file) ||
    // A test/selfcheck token delimited inside the filename (integration-test-mcp-002.mjs,
    // selfcheck-mcp-007-engine.mjs) marks a self-verifying harness file.
    /(^|\/)[^/]*[-_.](tests?|selfcheck|selftest)[-_.][^/]*$/i.test(file) ||
    /(^|\/)(selfcheck|selftest)[-_][^/]+$/i.test(file) ||
    /\.postman_collection\.json$/i.test(file)
  );
}

/** Supabase anon/publishable JWTs are designed to be shipped to clients. */
function isPublishableJwt(value: string): boolean {
  const payload = value.split('.')[1];
  if (!payload) return false;
  try {
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    return /"iss"\s*:\s*"supabase[^"]*"/.test(decoded) && /"role"\s*:\s*"anon"/.test(decoded);
  } catch {
    return false;
  }
}

/** A JWT whose decoded payload names itself a demo/test/example token is doc filler, not a leaked credential. */
function isDemoJwt(value: string): boolean {
  if (!/^eyJ/.test(value)) return false;
  const payload = value.split('.')[1];
  if (!payload) return false;
  try {
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    return /(\b|_|")(demo|test|testing|example|sample|dummy|fake|placeholder)(\b|_|")/i.test(decoded);
  } catch {
    return false;
  }
}

function looksLikeSecret(value: string): boolean {
  if (isPlaceholder(value)) return false;
  if (SECRET_VALUE_PATTERNS.some((re) => re.test(value))) return true;
  // long high-entropy-ish opaque strings assigned to secret-named keys
  return /^[A-Za-z0-9+/=_-]{20,}$/.test(value);
}

export const credentialLeakRule: Rule = {
  id: 'AG-CL-001',
  category: 'credential-leak',
  description: 'Detects hardcoded credentials in MCP client configs and tools soliciting secrets',
  checkServer(server) {
    const findings = [];
    // A server config inside a test/fixture tree carries deliberate fake
    // credentials (scanner fixtures, sample configs); still reported, quietly.
    const fixtureConfig = isTestOrFixturePath(server.source ?? '');
    for (const [key, value] of Object.entries(server.env ?? {})) {
      if (SECRET_KEY_RE.test(key) && looksLikeSecret(value)) {
        findings.push(
          finding(this, {
            severity: fixtureConfig ? 'low' : 'high',
            target: server.name,
            file: server.source,
            message: `Server "${server.name}" has a hardcoded secret in env var "${key}" — move it to an environment reference or OS keychain${fixtureConfig ? ' (in a test/fixture path, likely a deliberate fake; confirm)' : ''}`,
          }),
        );
      }
    }
    for (const [key, value] of Object.entries(server.headers ?? {})) {
      if ((/authorization|api[-_]?key|token/i.test(key) || SECRET_KEY_RE.test(key)) && looksLikeSecret(value.replace(/^Bearer\s+/i, ''))) {
        findings.push(
          finding(this, {
            severity: fixtureConfig ? 'low' : 'high',
            target: server.name,
            file: server.source,
            message: `Server "${server.name}" has a hardcoded credential in header "${key}"${fixtureConfig ? ' (in a test/fixture path, likely a deliberate fake; confirm)' : ''}`,
          }),
        );
      }
    }
    for (const arg of server.args ?? []) {
      if (SECRET_VALUE_PATTERNS.some((re) => re.test(arg)) && !isPlaceholder(arg)) {
        findings.push(
          finding(this, {
            severity: 'high',
            target: server.name,
            file: server.source,
            message: `Server "${server.name}" passes what looks like a secret on the command line (visible in process listings)`,
          }),
        );
      }
    }
    return findings;
  },
  checkTool(tool, serverName) {
    const schemaText = JSON.stringify(tool.inputSchema ?? {});
    const solicits =
      /"(api[-_]?key|secret|token|password|credential|private[-_]?key)"/i.test(schemaText) ||
      /\b(paste|enter|provide)\s+(your\s+)?(api[-_]?key|password|token|secret|credentials)\b/i.test(tool.description);
    if (!solicits) return [];
    return [
      finding(this, {
        severity: 'medium',
        target: `${serverName}/${tool.name}`,
        message: `Tool "${tool.name}" solicits credentials via its input schema/description — secrets passed here flow through model context`,
      }),
    ];
  },
  checkSource(file, content) {
    const findings = [];
    // Secret-shaped strings inside test/fixture trees are usually deliberate fakes
    // (redaction tests, sample configs); still reported, but quietly.
    const testPath = isTestOrFixturePath(file);
    // Secret-scanner configs (gitleaks, detect-secrets) quote secret-shaped
    // patterns as the rules/baseline they scan for, not as leaked values.
    const scannerConfig = /(^|\/)\.?gitleaks([\w.-]*\.toml)?$|(^|\/)\.secrets\.baseline$/i.test(file);
    // Firebase distributes its client API key inside google-services.json /
    // GoogleService-Info.plist by design — access is gated by Firebase security
    // rules, not by the key's secrecy.
    const firebaseClientConfig = /(^|\/)google-services\.json$|(^|\/)GoogleService-Info\.plist$/i.test(file);
    const allSourceLines = content.split('\n');
    for (const re of SECRET_VALUE_PATTERNS) {
      const m = content.match(re);
      if (m) {
        if (isPlaceholder(m[0]) || scannerConfig) continue;
        const line = content.slice(0, m.index ?? 0).split('\n').length;
        // API docs quote sample tokens under an `example:` key (OpenAPI/JSON Schema).
        const lineText = allSourceLines[line - 1] ?? '';
        const matchCol = lineText.indexOf(m[0]);
        // A hyphen/slash-joined continuation of a URL path (…/vasteras-sk-fk-match-…)
        // is a slug the \b boundary can't tell from a key prefix, not key material.
        const urlSlug = matchCol > 0 && /[-/]/.test(lineText[matchCol - 1] ?? '') && /https?:\/\/\S*$/.test(lineText.slice(0, matchCol));
        if (urlSlug) continue;
        // Also match compound keys (`bad_example:`, `"good-example":`) — the
        // example marker can sit after an underscore/hyphen the \b can't see.
        const exampleValue = /(\b|"|[_-])examples?"?\s*[:=]/i.test(matchCol >= 0 ? lineText.slice(0, matchCol) : lineText);
        // A redaction vector: the same line carries the mask the value must
        // redact to ({raw, mask: "[REDACTED:jwt]"}), or the file is itself a
        // redaction utility — the value is a test input, not a leak.
        const redactionVector = /\[?REDACTED\b/.test(lineText) || /(^|\/)[^/]*redact[^/]*\.\w+$/i.test(file);
        const publishable = isPublishableJwt(m[0]);
        const demoJwt = !publishable && isDemoJwt(m[0]);
        // A Firebase *web-app* config object embeds the same client-distributable
        // API key inline (initializeApp({apiKey, authDomain: "x.firebaseapp.com",
        // messagingSenderId, …})) — same design as google-services.json.
        const firebaseWebConfig =
          /\bAIza/.test(m[0]) &&
          /firebaseapp\.com|messagingSenderId|\bauthDomain\b/.test(allSourceLines.slice(Math.max(0, line - 6), line + 5).join('\n'));
        const quiet = testPath || exampleValue || redactionVector || publishable || demoJwt || firebaseClientConfig || firebaseWebConfig;
        findings.push(
          finding(this, {
            severity: quiet ? 'low' : 'high',
            target: file,
            file,
            line,
            message: `Possible hardcoded secret in source (matches ${re.source.slice(0, 30)}…)${testPath ? ' — in a test/fixture path, likely a deliberate fake; confirm' : ''}${exampleValue ? ' — under an example: key, likely documentation; confirm' : ''}${redactionVector ? ' — a redaction test vector (masked target on the same line); confirm' : ''}${publishable ? ' — a Supabase anon-role JWT, publishable by design; confirm row-level security instead' : ''}${demoJwt ? ' — a JWT whose payload names itself a demo/test token; likely doc filler, confirm' : ''}${firebaseClientConfig || firebaseWebConfig ? ' — a Firebase client config; its API key is client-distributable, access is gated by Firebase security rules' : ''}`,
          }),
        );
      }
    }
    return findings;
  },
};
