import { Rule, finding, toolText, verbAlt } from './rule.js';

const METADATA_ENDPOINTS = /(169\.254\.169\.254|metadata\.google\.internal|metadata\.azure\.com|100\.100\.100\.200)/i;
/** Kubernetes/Cilium/Calico network-policy manifests (also matches inside Helm templates). */
const NETWORK_POLICY_KIND = /^\s*kind:\s*["']?(Cilium(Clusterwide)?|Global)?NetworkPolicy["']?\s*$/im;

const PRIVATE_IP = /\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|0\.0\.0\.0)\b/;

/** Tool accepts a caller-controlled URL and fetches it — classic SSRF surface. */
const URL_PARAM_RE = /"(url|uri|endpoint|target|link|href|callback[-_]?url|webhook[-_]?url)"/i;
const FETCH_VERB_RE = new RegExp(`\\b(${verbAlt(['fetch', 'retrieve', 'download', 'request', 'get', 'crawl', 'scrape', 'browse', 'proxy'])})\\b`, 'i');

export const ssrfRule: Rule = {
  id: 'AG-SS-001',
  category: 'ssrf',
  description: 'Detects SSRF vectors: metadata/private endpoints in configs and unrestricted URL-fetching tools',
  checkServer(server) {
    const findings = [];
    const haystack = [server.url ?? '', ...(server.args ?? []), ...Object.values(server.env ?? {})].join(' ');
    if (METADATA_ENDPOINTS.test(haystack)) {
      findings.push(
        finding(this, {
          severity: 'critical',
          target: server.name,
          file: server.source,
          message: `Server "${server.name}" references a cloud metadata endpoint — likely credential-theft vector`,
        }),
      );
    }
    return findings;
  },
  checkTool(tool, serverName) {
    const findings = [];
    const text = toolText(tool);
    if (METADATA_ENDPOINTS.test(text)) {
      findings.push(
        finding(this, {
          severity: 'critical',
          target: `${serverName}/${tool.name}`,
          message: `Tool "${tool.name}" references a cloud metadata endpoint`,
        }),
      );
    }
    const schemaText = JSON.stringify(tool.inputSchema ?? {});
    if (URL_PARAM_RE.test(schemaText) && FETCH_VERB_RE.test(`${tool.name} ${tool.description}`)) {
      const restricted = /\b(allowlist|allow[-_ ]?list|whitelist|blocked|restricted|internal addresses|private (ip|network)s? (are )?(blocked|denied|rejected))\b/i.test(
        tool.description,
      );
      if (!restricted) {
        findings.push(
          finding(this, {
            severity: 'medium',
            target: `${serverName}/${tool.name}`,
            message: `Tool "${tool.name}" fetches caller-supplied URLs with no documented private-network restrictions (SSRF surface)`,
          }),
        );
      }
    }
    if (PRIVATE_IP.test(tool.description)) {
      findings.push(
        finding(this, {
          severity: 'low',
          target: `${serverName}/${tool.name}`,
          message: `Tool "${tool.name}" description references private IP addresses`,
        }),
      );
    }
    return findings;
  },
  checkSource(file, content) {
    if (!METADATA_ENDPOINTS.test(content)) return [];
    const m = content.match(METADATA_ENDPOINTS)!;
    const line = content.slice(0, m.index ?? 0).split('\n').length;
    // Network-policy manifests reference the metadata IP to *block* egress
    // to it — a defensive control, not an SSRF vector.
    if (/\.ya?ml$/i.test(file) && NETWORK_POLICY_KIND.test(content)) {
      return [
        finding(this, {
          severity: 'low',
          target: file,
          file,
          line,
          message: 'Network-policy manifest references a cloud metadata endpoint — verify the rule blocks (not allows) it',
        }),
      ];
    }
    // Test/fixture trees reference the metadata IP as a fixture for the very
    // SSRF protections under test; still reported, but quietly.
    const testPath = /(^|\/)(tests?|testing|__tests__|evals?|examples?|fixtures|mocks?)\//i.test(file) || /\.(test|spec|selfcheck)\.\w+$/i.test(file);
    // Security guidance / defensive code references the endpoint to block it
    // (e.g. "MUST reject ... the metadata IP"); an exfil vector doesn't.
    // Guards often explain themselves in a comment block, so look at the
    // surrounding lines too, not just the one carrying the IP literal.
    // Blocklist data structures name themselves in identifiers (BLOCKED_V4_RANGES,
    // _BLOCKED_SAFE_MODE_NETWORKS) and open with a comment a few lines above the
    // IP literal, so for those unambiguous markers match at underscore boundaries
    // and look a bit further up.
    const allLines = content.split(/\r?\n/);
    const context = allLines.slice(Math.max(0, line - 4), line + 3).join('\n');
    // camelCase blocklist identifiers (DeniedPortForwardingRemoteIPs) hide the
    // defensive word at a case boundary the word-boundary set can't see, and
    // safety-rule tables name themselves "trigger patterns" for unsafe actions.
    const nearWindow = allLines.slice(Math.max(0, line - 11), line + 3).join('\n');
    const blocklistNearby =
      /(\b|_)(block(s|ed|ing)?|block[-_]?list|deny[-_]?list|den(y|ied|ies)|blacklist|reject(s|ed|ing)?|restrict(s|ed|ing|ion)?|danger(ous)?|guard(s|ed|ing)?|not allowed)(\b|_)|\bis[_]?private/i.test(nearWindow) ||
      /\b(Denied|Deny|Blocked|Restricted|Dangerous)[A-Z]/.test(nearWindow) ||
      /\b(denied|deny|dangerous|block(ed)?)[A-Z]/.test(nearWindow) ||
      /\btrigger[-_ ]?patterns?\b/i.test(nearWindow) ||
      // A named guard identifier (ssrfGuard, classifyIp routing) hides "guard"
      // at a camelCase boundary the word-boundary set can't see.
      /ssrf[._-]?guard/i.test(nearWindow) ||
      // URL-validator modules name themselves in the filename or nearby
      // identifiers (url-validator.ts, ValidationError, validateProviderHost);
      // an exfiltration script doesn't route its target through a validator.
      /\bvalidat/i.test(nearWindow) ||
      /\b(allow|white)[-_ ]?list/i.test(nearWindow);
    // Private/blocked-range guard functions (isPrivateIPv4, isBlockedIPv4)
    // annotate the metadata range in a doc comment above the declaration or a
    // body comment below it, either of which can sit well outside the generic
    // window. Requires a declaration shape (`name =` / `name(`), not a bare
    // mention, so exploitation scripts that merely reference such helpers in
    // prose stay hot.
    // A safe-fetch wrapper invocation (safeFetch(url), safe_request(…)) is the
    // guard itself — the code routes the URL through a validator instead of a
    // bare fetch — even when the explanatory comment isn't in English.
    const guardDeclNearby = /(\b|_)is[_]?(private|blocked|denied|reserved|internal|link[_]?local)[a-z0-9_]*\s*[=(]|\bsafe[_]?(fetch|request|get|http)[a-z0-9_]*\s*\(/i.test(
      allLines.slice(Math.max(0, line - 21), line + 20).join('\n'),
    );
    // A network-security module declares its purpose in the file header
    // ("Implements URL/host allowlists to prevent SSRF attacks") even when the
    // IP literal sits in a bare data table further down. Requires explicit
    // preventive phrasing — a bare "SSRF" header also fits exploitation scripts.
    // A threat-intel scanner's header names its purpose ("Scan … for active
    // supply-chain incident indicators") while its IOC table sits far below.
    // Noun-first headers name the module the other way around ("SSRF
    // Protection page — … IP blocking"); an exploitation script doesn't call
    // itself a protection/blocking/filtering module.
    const headerDefensive = /\b(prevent\w*|protect\w*|mitigat\w*|guard\w*|block\w*|den(y|ies)|disallow)\b[^\n]{0,80}\b(SSRF|metadata|internal networks?)\b|\bSSRF\b[^\n]{0,40}\b(protect\w*|block\w*|filter\w*|prevent\w*|mitigat\w*|guard\w*)\b|\b(allow|block)[-_ ]?lists?\b[^\n]{0,80}\bto prevent\b|\b(scan|detect|check)\w*\b[\s\S]{0,160}\b(incident indicators?|IOCs?)\b|\b(IOCs?|indicators? of compromise)\b[^\n]{0,80}\b(database|db|list|table|feed)\b/i.test(
      allLines.slice(0, 12).join('\n'),
    );
    // A boolean host-classifier predicate compares the hostname against the
    // metadata literal (host === "metadata.google.internal") or annotates a
    // return-branch comment (return false; // link-local incl. cloud metadata)
    // — the code checks the address instead of fetching it. Requires a boolean
    // return in the near window and no fetch call on the literal's line, so
    // exploitation code that dials the endpoint stays hot.
    const literalLine = allLines[line - 1] ?? '';
    const classifierNearby =
      /(===|!==|==|!=)/.test(literalLine) &&
      !/\b(curl|wget|fetch|request|urlopen|https?[._]?get|open)\s*\(/i.test(literalLine) &&
      /\breturn\s+(true|false)\b/.test(nearWindow);
    const defensive =
      blocklistNearby ||
      guardDeclNearby ||
      headerDefensive ||
      classifierNearby ||
      /\b(block(s|ed|ing)?|reject(s|ed|ing)?|den(y|ies|ied)|disallow|forbid|refus\w*|restrict\w*|prevent(s|ed|ing)?|must (not|never)|cannot target|guard(s|ed|ing)?|validat\w*|mitigat\w*|exclud\w*)\b|(\b|_)SSRF(\b|_)/i.test(context);
    // A `#`-commented config line (a commented-out cloud-init `metadata_urls`
    // example) is inert — nothing reads it; still reported, but quietly.
    const matchLine = allLines[line - 1] ?? '';
    const commentedOut = /^\s*#(?!!)/.test(matchLine) && !/\b(curl|wget)\s/.test(matchLine);
    if (commentedOut && !defensive && !testPath) {
      return [
        finding(this, {
          severity: 'low',
          target: file,
          file,
          line,
          message: 'Commented-out line references a cloud metadata endpoint — inert example config; confirm it stays disabled',
        }),
      ];
    }
    if (defensive && !testPath) {
      return [
        finding(this, {
          severity: 'low',
          target: file,
          file,
          line,
          message: 'Source references a cloud metadata endpoint in a blocking/defensive context (SSRF guidance or guard); confirm it blocks rather than fetches',
        }),
      ];
    }
    return [
      finding(this, {
        severity: testPath ? 'low' : 'high',
        target: file,
        file,
        line,
        message: `Source references a cloud metadata endpoint (potential SSRF/credential-theft vector)${testPath ? ' — in a test/fixture path, likely an SSRF-protection test fixture; confirm' : ''}`,
      }),
    ];
  },
};
