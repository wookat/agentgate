import fs from 'node:fs';
import path from 'node:path';
import { ALL_RULES, Rule } from './rules/index.js';
import { Finding, McpServerConfig, ScanResult, ToolSurface } from './types.js';

const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.py', '.json', '.toml', '.yaml', '.yml', '.sh']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.venv', 'venv', '__pycache__', '.next']);
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

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.mcp.json') {
      if (entry.isDirectory()) continue;
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
    if (!SOURCE_EXTENSIONS.has(path.extname(file))) continue;
    const relPosix = path.relative(dir, file).split(path.sep).join('/');
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
    const rel = path.relative(dir, file);
    for (const rule of rules) {
      if (rule.checkSource) {
        findings.push(...rule.checkSource(rel, content).map((f) => ({ ...f, file: rel })));
      }
    }
  }
  return { findings, scannedServers: [], scannedFiles };
}

export function severityRank(sev: Finding['severity']): number {
  return ['info', 'low', 'medium', 'high', 'critical'].indexOf(sev);
}

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || a.target.localeCompare(b.target));
}
