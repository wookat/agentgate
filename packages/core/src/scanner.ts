import fs from 'node:fs';
import path from 'node:path';
import { ALL_RULES, Rule } from './rules/index.js';
import { SKILL_FILE } from './rules/skill-poisoning.js';
import { Finding, McpServerConfig, ScanResult, ToolSurface } from './types.js';

const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.py', '.json', '.toml', '.yaml', '.yml', '.sh', '.jsonc']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.venv', 'venv', '__pycache__', '.next']);
/** Hidden agent-config trees that may carry skill files. */
const AGENT_DOT_DIRS = new Set(['.agents', '.claude', '.cursor', '.codex', '.opencode', '.windsurf', '.clinerules', '.gemini', '.continue', '.trae', '.kiro', '.roo', '.github', '.amazonq', '.vscode', '.zed']);
/** Dot-dirs walked only for instruction files — their other contents (CI workflows) are not MCP server source. */
const SKILL_ONLY_DOT_DIRS = new Set(['.github']);
/** Dot-dirs walked only for editor settings/MCP configs — launch/task configs are not MCP server source. */
const SETTINGS_ONLY_DOT_DIRS = new Map([['.vscode', new Set(['settings.json', 'mcp.json'])], ['.zed', new Set(['settings.json'])]]);
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

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.mcp.json') {
      if (entry.isDirectory() && !AGENT_DOT_DIRS.has(entry.name)) continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
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
  for (const file of walk(dir)) {
    const relPosix = path.relative(dir, file).split(path.sep).join('/');
    const isSkill = SKILL_FILE.test(relPosix);
    if (!isSkill && !SOURCE_EXTENSIONS.has(path.extname(file))) continue;
    if (!isSkill && SKILL_ONLY_DOT_DIRS.has(relPosix.split('/')[0]!)) continue;
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
  for (const file of walk(dir)) {
    const relPosix = path.relative(dir, file).split(path.sep).join('/');
    if (!SKILL_FILE.test(relPosix)) continue;
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
