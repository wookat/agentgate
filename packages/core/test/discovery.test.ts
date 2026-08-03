import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  discoverConfigFiles,
  knownConfigLocations,
  parseCodexToml,
  parseMcpServersJson,
  parseOpenCodeJson,
  parseVsCodeJson,
} from '../src/discovery.js';

const loc = (client: string, format: 'mcpServers-json' | 'vscode-mcp-json' | 'codex-toml' | 'opencode-json') => ({
  client,
  path: `/tmp/${client}`,
  format,
});

describe('knownConfigLocations', () => {
  it('covers all five clients', () => {
    const clients = new Set(knownConfigLocations('/home/u', 'linux').map((l) => l.client));
    expect(clients).toEqual(new Set(['claude-desktop', 'claude-code', 'cursor', 'vscode', 'codex', 'opencode']));
  });

  it('uses platform-specific paths', () => {
    const mac = knownConfigLocations('/Users/u', 'darwin').find((l) => l.client === 'claude-desktop')!;
    expect(mac.path).toContain('Library/Application Support');
    const linux = knownConfigLocations('/home/u', 'linux').find((l) => l.client === 'claude-desktop')!;
    expect(linux.path).toContain('.config');
  });
});

describe('parseMcpServersJson', () => {
  it('parses claude/cursor-style mcpServers', () => {
    const servers = parseMcpServersJson(
      JSON.stringify({
        mcpServers: {
          fs: { command: 'npx', args: ['-y', 'server-fs'], env: { HOME: '/home/u' } },
          remote: { url: 'https://mcp.example.com/sse', headers: { Authorization: 'Bearer x' } },
        },
      }),
      loc('cursor', 'mcpServers-json'),
    );
    expect(servers).toHaveLength(2);
    expect(servers[0]).toMatchObject({ name: 'fs', command: 'npx', args: ['-y', 'server-fs'], client: 'cursor' });
    expect(servers[1]).toMatchObject({ name: 'remote', url: 'https://mcp.example.com/sse' });
  });

  it('parses claude-code per-project servers', () => {
    const servers = parseMcpServersJson(
      JSON.stringify({
        mcpServers: { global: { command: 'a' } },
        projects: { '/home/u/proj': { mcpServers: { local: { command: 'b' } } } },
      }),
      loc('claude-code', 'mcpServers-json'),
    );
    expect(servers.map((s) => s.name).sort()).toEqual(['global', 'local']);
  });
});

describe('parseVsCodeJson', () => {
  it('parses the servers key', () => {
    const servers = parseVsCodeJson(JSON.stringify({ servers: { gh: { command: 'npx', args: ['x'] } } }), loc('vscode', 'vscode-mcp-json'));
    expect(servers).toMatchObject([{ name: 'gh', command: 'npx' }]);
  });
});

describe('parseOpenCodeJson', () => {
  it('parses command arrays and environment', () => {
    const servers = parseOpenCodeJson(
      JSON.stringify({ mcp: { fs: { type: 'local', command: ['npx', '-y', 'server-fs'], environment: { KEY: 'v' } } } }),
      loc('opencode', 'opencode-json'),
    );
    expect(servers[0]).toMatchObject({ name: 'fs', command: 'npx', args: ['-y', 'server-fs'], env: { KEY: 'v' } });
  });
});

describe('parseCodexToml', () => {
  it('parses mcp_servers tables with args and env', () => {
    const toml = `
[mcp_servers.docs]
command = "npx"
args = ["-y", "docs-server@1.0.0"]

[mcp_servers.docs.env]
API_KEY = "value"

[mcp_servers."with-quotes"]
command = "uvx"
args = ["mcp-server-fetch"]
`;
    const servers = parseCodexToml(toml, loc('codex', 'codex-toml'));
    expect(servers).toHaveLength(2);
    expect(servers[0]).toMatchObject({ name: 'docs', command: 'npx', args: ['-y', 'docs-server@1.0.0'], env: { API_KEY: 'value' } });
    expect(servers[1]).toMatchObject({ name: 'with-quotes', command: 'uvx' });
  });

  it('parses inline env tables', () => {
    const servers = parseCodexToml('[mcp_servers.a]\ncommand = "x"\nenv = { K = "v" }\n', loc('codex', 'codex-toml'));
    expect(servers[0]!.env).toEqual({ K: 'v' });
  });
});

describe('discoverConfigFiles', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-test-'));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('finds home-level and project-level configs that exist', () => {
    fs.mkdirSync(path.join(dir, '.cursor'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.cursor', 'mcp.json'), '{"mcpServers":{}}');
    const project = path.join(dir, 'proj');
    fs.mkdirSync(path.join(project, '.vscode'), { recursive: true });
    fs.writeFileSync(path.join(project, '.vscode', 'mcp.json'), '{"servers":{}}');

    const found = discoverConfigFiles({ homeDir: dir, projectDir: project, platform: 'linux' });
    expect(found.map((f) => f.client).sort()).toEqual(['cursor', 'vscode']);
  });
});
