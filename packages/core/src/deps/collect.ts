import fs from 'node:fs';
import path from 'node:path';
import { builtinModules } from 'node:module';
import { parse as parseToml } from 'smol-toml';
import { globToRegExp } from '../scanner.js';
import { PYTHON_STDLIB } from './popular.js';
import { DependencyRef, DepEcosystem, DepOrigin } from './types.js';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.venv', 'venv', '__pycache__', '.next']);
const MAX_FILE_BYTES = 1024 * 1024;
const JS_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.jsx', '.tsx']);

const NODE_BUILTINS = new Set(builtinModules);
const PY_STDLIB = new Set(PYTHON_STDLIB);

export interface CollectOptions {
  /** Glob patterns (relative to the scan root) to exclude. */
  ignore?: string[];
  /** Also extract bare import specifiers from source files (default true). */
  includeImports?: boolean;
}

export interface CollectResult {
  refs: DependencyRef[];
  scannedFiles: string[];
  /** Non-fatal problems, e.g. unparseable manifests. */
  warnings: string[];
}

/** Remove Python string literals (incl. docstrings) and # comments so example code inside them is not treated as real imports. */
export function stripPyLiterals(content: string): string {
  return content
    .replace(/("""|''')[\s\S]*?\1/g, '')
    .replace(/(["'])(?:\\.|(?!\1).)*\1/g, "''")
    .replace(/#[^\n]*/g, '');
}

/** Remove JS/TS block and line comments so commented-out imports are not collected. */
export function stripJsComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
}

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

/** Reduce an npm import specifier to its package name (`@scope/pkg/sub` → `@scope/pkg`). */
export function npmPackageFromSpecifier(spec: string): string | undefined {
  if (spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('#') || spec.includes(':')) return undefined;
  const parts = spec.split('/');
  const name = spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!;
  if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i.test(name)) return undefined;
  if (NODE_BUILTINS.has(name)) return undefined;
  return name;
}

const JS_IMPORT_RE = /(?:^|[^.\w])(?:import|export)\s+(?:[\w$*\s{},]+\s+from\s+)?['"]([^'"\n]+)['"]|require\(\s*['"]([^'"\n]+)['"]\s*\)|import\(\s*['"]([^'"\n]+)['"]\s*\)/gm;

export function extractJsImports(content: string): string[] {
  const names = new Set<string>();
  for (const m of content.matchAll(JS_IMPORT_RE)) {
    const spec = m[1] ?? m[2] ?? m[3];
    if (!spec) continue;
    const name = npmPackageFromSpecifier(spec);
    if (name) names.add(name);
  }
  return [...names];
}

const PY_IMPORT_RE = /^\s*(?:import\s+([\w.]+(?:\s*,\s*[\w.]+)*)|from\s+([\w.]+)\s+import\b)/gm;

export function extractPyImports(content: string): string[] {
  const names = new Set<string>();
  for (const m of content.matchAll(PY_IMPORT_RE)) {
    const mods = m[1] ? m[1].split(',') : [m[2]!];
    for (const mod of mods) {
      const top = mod.trim().split('.')[0]!;
      if (!top || top.startsWith('_') || PY_STDLIB.has(top)) continue;
      names.add(top);
    }
  }
  return [...names];
}

/** Strip a PEP 508 requirement line down to the distribution name. */
export function parseRequirementLine(line: string): string | undefined {
  const stripped = line.replace(/(^|\s)#.*$/, '').trim();
  if (!stripped || stripped.startsWith('-') || stripped.includes('://')) return undefined;
  const m = /^([A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?)/.exec(stripped);
  return m?.[1];
}

function refsFromPackageJson(file: string, content: string, localNames: Set<string>, warnings: string[]): DependencyRef[] {
  const refs: DependencyRef[] = [];
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch (err) {
    warnings.push(`${file}: unparseable JSON, skipped (${err instanceof Error ? err.message.split('\n')[0] : 'parse error'})`);
    return refs;
  }
  if (typeof data !== 'object' || data === null) return refs;
  const own = (data as { name?: unknown }).name;
  if (typeof own === 'string') localNames.add(own);
  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const) {
    const deps = (data as Record<string, unknown>)[section];
    if (typeof deps !== 'object' || deps === null) continue;
    for (const [name, spec] of Object.entries(deps as Record<string, unknown>)) {
      // non-registry specifiers (workspace:, file:, git urls, aliases) are still
      // declared — record them so imports don't get flagged — but not verified
      if (typeof spec === 'string' && /^(workspace:|file:|link:|git|https?:|npm:)/.test(spec)) {
        localNames.add(name);
        continue;
      }
      refs.push({ name, ecosystem: 'npm', origin: 'manifest', file, context: section });
    }
  }
  return refs;
}

function refsFromRequirementsTxt(file: string, content: string): DependencyRef[] {
  const refs: DependencyRef[] = [];
  for (const line of content.split('\n')) {
    const name = parseRequirementLine(line);
    if (name) refs.push({ name, ecosystem: 'pypi', origin: 'manifest', file, context: 'requirements' });
  }
  return refs;
}

function refsFromPyproject(file: string, content: string, warnings: string[]): DependencyRef[] {
  const refs: DependencyRef[] = [];
  let data: Record<string, unknown>;
  try {
    data = parseToml(content) as Record<string, unknown>;
  } catch (err) {
    warnings.push(`${file}: unparseable TOML, skipped (${err instanceof Error ? err.message.split('\n')[0] : 'parse error'})`);
    return refs;
  }
  const push = (name: string | undefined, context: string): void => {
    if (name && name.toLowerCase() !== 'python') refs.push({ name, ecosystem: 'pypi', origin: 'manifest', file, context });
  };
  const project = data['project'] as Record<string, unknown> | undefined;
  if (project) {
    for (const dep of (project['dependencies'] as unknown[] | undefined) ?? []) {
      if (typeof dep === 'string') push(parseRequirementLine(dep), 'project.dependencies');
    }
    const optional = project['optional-dependencies'] as Record<string, unknown> | undefined;
    for (const [group, deps] of Object.entries(optional ?? {})) {
      for (const dep of (deps as unknown[] | undefined) ?? []) {
        if (typeof dep === 'string') push(parseRequirementLine(dep), `project.optional-dependencies.${group}`);
      }
    }
  }
  const tool = data['tool'] as Record<string, unknown> | undefined;
  const poetry = tool?.['poetry'] as Record<string, unknown> | undefined;
  for (const section of ['dependencies', 'dev-dependencies'] as const) {
    const deps = poetry?.[section] as Record<string, unknown> | undefined;
    for (const name of Object.keys(deps ?? {})) push(name, `tool.poetry.${section}`);
  }
  return refs;
}

/**
 * Collect dependency references from manifests (package.json, requirements*.txt,
 * pyproject.toml) and, optionally, bare import specifiers in source files.
 * Import-origin refs are only reported when not already declared in a manifest.
 */
export function collectDependencies(dir: string, opts: CollectOptions = {}): CollectResult {
  const ignoreRes = (opts.ignore ?? []).map(globToRegExp);
  const manifestRefs: DependencyRef[] = [];
  const importRefs: DependencyRef[] = [];
  const scannedFiles: string[] = [];
  const warnings: string[] = [];
  // workspace/file/git deps and the project's own package names: declared, not verified
  const localNames = new Set<string>();
  // first-party Python modules present in the tree: never registry-verified
  const localPyModules = new Set<string>();

  for (const file of walk(dir)) {
    const rel = path.relative(dir, file).split(path.sep).join('/');
    if (ignoreRes.some((re) => re.test(rel))) continue;
    const base = path.basename(file);
    const ext = path.extname(file);
    const isManifest = base === 'package.json' || base === 'pyproject.toml' || /^requirements[\w.-]*\.txt$/.test(base);
    const isSource = opts.includeImports !== false && (JS_EXTENSIONS.has(ext) || ext === '.py');
    if (ext === '.py') {
      localPyModules.add(base.slice(0, -3));
      const parent = path.basename(path.dirname(file));
      if (parent && parent !== '.') localPyModules.add(parent);
    }
    if (!isManifest && !isSource) continue;
    let content: string;
    try {
      if (fs.statSync(file).size > MAX_FILE_BYTES) continue;
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    scannedFiles.push(rel);
    if (base === 'package.json') manifestRefs.push(...refsFromPackageJson(rel, content, localNames, warnings));
    else if (base === 'pyproject.toml') manifestRefs.push(...refsFromPyproject(rel, content, warnings));
    else if (isManifest) manifestRefs.push(...refsFromRequirementsTxt(rel, content));
    else if (JS_EXTENSIONS.has(ext)) {
      for (const name of extractJsImports(stripJsComments(content))) {
        importRefs.push({ name, ecosystem: 'npm', origin: 'import', file: rel });
      }
    } else {
      for (const name of extractPyImports(stripPyLiterals(content))) {
        importRefs.push({ name, ecosystem: 'pypi', origin: 'import', file: rel });
      }
    }
  }

  const declared = new Set([
    ...manifestRefs.map((r) => `${r.ecosystem}:${normalizeName(r.name, r.ecosystem)}`),
    ...[...localNames].map((n) => `npm:${n}`),
    ...[...localPyModules].map((n) => `pypi:${normalizeName(n, 'pypi')}`),
  ]);
  const refs = [...manifestRefs];
  const seenImports = new Set<string>();
  for (const ref of importRefs) {
    const key = `${ref.ecosystem}:${normalizeName(ref.name, ref.ecosystem)}`;
    if (declared.has(key) || seenImports.has(key)) continue;
    seenImports.add(key);
    refs.push(ref);
  }
  return { refs: dedupe(refs), scannedFiles, warnings };
}

export function normalizeName(name: string, ecosystem: DepEcosystem): string {
  return ecosystem === 'pypi' ? name.toLowerCase().replace(/[-_.]+/g, '-') : name;
}

function dedupe(refs: DependencyRef[]): DependencyRef[] {
  const seen = new Map<string, DependencyRef>();
  for (const ref of refs) {
    const key = `${ref.ecosystem}:${normalizeName(ref.name, ref.ecosystem)}:${ref.origin as DepOrigin}`;
    if (!seen.has(key)) seen.set(key, ref);
  }
  return [...seen.values()];
}
