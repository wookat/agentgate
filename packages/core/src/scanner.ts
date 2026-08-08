import fs from 'node:fs';
import path from 'node:path';
import { ALL_RULES, Rule } from './rules/index.js';
import { COPILOT_HOOKS_FILE, COPILOT_SETTINGS_FILE, CRUSHRC_FILE, KIRO_AGENT_HOOK_FILE, PLUGIN_MANIFEST_FILE, SKILL_FILE } from './rules/skill-poisoning.js';
import { COPILOT_EXTENSION_FILE } from './rules/rce-vectors.js';
import { MARKETPLACE_CATALOG_FILE } from './rules/supply-chain.js';
import { Finding, McpServerConfig, ScanResult, ToolSurface } from './types.js';

const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.py', '.json', '.toml', '.yaml', '.yml', '.sh', '.jsonc']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.venv', 'venv', '__pycache__', '.next']);
/** Hidden agent-config trees that may carry skill files. */
const AGENT_DOT_DIRS = new Set(['.agents', '.agent', '.claude', '.crush', '.cursor', '.codex', '.goose', '.opencode', '.windsurf', '.cline', '.clinerules', '.kilocode', '.kilo', '.gemini', '.continue', '.trae', '.kiro', '.roo', '.github', '.amazonq', '.vscode', '.zed', '.claude-plugin', '.codex-plugin', '.cursor-plugin', '.qwen', '.plugin', '.junie', '.openhands', '.factory', '.factory-plugin', '.goose-plugin']);
/** Dot-dirs walked only for instruction files — their other contents (CI workflows) are not MCP server source. */
const SKILL_ONLY_DOT_DIRS = new Set(['.github']);
/** Dot-dirs walked only for editor settings/MCP configs — launch/task configs are not MCP server source. */
const SETTINGS_ONLY_DOT_DIRS = new Map([['.vscode', new Set(['settings.json', 'mcp.json', 'tasks.json'])], ['.zed', new Set(['settings.json'])]]);
const MAX_FILE_BYTES = 1024 * 1024;

/** Run config-level rules over normalized MCP server entries. */
export function scanServers(servers: McpServerConfig[], rules: Rule[] = ALL_RULES): Finding[] {
  const findings: Finding[] = [];
  for (const server of servers) {
    for (const rule of rules) {
      if (rule.checkServer) findings.push(...rule.checkServer(server));
    }
  }
  return findings;
}

/** Run tool-level rules over a server's live/locked tool surface. */
export function scanTools(serverName: string, tools: ToolSurface[], rules: Rule[] = ALL_RULES): Finding[] {
  const findings: Finding[] = [];
  for (const rule of rules) {
    for (const tool of tools) {
      if (rule.checkTool) findings.push(...rule.checkTool(tool, serverName));
    }
    if (rule.checkToolset) findings.push(...rule.checkToolset(tools, serverName));
  }
  return findings;
}

/** Run cross-server rules over every scanned server's tool surface at once. */
export function scanConfiguration(surfaces: Record<string, ToolSurface[]>, rules: Rule[] = ALL_RULES): Finding[] {
  if (Object.keys(surfaces).length < 2) return [];
  const findings: Finding[] = [];
  for (const rule of rules) {
    if (rule.checkConfiguration) findings.push(...rule.checkConfiguration(surfaces));
  }
  return findings;
}

function* walk(dir: string, rootReal?: string, seenDirs?: Set<string>): Generator<string> {
  if (rootReal === undefined) {
    try {
      rootReal = fs.realpathSync(dir);
    } catch {
      return;
    }
    seenDirs = new Set([rootReal]);
  }
  // Sort entries so scan order — and which alias path a realpath-deduped
  // symlink tree is reported under — is deterministic across filesystems.
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    let isDir = entry.isDirectory();
    let isFile = entry.isFile();
    if (entry.isSymbolicLink()) {
      // Repos alias shared skill/config trees with committed symlinks; follow
      // them, but only inside the scan root, and never into a directory cycle.
      let real;
      try {
        real = fs.realpathSync(full);
      } catch {
        continue;
      }
      if (real !== rootReal && !real.startsWith(rootReal + path.sep)) continue;
      let stat;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }
      isDir = stat.isDirectory();
      isFile = stat.isFile();
    }
    if (entry.name.startsWith('.') && entry.name !== '.mcp.json') {
      if (isDir && !AGENT_DOT_DIRS.has(entry.name)) continue;
    }
    if (isDir) {
      if (SKIP_DIRS.has(entry.name)) continue;
      // Dedupe directories by real path so symlink-aliased trees (repos that
      // mirror one skills dir across many client dirs) are walked only once.
      let real;
      try {
        real = fs.realpathSync(full);
      } catch {
        continue;
      }
      if (seenDirs!.has(real)) continue;
      seenDirs!.add(real);
      yield* walk(full, rootReal, seenDirs);
    } else if (isFile) {
      yield full;
    }
  }
}

/** Convert a simple glob (supports `**`, `*`, `?`) to a RegExp over posix-style relative paths. */
export function globToRegExp(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .split('**/')
    .map((part) =>
      part
        .split('**')
        .map((p) => p.replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]'))
        .join('.*'),
    )
    .join('(?:.*/)?');
  return new RegExp(`^${escaped}$`);
}

/** Plugin metadata dir names whose `plugin.json` marks a plugin root. */
const PLUGIN_META_NAMES = ['.claude-plugin', '.plugin', '.factory-plugin', '.codex-plugin', '.cursor-plugin', '.goose-plugin'];
const PLUGIN_COMPONENT_MD = /(^|\/)(skills|commands|agents|output-styles)\/.+\.md$/gi;

/**
 * Markdown under a plugin root's `skills/`, `commands/`, `agents/`, or
 * `output-styles/` component dirs is installed as model-facing content for
 * everyone who installs the plugin. Gated on a sibling plugin manifest so
 * generic `commands/` or `agents/` doc trees are not misread as agent
 * instructions.
 */
function isPluginComponentSkill(scanRoot: string, relPosix: string, cache: Map<string, boolean>): boolean {
  PLUGIN_COMPONENT_MD.lastIndex = 0;
  for (let m = PLUGIN_COMPONENT_MD.exec(relPosix); m; m = PLUGIN_COMPONENT_MD.exec(relPosix)) {
    const root = relPosix.slice(0, m.index);
    let hit = cache.get(root);
    if (hit === undefined) {
      hit = PLUGIN_META_NAMES.some((meta) => fs.existsSync(path.join(scanRoot, ...root.split('/').filter(Boolean), meta, 'plugin.json')));
      cache.set(root, hit);
    }
    if (hit) return true;
    PLUGIN_COMPONENT_MD.lastIndex = m.index + 1;
  }
  return false;
}

interface PluginComponentDecl {
  files: Set<string>;
  dirs: string[];
  globs: RegExp[];
}

/** Read the manifest-declared commands/agents/skills paths for a plugin root, if any. */
function readPluginComponentDecl(scanRoot: string, rootPrefix: string): PluginComponentDecl | null {
  let manifest: unknown;
  for (const meta of PLUGIN_META_NAMES) {
    const p = path.join(scanRoot, ...rootPrefix.split('/').filter(Boolean), meta, 'plugin.json');
    if (!fs.existsSync(p)) continue;
    try {
      manifest = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
      return null;
    }
    break;
  }
  if (typeof manifest !== 'object' || manifest === null) return null;
  const decl: PluginComponentDecl = { files: new Set(), dirs: [], globs: [] };
  let any = false;
  for (const key of ['commands', 'agents', 'skills'] as const) {
    const value = (manifest as Record<string, unknown>)[key];
    const entries = Array.isArray(value) ? value : [value];
    for (const entry of entries) {
      const raw = typeof entry === 'string' ? entry : typeof entry === 'object' && entry !== null && typeof (entry as { path?: unknown }).path === 'string' ? (entry as { path: string }).path : undefined;
      if (raw === undefined) continue;
      const norm = raw.replace(/^\.\//, '').replace(/\/+$/, '');
      if (norm.startsWith('/') || norm.split('/').includes('..')) continue;
      any = true;
      if (/[*?]/.test(norm)) decl.globs.push(globToRegExp(norm));
      else if (norm.toLowerCase().endsWith('.md')) decl.files.add(norm);
      else decl.dirs.push(norm === '.' ? '' : norm);
    }
  }
  return any ? decl : null;
}

/**
 * Plugin manifests may point `commands`/`agents`/`skills` at custom paths
 * (files, directories, or globs) outside the conventional component dirs;
 * markdown reachable through those declarations is installed content too.
 */
function isDeclaredPluginComponentMd(scanRoot: string, relPosix: string, cache: Map<string, PluginComponentDecl | null>): boolean {
  if (!relPosix.toLowerCase().endsWith('.md')) return false;
  const segs = relPosix.split('/');
  for (let i = 0; i < segs.length; i++) {
    const rootPrefix = segs.slice(0, i).join('/');
    let decl = cache.get(rootPrefix);
    if (decl === undefined) {
      decl = readPluginComponentDecl(scanRoot, rootPrefix);
      cache.set(rootPrefix, decl);
    }
    if (!decl) continue;
    const inner = segs.slice(i).join('/');
    if (decl.files.has(inner)) return true;
    if (decl.globs.some((re) => re.test(inner))) return true;
    if (decl.dirs.some((d) => d === '' || inner === d || inner.startsWith(`${d}/`))) return true;
  }
  return false;
}

export interface ScanRepoOptions {
  rules?: Rule[];
  /** Glob patterns (relative to the scan root) to exclude. */
  ignore?: string[];
}

/** Run source-level rules over a repository directory. */
export function scanRepo(dir: string, opts: ScanRepoOptions = {}): ScanResult {
  const rules = opts.rules ?? ALL_RULES;
  const ignoreRes = (opts.ignore ?? []).map(globToRegExp);
  const findings: Finding[] = [];
  const scannedFiles: string[] = [];
  const pluginRootCache = new Map<string, boolean>();
  const pluginDeclCache = new Map<string, PluginComponentDecl | null>();
  for (const file of walk(dir)) {
    const relPosix = path.relative(dir, file).split(path.sep).join('/');
    const isSkill = SKILL_FILE.test(relPosix) || isPluginComponentSkill(dir, relPosix, pluginRootCache) || isDeclaredPluginComponentMd(dir, relPosix, pluginDeclCache);
    if (!isSkill && !SOURCE_EXTENSIONS.has(path.extname(file)) && !KIRO_AGENT_HOOK_FILE.test(relPosix) && !CRUSHRC_FILE.test(relPosix)) continue;
    if (!isSkill && SKILL_ONLY_DOT_DIRS.has(relPosix.split('/')[0]!) && !COPILOT_HOOKS_FILE.test(relPosix) && !COPILOT_SETTINGS_FILE.test(relPosix) && !PLUGIN_MANIFEST_FILE.test(relPosix) && !MARKETPLACE_CATALOG_FILE.test(relPosix) && !COPILOT_EXTENSION_FILE.test(relPosix)) continue;
    const settingsOnly = relPosix
      .split('/')
      .slice(0, -1)
      .map((seg) => SETTINGS_ONLY_DOT_DIRS.get(seg))
      .find((s) => s !== undefined);
    if (settingsOnly && !settingsOnly.has(path.basename(file))) continue;
    if (ignoreRes.some((re) => re.test(relPosix))) continue;
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }
    if (stat.size > MAX_FILE_BYTES) continue;
    const content = fs.readFileSync(file, 'utf8');
    scannedFiles.push(file);
    // Posix-style so path-based rule heuristics (test/fixture trees) work on Windows too.
    for (const rule of rules) {
      if (isSkill) {
        if (rule.checkSkill) findings.push(...rule.checkSkill(relPosix, content).map((f) => ({ ...f, file: relPosix })));
      } else if (rule.checkSource) {
        findings.push(...rule.checkSource(relPosix, content).map((f) => ({ ...f, file: relPosix })));
      }
    }
  }
  return { findings, scannedServers: [], scannedFiles };
}

/** Collect skill/instruction files under a directory: posix-relative path → content. */
export function collectSkillFiles(dir: string, opts: { ignore?: string[] } = {}): Record<string, string> {
  const ignoreRes = (opts.ignore ?? []).map(globToRegExp);
  const out: Record<string, string> = {};
  const pluginRootCache = new Map<string, boolean>();
  const pluginDeclCache = new Map<string, PluginComponentDecl | null>();
  for (const file of walk(dir)) {
    const relPosix = path.relative(dir, file).split(path.sep).join('/');
    if (!SKILL_FILE.test(relPosix) && !isPluginComponentSkill(dir, relPosix, pluginRootCache) && !isDeclaredPluginComponentMd(dir, relPosix, pluginDeclCache)) continue;
    if (ignoreRes.some((re) => re.test(relPosix))) continue;
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }
    if (stat.size > MAX_FILE_BYTES) continue;
    out[relPosix] = fs.readFileSync(file, 'utf8');
  }
  return out;
}

export function severityRank(sev: Finding['severity']): number {
  return ['info', 'low', 'medium', 'high', 'critical'].indexOf(sev);
}

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || a.target.localeCompare(b.target));
}
