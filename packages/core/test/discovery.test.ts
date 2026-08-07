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
  parseContinueYaml,
  parseZedSettingsJson,
  parseAmpSettingsJson,
  parseSkillMcpJson,
  parseSkillFrontmatter,
} from '../src/discovery.js';

const loc = (client: string, format: 'mcpServers-json' | 'vscode-mcp-json' | 'codex-toml' | 'opencode-json' | 'zed-settings-json' | 'continue-yaml' | 'amp-settings-json' | 'skill-mcp-json' | 'skill-frontmatter-yaml') => ({
  client,
  path: `/tmp/${client}`,
  format,
});

describe('knownConfigLocations', () => {
  it('covers all known clients', () => {
    const clients = new Set(knownConfigLocations('/home/u', 'linux').map((l) => l.client));
    expect(clients).toEqual(
      new Set([
        'claude-desktop',
        'claude-code',
        'cursor',
        'vscode',
        'codex',
        'opencode',
        'windsurf',
        'cline',
        'gemini-cli',
        'kiro',
        'roo-code',
        'zed',
        'continue',
        'amp',
        'warp',
        'lmstudio',
        'qoder',
        'agents',
      ]),
    );
  });

  it('locates windsurf, cline, and gemini-cli configs', () => {
    const linux = knownConfigLocations('/home/u', 'linux');
    const p = (client: string) =>
      linux
        .filter((l) => l.client === client)
        .map((l) => l.path.split(path.sep).join('/'));
    expect(p('windsurf')).toEqual(['/home/u/.codeium/windsurf/mcp_config.json', '/home/u/.codeium/mcp_config.json']);
    expect(p('cline')).toEqual(['/home/u/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json']);
    expect(p('gemini-cli')).toEqual(['/home/u/.gemini/settings.json']);
  });

  it('locates kiro, roo-code, and zed configs', () => {
    const linux = knownConfigLocations('/home/u', 'linux');
    const p = (client: string) =>
      linux
        .filter((l) => l.client === client)
        .map((l) => l.path.split(path.sep).join('/'));
    expect(p('kiro')).toEqual(['/home/u/.kiro/settings/mcp.json']);
    expect(p('roo-code')).toEqual(['/home/u/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json']);
    expect(p('zed')).toEqual(['/home/u/.config/zed/settings.json']);
    expect(linux.find((l) => l.client === 'zed')!.format).toBe('zed-settings-json');
  });

  it('locates the amp user settings', () => {
    const linux = knownConfigLocations('/home/u', 'linux');
    const amp = linux.filter((l) => l.client === 'amp');
    expect(amp.map((l) => l.path.split(path.sep).join('/'))).toEqual(['/home/u/.config/amp/settings.json']);
    expect(amp[0]!.format).toBe('amp-settings-json');
  });

  it('locates warp and generic agents configs', () => {
    const linux = knownConfigLocations('/home/u', 'linux');
    const p = (client: string) =>
      linux.filter((l) => l.client === client).map((l) => l.path.split(path.sep).join('/'));
    expect(p('warp')).toEqual(['/home/u/.warp/.mcp.json']);
    expect(p('agents')).toEqual(['/home/u/.agents/.mcp.json']);
    expect(linux.find((l) => l.client === 'warp')!.format).toBe('mcpServers-json');
  });

  it('locates the lmstudio mcp.json', () => {
    const linux = knownConfigLocations('/home/u', 'linux');
    const lm = linux.filter((l) => l.client === 'lmstudio');
    expect(lm.map((l) => l.path.split(path.sep).join('/'))).toEqual([
      '/home/u/.lmstudio/mcp.json',
      '/home/u/.cache/lm-studio/mcp.json',
    ]);
    expect(lm[0]!.format).toBe('mcpServers-json');
    const win = knownConfigLocations('C:\\Users\\u', 'win32').filter((l) => l.client === 'lmstudio');
    expect(win).toHaveLength(2);
  });

  it('locates the continue.dev global config', () => {
    const linux = knownConfigLocations('/home/u', 'linux');
    const cont = linux.filter((l) => l.client === 'continue');
    expect(cont.map((l) => l.path.split(path.sep).join('/'))).toEqual(['/home/u/.continue/config.yaml']);
    expect(cont[0]!.format).toBe('continue-yaml');
  });

  it('uses platform-specific paths', () => {
    const mac = knownConfigLocations('/Users/u', 'darwin').find((l) => l.client === 'claude-desktop')!;
    // separator-agnostic: path.join emits `\` when the suite runs on Windows
    expect(mac.path.split(path.sep).join('/')).toContain('Library/Application Support');
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

describe('parseZedSettingsJson', () => {
  it('parses context_servers with JSONC comments and trailing commas', () => {
    const raw = `{
  // UI settings elsewhere
  "theme": "One Dark", /* block comment */
  "context_servers": {
    "local": { "command": "npx", "args": ["-y", "server-fs"], "env": { "K": "v" }, },
    "remote": { "url": "https://mcp.example.com/mcp", "headers": { "Authorization": "Bearer x" } },
  },
}`;
    const servers = parseZedSettingsJson(raw, loc('zed', 'zed-settings-json'));
    expect(servers).toHaveLength(2);
    expect(servers[0]).toMatchObject({ name: 'local', command: 'npx', args: ['-y', 'server-fs'], env: { K: 'v' }, client: 'zed' });
    expect(servers[1]).toMatchObject({ name: 'remote', url: 'https://mcp.example.com/mcp' });
  });

  it('does not treat // inside strings as a comment', () => {
    const servers = parseZedSettingsJson(
      JSON.stringify({ context_servers: { r: { url: 'https://x.example/mcp' } } }),
      loc('zed', 'zed-settings-json'),
    );
    expect(servers[0]!.url).toBe('https://x.example/mcp');
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

  it('finds kiro and roo-code project-level configs', () => {
    const project = path.join(dir, 'proj2');
    fs.mkdirSync(path.join(project, '.kiro', 'settings'), { recursive: true });
    fs.writeFileSync(path.join(project, '.kiro', 'settings', 'mcp.json'), '{"mcpServers":{}}');
    fs.mkdirSync(path.join(project, '.roo'), { recursive: true });
    fs.writeFileSync(path.join(project, '.roo', 'mcp.json'), '{"mcpServers":{}}');

    const found = discoverConfigFiles({ homeDir: dir, projectDir: project, platform: 'linux' });
    expect(found.map((f) => f.client).sort()).toEqual(['kiro', 'roo-code']);
  });

  it('locates the qoder user settings.json', () => {
    const linux = knownConfigLocations('/home/u', 'linux');
    const q = linux.filter((l) => l.client === 'qoder');
    expect(q.map((l) => l.path.split(path.sep).join('/'))).toEqual(['/home/u/.qoder/settings.json']);
    expect(q[0]!.format).toBe('mcpServers-json');
  });

  it('finds qoder project-level configs', () => {
    const project = path.join(dir, 'proj5');
    fs.mkdirSync(path.join(project, '.qoder'), { recursive: true });
    fs.writeFileSync(path.join(project, '.qoder', 'settings.json'), '{"mcpServers":{}}');
    fs.writeFileSync(path.join(project, '.qoder', 'settings.local.json'), '{"mcpServers":{}}');

    const found = discoverConfigFiles({ homeDir: dir, projectDir: project, platform: 'linux' });
    expect(found.map((f) => f.client)).toEqual(['qoder', 'qoder']);
    expect(found.map((f) => path.basename(f.path)).sort()).toEqual(['settings.json', 'settings.local.json']);
  });

  it('finds the trae project-level config', () => {
    const project = path.join(dir, 'proj4');
    fs.mkdirSync(path.join(project, '.trae'), { recursive: true });
    fs.writeFileSync(path.join(project, '.trae', 'mcp.json'), '{"mcpServers":{}}');

    const found = discoverConfigFiles({ homeDir: dir, projectDir: project, platform: 'linux' });
    expect(found.map((f) => f.client)).toEqual(['trae']);
    expect(found[0]!.format).toBe('mcpServers-json');
  });

  it('finds every .continue/mcpServers/*.yaml workspace block', () => {
    const project = path.join(dir, 'proj3');
    fs.mkdirSync(path.join(project, '.continue', 'mcpServers'), { recursive: true });
    fs.writeFileSync(path.join(project, '.continue', 'mcpServers', 'a.yaml'), 'mcpServers: []\n');
    fs.writeFileSync(path.join(project, '.continue', 'mcpServers', 'b.yml'), 'mcpServers: []\n');
    fs.writeFileSync(path.join(project, '.continue', 'mcpServers', 'notes.txt'), 'ignored');

    const found = discoverConfigFiles({ homeDir: dir, projectDir: project, platform: 'linux' });
    expect(found.map((f) => path.basename(f.path)).sort()).toEqual(['a.yaml', 'b.yml']);
    expect(found.every((f) => f.client === 'continue' && f.format === 'continue-yaml')).toBe(true);
  });
});

describe('parseContinueYaml', () => {
  it('parses the mcpServers list with command, env, and url entries', () => {
    const raw = `name: My Config
version: 0.0.1
schema: v1
mcpServers:
  - name: browser
    command: npx
    args:
      - "@playwright/mcp@latest"
    env:
      K: v
  - name: remote
    type: streamable-http
    url: https://mcp.example.com/mcp
  - command: missing-name-is-skipped
`;
    const servers = parseContinueYaml(raw, loc('continue', 'continue-yaml'));
    expect(servers).toHaveLength(2);
    expect(servers[0]).toMatchObject({ name: 'browser', command: 'npx', args: ['@playwright/mcp@latest'], env: { K: 'v' }, client: 'continue' });
    expect(servers[1]).toMatchObject({ name: 'remote', url: 'https://mcp.example.com/mcp', transport: 'streamable-http' });
  });

  it('returns no servers for configs without an mcpServers list', () => {
    expect(parseContinueYaml('name: x\nmodels: []\n', loc('continue', 'continue-yaml'))).toEqual([]);
    expect(parseContinueYaml('', loc('continue', 'continue-yaml'))).toEqual([]);
  });
});

describe('parseAmpSettingsJson', () => {
  it('parses the amp.mcpServers key with standard entry shapes', () => {
    const raw = JSON.stringify({
      'amp.commands.allowlist': ['git status'],
      'amp.mcpServers': {
        playwright: { command: 'npx', args: ['-y', '@playwright/mcp@latest', '--headless'] },
        linear: { url: 'https://mcp.linear.app/sse' },
      },
    });
    const servers = parseAmpSettingsJson(raw, loc('amp', 'amp-settings-json'));
    expect(servers).toHaveLength(2);
    expect(servers[0]).toMatchObject({ name: 'playwright', command: 'npx', args: ['-y', '@playwright/mcp@latest', '--headless'], client: 'amp' });
    expect(servers[1]).toMatchObject({ name: 'linear', url: 'https://mcp.linear.app/sse' });
  });

  it('returns no servers when amp.mcpServers is absent', () => {
    expect(parseAmpSettingsJson('{}', loc('amp', 'amp-settings-json'))).toEqual([]);
  });
});

describe('skill-defined MCP servers', () => {
  it('parses a bare skill mcp.json map and SKILL.md frontmatter mcpServers', () => {
    const json = JSON.stringify({ 'chrome-devtools': { command: 'npx', args: ['-y', 'chrome-devtools-mcp@latest'] } });
    expect(parseSkillMcpJson(json, loc('skill', 'skill-mcp-json'))).toMatchObject([
      { name: 'chrome-devtools', command: 'npx', args: ['-y', 'chrome-devtools-mcp@latest'] },
    ]);
    const md = '---\nname: my-skill\nmcpServers:\n  linear:\n    url: https://mcp.linear.app/sse\n---\n\nBody.\n';
    expect(parseSkillFrontmatter(md, loc('skill', 'skill-frontmatter-yaml'))).toMatchObject([
      { name: 'linear', url: 'https://mcp.linear.app/sse' },
    ]);
    expect(parseSkillFrontmatter('---\nname: plain\n---\n\nBody.\n', loc('skill', 'skill-frontmatter-yaml'))).toEqual([]);
  });

  it('discovers skill servers under .agents/skills, frontmatter shadowing sibling mcp.json', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-skillsrv-'));
    const mk = (name: string, files: Record<string, string>) => {
      const d = path.join(dir, '.agents', 'skills', name);
      fs.mkdirSync(d, { recursive: true });
      for (const [f, content] of Object.entries(files)) fs.writeFileSync(path.join(d, f), content);
    };
    mk('json-only', { 'mcp.json': '{"a":{"command":"npx"}}', 'SKILL.md': '---\nname: json-only\n---\nBody.\n' });
    mk('frontmatter-wins', {
      'mcp.json': '{"ignored":{"command":"npx"}}',
      'SKILL.md': '---\nname: fm\nmcpServers:\n  b:\n    command: uvx\n---\nBody.\n',
    });
    const found = discoverConfigFiles({ homeDir: path.join(dir, 'nohome'), projectDir: dir, platform: 'linux' });
    expect(found.map((f) => [path.basename(path.dirname(f.path)), f.format]).sort()).toEqual([
      ['frontmatter-wins', 'skill-frontmatter-yaml'],
      ['json-only', 'skill-mcp-json'],
    ]);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
