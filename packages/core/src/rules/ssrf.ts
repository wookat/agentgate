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
    return [
      finding(this, {
        severity: 'high',
        target: file,
        file,
        line,
        message: 'Source references a cloud metadata endpoint (potential SSRF/credential-theft vector)',
      }),
    ];
  },
};
