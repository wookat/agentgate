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
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/, // JWT
];

function isPlaceholder(value: string): boolean {
  return (
    value === '' ||
    /^\$\{?[A-Z0-9_]+\}?$/.test(value) || // ${ENV_VAR} / $ENV_VAR
    /^%[A-Z0-9_]+%$/i.test(value) ||
    /^<[^>]+>$/.test(value) ||
    /\b(your|my|xxx+|placeholder|changeme|example|redacted|dummy|sample|fake)\b/i.test(value)
  );
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
    for (const [key, value] of Object.entries(server.env ?? {})) {
      if (SECRET_KEY_RE.test(key) && looksLikeSecret(value)) {
        findings.push(
          finding(this, {
            severity: 'high',
            target: server.name,
            file: server.source,
            message: `Server "${server.name}" has a hardcoded secret in env var "${key}" — move it to an environment reference or OS keychain`,
          }),
        );
      }
    }
    for (const [key, value] of Object.entries(server.headers ?? {})) {
      if ((/authorization|api[-_]?key|token/i.test(key) || SECRET_KEY_RE.test(key)) && looksLikeSecret(value.replace(/^Bearer\s+/i, ''))) {
        findings.push(
          finding(this, {
            severity: 'high',
            target: server.name,
            file: server.source,
            message: `Server "${server.name}" has a hardcoded credential in header "${key}"`,
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
    const testPath = /(^|\/)(tests?|testing|__tests__|examples?|fixtures|mocks?|docs?)\//i.test(file) || /\.(test|spec)\.\w+$/i.test(file);
    for (const re of SECRET_VALUE_PATTERNS) {
      const m = content.match(re);
      if (m) {
        if (isPlaceholder(m[0])) continue;
        const line = content.slice(0, m.index ?? 0).split('\n').length;
        findings.push(
          finding(this, {
            severity: testPath ? 'low' : 'high',
            target: file,
            file,
            line,
            message: `Possible hardcoded secret in source (matches ${re.source.slice(0, 30)}…)${testPath ? ' — in a test/fixture path, likely a deliberate fake; confirm' : ''}`,
          }),
        );
      }
    }
    return findings;
  },
};
