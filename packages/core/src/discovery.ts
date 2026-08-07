import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import YAML from 'yaml';
import { McpServerConfig } from './types.js';

export interface ClientConfigLocation {
  client: string;
  path: string;
  format:
    | 'mcpServers-json'
    | 'vscode-mcp-json'
    | 'codex-toml'
    | 'opencode-json'
    | 'zed-settings-json'
    | 'continue-yaml'
    | 'amp-settings-json';
}

/**
 * Well-known MCP client config locations, relative to a home directory.
 * Covers Claude (Desktop + Code), Cursor, VS Code, Codex, OpenCode,
 * Windsurf, Cline, Gemini CLI, Kiro, Roo Code, Zed, Continue.dev, and Amp.
 */
export function knownConfigLocations(homeDir = os.homedir(), platform = process.platform): ClientConfigLocation[] {
  const locations: ClientConfigLocation[] = [];
  const push = (client: string, p: string, format: ClientConfigLocation['format'] = 'mcpServers-json') =>
    locations.push({ client, path: p, format });

  // Claude Desktop
  if (platform === 'darwin') {
    push('claude-desktop', path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'));
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('claude-desktop', path.join(appData, 'Claude', 'claude_desktop_config.json'));
  } else {
    push('claude-desktop', path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json'));
  }
  // Claude Code
  push('claude-code', path.join(homeDir, '.claude.json'));
  // Cursor
  push('cursor', path.join(homeDir, '.cursor', 'mcp.json'));
  // VS Code (user-level MCP config)
  if (platform === 'darwin') {
    push('vscode', path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', 'mcp.json'), 'vscode-mcp-json');
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('vscode', path.join(appData, 'Code', 'User', 'mcp.json'), 'vscode-mcp-json');
  } else {
    push('vscode', path.join(homeDir, '.config', 'Code', 'User', 'mcp.json'), 'vscode-mcp-json');
  }
  // Codex CLI
  push('codex', path.join(homeDir, '.codex', 'config.toml'), 'codex-toml');
  // OpenCode
  push('opencode', path.join(homeDir, '.config', 'opencode', 'opencode.json'), 'opencode-json');
  // Windsurf (Cascade) — global config only
  push('windsurf', path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'));
  push('windsurf', path.join(homeDir, '.codeium', 'mcp_config.json'));
  // Cline (VS Code extension, own settings file under globalStorage)
  const clineRel = path.join('globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
  if (platform === 'darwin') {
    push('cline', path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', clineRel));
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('cline', path.join(appData, 'Code', 'User', clineRel));
  } else {
    push('cline', path.join(homeDir, '.config', 'Code', 'User', clineRel));
  }
  // Gemini CLI — mcpServers key inside settings.json
  push('gemini-cli', path.join(homeDir, '.gemini', 'settings.json'));
  // Kiro — user-level mcp.json, standard mcpServers format
  push('kiro', path.join(homeDir, '.kiro', 'settings', 'mcp.json'));
  // Roo Code (VS Code extension, own settings file under globalStorage)
  const rooRel = path.join('globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'mcp_settings.json');
  if (platform === 'darwin') {
    push('roo-code', path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', rooRel));
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('roo-code', path.join(appData, 'Code', 'User', rooRel));
  } else {
    push('roo-code', path.join(homeDir, '.config', 'Code', 'User', rooRel));
  }
  // Continue.dev — mcpServers list inside config.yaml
  push('continue', path.join(homeDir, '.continue', 'config.yaml'), 'continue-yaml');
  // Amp (Sourcegraph) — `amp.mcpServers` key inside user settings
  push('amp', path.join(homeDir, '.config', 'amp', 'settings.json'), 'amp-settings-json');
  // Zed — context_servers key inside settings.json (JSONC)
  if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('zed', path.join(appData, 'Zed', 'settings.json'), 'zed-settings-json');
  } else {
    push('zed', path.join(homeDir, '.config', 'zed', 'settings.json'), 'zed-settings-json');
  }

  return locations;
}

/** Project-level config locations relative to a project directory. */
export function projectConfigLocations(projectDir: string): ClientConfigLocation[] {
  return [
    { client: 'cursor', path: path.join(projectDir, '.cursor', 'mcp.json'), format: 'mcpServers-json' },
    { client: 'vscode', path: path.join(projectDir, '.vscode', 'mcp.json'), format: 'vscode-mcp-json' },
    { client: 'claude-code', path: path.join(projectDir, '.mcp.json'), format: 'mcpServers-json' },
    { client: 'opencode', path: path.join(projectDir, 'opencode.json'), format: 'opencode-json' },
    { client: 'gemini-cli', path: path.join(projectDir, '.gemini', 'settings.json'), format: 'mcpServers-json' },
    { client: 'kiro', path: path.join(projectDir, '.kiro', 'settings', 'mcp.json'), format: 'mcpServers-json' },
    { client: 'roo-code', path: path.join(projectDir, '.roo', 'mcp.json'), format: 'mcpServers-json' },
    { client: 'amp', path: path.join(projectDir, '.amp', 'settings.json'), format: 'amp-settings-json' },
    { client: 'unknown', path: path.join(projectDir, 'mcp.json'), format: 'mcpServers-json' },
    ...continueWorkspaceLocations(projectDir),
  ];
}

/** Continue.dev workspace MCP blocks: every `.continue/mcpServers/*.yaml` file. */
function continueWorkspaceLocations(projectDir: string): ClientConfigLocation[] {
  const dir = path.join(projectDir, '.continue', 'mcpServers');
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return entries
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort()
    .map((f) => ({ client: 'continue', path: path.join(dir, f), format: 'continue-yaml' as const }));
}

/** Discover existing config files among the known locations. */
export function discoverConfigFiles(opts: { homeDir?: string; projectDir?: string; platform?: NodeJS.Platform } = {}): ClientConfigLocation[] {
  const candidates = [
    ...knownConfigLocations(opts.homeDir, opts.platform),
    ...(opts.projectDir ? projectConfigLocations(opts.projectDir) : []),
  ];
  return candidates.filter((c) => fs.existsSync(c.path));
}

/** Parse a client config file into normalized MCP server entries. */
export function parseConfigFile(location: ClientConfigLocation): McpServerConfig[] {
  const raw = fs.readFileSync(location.path, 'utf8');
  switch (location.format) {
    case 'codex-toml':
      return parseCodexToml(raw, location);
    case 'vscode-mcp-json':
      return parseVsCodeJson(raw, location);
    case 'opencode-json':
      return parseOpenCodeJson(raw, location);
    case 'zed-settings-json':
      return parseZedSettingsJson(raw, location);
    case 'continue-yaml':
      return parseContinueYaml(raw, location);
    case 'amp-settings-json':
      return parseAmpSettingsJson(raw, location);
    default:
      return parseMcpServersJson(raw, location);
  }
}

function toStringRecord(value: unknown): Record<string, string> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) out[k] = String(v);
  return out;
}

function normalizeEntry(name: string, entry: Record<string, unknown>, location: ClientConfigLocation): McpServerConfig {
  return {
    name,
    command: typeof entry.command === 'string' ? entry.command : undefined,
    args: Array.isArray(entry.args) ? entry.args.map(String) : undefined,
    env: toStringRecord(entry.env),
    url: typeof entry.url === 'string' ? entry.url : typeof entry.serverUrl === 'string' ? entry.serverUrl : undefined,
    headers: toStringRecord(entry.headers),
    transport: typeof entry.type === 'string' ? entry.type : typeof entry.transport === 'string' ? entry.transport : undefined,
    source: location.path,
    client: location.client,
  };
}

function collectServers(map: unknown, location: ClientConfigLocation): McpServerConfig[] {
  if (typeof map !== 'object' || map === null) return [];
  const out: McpServerConfig[] = [];
  for (const [name, entry] of Object.entries(map)) {
    if (typeof entry === 'object' && entry !== null) {
      out.push(normalizeEntry(name, entry as Record<string, unknown>, location));
    }
  }
  return out;
}

/** Claude Desktop / Cursor / generic `{ "mcpServers": { ... } }` format. Also handles Claude Code `~/.claude.json` (top-level + per-project). */
export function parseMcpServersJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(raw) as Record<string, unknown>;
  const out = collectServers(json.mcpServers, location);
  // Claude Code stores per-project servers under `projects.<path>.mcpServers`
  if (typeof json.projects === 'object' && json.projects !== null) {
    for (const project of Object.values(json.projects as Record<string, unknown>)) {
      if (typeof project === 'object' && project !== null) {
        out.push(...collectServers((project as Record<string, unknown>).mcpServers, location));
      }
    }
  }
  return out;
}

/** VS Code `mcp.json`: `{ "servers": { ... } }` (also accepts `mcpServers`). */
export function parseVsCodeJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(raw) as Record<string, unknown>;
  return [...collectServers(json.servers, location), ...collectServers(json.mcpServers, location)];
}

/** OpenCode `opencode.json`: `{ "mcp": { name: { type, command: [...], environment, url, headers } } }`. */
export function parseOpenCodeJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(raw) as Record<string, unknown>;
  const map = json.mcp;
  if (typeof map !== 'object' || map === null) return [];
  const out: McpServerConfig[] = [];
  for (const [name, entryRaw] of Object.entries(map)) {
    if (typeof entryRaw !== 'object' || entryRaw === null) continue;
    const entry = entryRaw as Record<string, unknown>;
    const cmd = Array.isArray(entry.command) ? entry.command.map(String) : undefined;
    out.push({
      name,
      command: cmd?.[0],
      args: cmd?.slice(1),
      env: toStringRecord(entry.environment) ?? toStringRecord(entry.env),
      url: typeof entry.url === 'string' ? entry.url : undefined,
      headers: toStringRecord(entry.headers),
      transport: typeof entry.type === 'string' ? entry.type : undefined,
      source: location.path,
      client: location.client,
    });
  }
  return out;
}

/** Continue.dev `config.yaml` / `.continue/mcpServers/*.yaml`: `mcpServers` is a list of `{ name, command, args, env, url, type }`. */
export function parseContinueYaml(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const doc = YAML.parse(raw) as Record<string, unknown> | null;
  if (typeof doc !== 'object' || doc === null || !Array.isArray(doc.mcpServers)) return [];
  const out: McpServerConfig[] = [];
  for (const entryRaw of doc.mcpServers) {
    if (typeof entryRaw !== 'object' || entryRaw === null) continue;
    const entry = entryRaw as Record<string, unknown>;
    const name = typeof entry.name === 'string' ? entry.name : undefined;
    if (!name) continue;
    out.push(normalizeEntry(name, entry, location));
  }
  return out;
}

/** Amp `settings.json` (user `~/.config/amp/settings.json` or workspace `.amp/settings.json`): `{ "amp.mcpServers": { ... } }` — standard entry shape. */
export function parseAmpSettingsJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(raw) as Record<string, unknown>;
  return collectServers(json['amp.mcpServers'], location);
}

/** Zed `settings.json`: `{ "context_servers": { ... } }` — same entry shape as mcpServers, JSONC allowed. */
export function parseZedSettingsJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(stripJsonComments(raw)) as Record<string, unknown>;
  return collectServers(json.context_servers, location);
}

/** Remove `//` and `/* *\/` comments plus trailing commas (outside strings) so JSONC settings parse. */
function stripJsonComments(raw: string): string {
  let out = '';
  let inString = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!;
    if (inString) {
      out += ch;
      if (ch === '\\') {
        out += raw[++i] ?? '';
      } else if (ch === '"') {
        inString = false;
      }
    } else if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === '/' && raw[i + 1] === '/') {
      while (i < raw.length && raw[i] !== '\n') i++;
      out += '\n';
    } else if (ch === '/' && raw[i + 1] === '*') {
      i += 2;
      while (i < raw.length && !(raw[i] === '*' && raw[i + 1] === '/')) i++;
      i++;
    } else {
      out += ch;
    }
  }
  return out.replace(/,(\s*[}\]])/g, '$1');
}

/**
 * Codex CLI `config.toml`: `[mcp_servers.<name>]` tables with `command`, `args`, `env`, `url`.
 * Minimal TOML subset parser — enough for the flat key/value + array shapes Codex uses.
 */
export function parseCodexToml(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const servers = new Map<string, Record<string, unknown>>();
  let current: Record<string, unknown> | undefined;
  let currentEnv: Record<string, string> | undefined;

  for (const lineRaw of raw.split(/\r?\n/)) {
    const line = lineRaw.trim();
    if (line === '' || line.startsWith('#')) continue;
    const tableMatch = line.match(/^\[(.+)\]$/);
    if (tableMatch) {
      const table = tableMatch[1]!.trim();
      const serverMatch = table.match(/^mcp_servers\.(?:"([^"]+)"|([A-Za-z0-9_-]+))(?:\.(env))?$/);
      if (serverMatch) {
        const name = serverMatch[1] ?? serverMatch[2]!;
        if (!servers.has(name)) servers.set(name, {});
        current = servers.get(name)!;
        if (serverMatch[3] === 'env') {
          currentEnv = (current.env as Record<string, string> | undefined) ?? {};
          current.env = currentEnv;
        } else {
          currentEnv = undefined;
        }
      } else {
        current = undefined;
        currentEnv = undefined;
      }
      continue;
    }
    if (!current) continue;
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
    if (!kv) continue;
    const key = kv[1]!;
    const value = parseTomlValue(kv[2]!);
    if (currentEnv) {
      currentEnv[key] = String(value);
    } else if (key === 'env' && typeof value === 'object' && value !== null) {
      current.env = value;
    } else {
      current[key] = value;
    }
  }

  const out: McpServerConfig[] = [];
  for (const [name, entry] of servers) {
    out.push(normalizeEntry(name, entry, location));
  }
  return out;
}

function parseTomlValue(raw: string): unknown {
  const s = raw.trim();
  if (s.startsWith('[')) {
    const inner = s.replace(/^\[/, '').replace(/\]\s*(#.*)?$/, '');
    return inner
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p !== '')
      .map((p) => parseTomlValue(p));
  }
  if (s.startsWith('{')) {
    const inner = s.replace(/^\{/, '').replace(/\}\s*(#.*)?$/, '');
    const out: Record<string, string> = {};
    for (const pair of inner.split(',')) {
      const m = pair.match(/^\s*([A-Za-z0-9_-]+)\s*=\s*(.+?)\s*$/);
      if (m) out[m[1]!] = String(parseTomlValue(m[2]!));
    }
    return out;
  }
  if (s.startsWith('"') || s.startsWith("'")) {
    return s.slice(1, -1);
  }
  const noComment = s.replace(/\s+#.*$/, '');
  if (noComment === 'true') return true;
  if (noComment === 'false') return false;
  const num = Number(noComment);
  return Number.isNaN(num) ? noComment : num;
}

/** Discover and parse all MCP server entries visible to known clients. */
export function discoverServers(opts: { homeDir?: string; projectDir?: string; platform?: NodeJS.Platform } = {}): {
  servers: McpServerConfig[];
  files: string[];
  errors: { file: string; error: string }[];
} {
  const files = discoverConfigFiles(opts);
  const servers: McpServerConfig[] = [];
  const errors: { file: string; error: string }[] = [];
  for (const file of files) {
    try {
      servers.push(...parseConfigFile(file));
    } catch (err) {
      errors.push({ file: file.path, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return { servers, files: files.map((f) => f.path), errors };
}
