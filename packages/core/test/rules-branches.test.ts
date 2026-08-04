import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scanRepo, scanServers, scanTools } from '../src/scanner.js';
import { McpServerConfig, ToolSurface } from '../src/types.js';

// assembled at runtime so secret scanners don't flag the test fixture
const FAKE_GH_TOKEN = ['ghp', 'abcdefghijklmnopqrstuvwxyz0123456789'].join('_');

function server(overrides: Partial<McpServerConfig>): McpServerConfig {
  return { name: 's', source: 'test.json', client: 'test', ...overrides };
}

function tool(overrides: Partial<ToolSurface>): ToolSurface {
  return { name: 't', description: '', inputSchema: {}, ...overrides };
}

function repoScan(files: Record<string, string>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-branch-'));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content);
  }
  const result = scanRepo(dir);
  fs.rmSync(dir, { recursive: true, force: true });
  return result.findings;
}

describe('rule branch coverage', () => {
  it('credential-leak: hardcoded bearer header and secret in args', () => {
    const findings = scanServers([
      server({
        url: 'https://mcp.example.com/sse',
        headers: { Authorization: `Bearer ${FAKE_GH_TOKEN}` },
      }),
      server({ name: 's2', command: 'run-server', args: [`--token=${FAKE_GH_TOKEN}`] }),
    ]);
    expect(findings.filter((f) => f.category === 'credential-leak').length).toBeGreaterThanOrEqual(2);
  });

  it('credential-leak: placeholders are not flagged', () => {
    const findings = scanServers([
      server({ command: 'x', env: { API_KEY: '${API_KEY}' } }),
      server({ name: 's2', command: 'x', env: { API_KEY: 'YOUR_API_KEY_HERE' } }),
    ]);
    expect(findings.filter((f) => f.category === 'credential-leak')).toHaveLength(0);
  });

  it('ssrf: private IP in tool description and metadata endpoint in source', () => {
    const toolFindings = scanTools('s', [tool({ description: 'Fetches http://192.168.1.10/admin data' })]);
    expect(toolFindings.some((f) => f.category === 'ssrf')).toBe(true);
    const srcFindings = repoScan({ 'fetch.ts': 'fetch("http://169.254.169.254/latest/meta-data/")\n' });
    expect(srcFindings.some((f) => f.category === 'ssrf' && f.severity === 'high')).toBe(true);
  });

  it('supply-chain: pinned specs and pnpm dlx/exec forms', () => {
    const pinned = scanServers([server({ command: 'npx', args: ['-y', '@scope/server@1.2.3'] })]);
    expect(pinned.filter((f) => f.ruleId === 'AG-SC-001' && /runs unpinned package/.test(f.message))).toHaveLength(0);
    const dlx = scanServers([server({ command: 'pnpm', args: ['dlx', 'some-server'] })]);
    expect(dlx.some((f) => f.category === 'supply-chain')).toBe(true);
  });

  it('rce-vectors: eval of dynamic content in source', () => {
    const findings = repoScan({ 'evil.js': 'const r = eval(userInput);\n' });
    expect(findings.some((f) => f.category === 'rce-vectors')).toBe(true);
  });

  it('auth-missing: invalid URL and inline auth with query params', () => {
    const invalid = scanServers([server({ url: 'not a url' })]);
    expect(invalid.some((f) => f.category === 'auth-missing' && f.severity === 'low')).toBe(true);
    const query = scanServers([server({ url: 'https://mcp.example.com/sse?token=secret-token-value' })]);
    expect(query.some((f) => f.category === 'auth-missing' && /query string/.test(f.message))).toBe(true);
  });

  it('overprivileged: dangerous permission-bypass flags', () => {
    const findings = scanServers([server({ command: 'some-agent', args: ['--yolo'] })]);
    expect(findings.some((f) => f.category === 'overprivileged' && f.severity === 'high')).toBe(true);
  });

  it('tool-poisoning: hidden unicode in source files', () => {
    const findings = repoScan({ 'sneaky.ts': 'const s = "hello\u200bworld";\n' });
    expect(findings.some((f) => f.category === 'tool-poisoning' && f.severity === 'high')).toBe(true);
  });
});
