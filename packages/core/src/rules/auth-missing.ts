import { Rule, finding } from './rule.js';

function isLocal(url: URL): boolean {
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1';
}

export const authMissingRule: Rule = {
  id: 'AG-AM-001',
  category: 'auth-missing',
  description: 'Detects remote MCP servers configured without authentication or over plain HTTP',
  checkServer(server) {
    if (!server.url) return [];
    const findings = [];
    let url: URL;
    try {
      url = new URL(server.url);
    } catch {
      return [
        finding(this, {
          severity: 'low',
          target: server.name,
          file: server.source,
          message: `Server "${server.name}" has an unparseable URL: ${server.url}`,
        }),
      ];
    }
    if (url.protocol === 'http:' && !isLocal(url)) {
      findings.push(
        finding(this, {
          severity: 'high',
          target: server.name,
          file: server.source,
          message: `Remote server "${server.name}" uses plain HTTP (${url.hostname}) — traffic (including any tokens) is unencrypted`,
        }),
      );
    }
    const hasAuthHeader = Object.keys(server.headers ?? {}).some((h) => /^(authorization|x-api-key|api-key|x-auth-token)$/i.test(h));
    const hasInlineAuth = url.username !== '' || url.searchParams.has('api_key') || url.searchParams.has('token') || url.searchParams.has('key');
    if (!isLocal(url) && !hasAuthHeader && !hasInlineAuth) {
      findings.push(
        finding(this, {
          severity: 'medium',
          target: server.name,
          file: server.source,
          message: `Remote server "${server.name}" (${url.hostname}) is configured without any authentication header — verify the endpoint enforces auth (e.g. OAuth) out of band`,
        }),
      );
    }
    if (hasInlineAuth && url.searchParams.size > 0) {
      findings.push(
        finding(this, {
          severity: 'medium',
          target: server.name,
          file: server.source,
          message: `Server "${server.name}" passes credentials in the URL query string — prefer an Authorization header`,
        }),
      );
    }
    return findings;
  },
};
