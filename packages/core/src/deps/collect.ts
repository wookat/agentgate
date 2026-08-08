import fs from 'node:fs';
import path from 'node:path';
import { builtinModules } from 'node:module';
import { parse as parseToml } from 'smol-toml';
import { globToRegExp } from '../scanner.js';
import { PYTHON_STDLIB } from './popular.js';
import { DependencyRef, DepEcosystem, DepOrigin, RemoteDepSpec } from './types.js';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.venv', 'venv', '__pycache__', '.next']);
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_LOCKFILE_BYTES = 20 * 1024 * 1024;
const JS_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.jsx', '.tsx']);

const NODE_BUILTINS = new Set(builtinModules);
const PY_STDLIB = new Set(PYTHON_STDLIB);

/** Well-known Python packages whose import name differs from the PyPI distribution name. */
const PY_IMPORT_TO_DIST: Record<string, string> = {
  yaml: 'pyyaml',
  git: 'gitpython',
  PIL: 'pillow',
  cv2: 'opencv-python',
  bs4: 'beautifulsoup4',
  dateutil: 'python-dateutil',
  dotenv: 'python-dotenv',
  sklearn: 'scikit-learn',
  jwt: 'pyjwt',
  OpenSSL: 'pyopenssl',
  Crypto: 'pycryptodome',
  serial: 'pyserial',
  magic: 'python-magic',
  docx: 'python-docx',
  pptx: 'python-pptx',
  fitz: 'pymupdf',
  github: 'pygithub',
  MySQLdb: 'mysqlclient',
  attr: 'attrs',
};

export interface CollectOptions {
  /** Glob patterns (relative to the scan root) to exclude. */
  ignore?: string[];
  /** Also extract bare import specifiers from source files (default true). */
  includeImports?: boolean;
}

export interface CollectResult {
  refs: DependencyRef[];
  /** Dependencies declared with non-registry specifiers (git remotes, archive URLs). */
  remoteSpecs: RemoteDepSpec[];
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
      names.add(PY_IMPORT_TO_DIST[top] ?? top);
    }
  }
  return [...names];
}

/** PEP 508 direct reference: `name @ <url>` (environment markers after ';' ignored). */
export function directUrlRequirement(line: string): { name: string; spec: string } | undefined {
  let stripped = line.replace(/(^|\s)#(?!egg=).*$/, '').split(';')[0]!.trim();
  stripped = stripped.replace(/^(-e|--editable)\s+/, '');
  const m = /^([A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?)(?:\[[^\]]*\])?\s*@\s*((?:[a-z]+\+)?[a-z]+:\/\/\S+)$/i.exec(stripped);
  if (m) return { name: m[1]!, spec: m[2]! };
  // Bare URL requirement (pip installs these directly): name from #egg= or the repo/file path
  const u = /^((?:[a-z]+\+)?[a-z]+:\/\/\S+)$/i.exec(stripped);
  if (!u) return undefined;
  const spec = u[1]!;
  const egg = /#egg=([A-Za-z0-9._-]+)/i.exec(spec);
  const name = egg?.[1] ?? bareUrlName(spec);
  return name ? { name, spec } : undefined;
}

/** Best-effort distribution name for a bare URL requirement (repo or archive basename). */
function bareUrlName(spec: string): string | undefined {
  let path;
  try {
    path = new URL(spec.replace(/^[a-z]+\+/, '')).pathname;
  } catch {
    return undefined;
  }
  const segments = path.replace(/#.*$/, '').split('/').filter(Boolean);
  const archiveAt = segments.findIndex((s) => s === 'archive' || s === 'releases' || s === 'zipball' || s === 'tarball');
  const base = archiveAt > 0 ? segments[archiveAt - 1]! : (segments[segments.length - 1] ?? '');
  const name = base.replace(/\.(git|zip|whl|tar\.gz|tar\.bz2|tgz)$/i, '');
  return /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/.test(name) ? name : undefined;
}

/** Strip a PEP 508 requirement line down to the distribution name. */
export function parseRequirementLine(line: string): string | undefined {
  const stripped = line.replace(/(^|\s)#.*$/, '').trim();
  if (!stripped || stripped.startsWith('-') || stripped.includes('://')) return undefined;
  const m = /^([A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?)/.exec(stripped);
  return m?.[1];
}

function refsFromPackageJson(file: string, content: string, localNames: Set<string>, warnings: string[], remoteSpecs: RemoteDepSpec[]): DependencyRef[] {
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
        if (/^(git|https?:)/.test(spec)) remoteSpecs.push({ name, ecosystem: 'npm', spec, file, context: section });
        continue;
      }
      refs.push({ name, ecosystem: 'npm', origin: 'manifest', file, context: section });
    }
  }
  // overrides / resolutions / pnpm.overrides can redirect any (transitive)
  // dependency to a remote source — only remote redirections are of interest
  const pushOverride = (key: string, spec: unknown, context: string): void => {
    if (typeof spec === 'string') {
      if (/^(git|https?:)/.test(spec)) {
        remoteSpecs.push({ name: overrideKeyName(key), ecosystem: 'npm', spec, file, context });
      }
      return;
    }
    if (typeof spec !== 'object' || spec === null || Array.isArray(spec)) return;
    for (const [k, v] of Object.entries(spec)) pushOverride(k === '.' ? key : k, v, context);
  };
  const record = data as Record<string, unknown>;
  const pnpm = record['pnpm'] as Record<string, unknown> | undefined;
  for (const [table, context] of [
    [record['overrides'], 'overrides'],
    [record['resolutions'], 'resolutions'],
    [pnpm?.['overrides'], 'pnpm.overrides'],
  ] as const) {
    if (typeof table !== 'object' || table === null) continue;
    for (const [key, spec] of Object.entries(table)) pushOverride(key, spec, context);
  }
  return refs;
}

/** Package name from an overrides/resolutions key (glob prefixes, `parent>pkg`, `@scope/pkg@^1`). */
function overrideKeyName(key: string): string {
  const segs = key.split('>').pop()!.trim().split('/');
  let name = segs.pop() ?? key;
  const prev = segs.pop();
  if (prev?.startsWith('@')) name = `${prev}/${name}`;
  const at = name.lastIndexOf('@');
  return at > 0 ? name.slice(0, at) : name;
}

/** Default registry hosts plus version-addressed registry-path tarballs on any host (mirrors, private registries). */
function isRegistryResolved(url: string): boolean {
  return /^https?:\/\/(registry\.npmjs\.org|registry\.yarnpkg\.com)\//i.test(url) || /\/-\/[^/]+\.tgz([?#]|$)/i.test(url);
}

/**
 * Remote (git/archive) `resolved` sources in npm/yarn lockfiles. A lockfile
 * entry can point a transitive package at a source no manifest declares —
 * the classic lockfile-poisoning shape, near-invisible in a PR diff.
 */
function lockfileRemoteSpecs(file: string, content: string): RemoteDepSpec[] {
  const specs: RemoteDepSpec[] = [];
  const push = (name: string, resolved: unknown): void => {
    if (typeof resolved !== 'string' || isRegistryResolved(resolved)) return;
    if (!/^(git\+|git:|ssh:)|^https?:\/\//i.test(resolved)) return;
    specs.push({ name, ecosystem: 'npm', spec: resolved, file, context: 'lockfile resolved' });
  };
  if (path.basename(file) === 'package-lock.json') {
    let lock: unknown;
    try {
      lock = JSON.parse(content);
    } catch {
      return specs;
    }
    if (typeof lock !== 'object' || lock === null) return specs;
    const sections = lock as { packages?: Record<string, { resolved?: unknown }>; dependencies?: Record<string, { resolved?: unknown }> };
    for (const [key, entry] of Object.entries(sections.packages ?? {})) {
      const idx = key.lastIndexOf('node_modules/');
      if (idx !== -1) push(key.slice(idx + 'node_modules/'.length), entry?.resolved);
    }
    for (const [name, entry] of Object.entries(sections.dependencies ?? {})) push(name, entry?.resolved);
  } else {
    // yarn.lock v1: `name@range:` header followed by `  resolved "url"`
    for (const block of content.split(/\n\n/)) {
      const header = block.match(/^"?((?:@[^\s/@]+\/)?[^\s/@"]+)@[^\n]*:\s*$/m);
      const resolved = block.match(/^ {2}resolved "([^"]+)"/m);
      if (header && resolved) push(header[1]!, resolved[1]!);
    }
  }
  return specs;
}

/** Import-map keys in deno.json(c) resolve elsewhere (jsr:, https:, local paths) — never against npm. */
function declareDenoImportMap(content: string, localNames: Set<string>): void {
  let data: unknown;
  try {
    data = JSON.parse(stripJsComments(content).replace(/,(\s*[}\]])/g, '$1'));
  } catch {
    return;
  }
  if (typeof data !== 'object' || data === null) return;
  const imports = (data as { imports?: unknown }).imports;
  if (typeof imports !== 'object' || imports === null) return;
  for (const key of Object.keys(imports)) {
    const name = npmPackageFromSpecifier(key.replace(/\/$/, ''));
    if (name) localNames.add(name);
  }
}

function refsFromRequirementsTxt(file: string, content: string, remoteSpecs: RemoteDepSpec[]): DependencyRef[] {
  const refs: DependencyRef[] = [];
  for (const line of content.split('\n')) {
    const name = parseRequirementLine(line);
    if (name) {
      refs.push({ name, ecosystem: 'pypi', origin: 'manifest', file, context: 'requirements' });
      continue;
    }
    const direct = directUrlRequirement(line);
    if (direct) remoteSpecs.push({ ...direct, ecosystem: 'pypi', file, context: 'requirements' });
  }
  return refs;
}

function refsFromPyproject(file: string, content: string, warnings: string[], remoteSpecs: RemoteDepSpec[]): DependencyRef[] {
  const refs: DependencyRef[] = [];
  let data: Record<string, unknown>;
  try {
    data = parseToml(content) as Record<string, unknown>;
  } catch (err) {
    warnings.push(`${file}: unparseable TOML, skipped (${err instanceof Error ? err.message.split('\n')[0] : 'parse error'})`);
    return refs;
  }
  const tool = data['tool'] as Record<string, unknown> | undefined;
  // uv source overrides: [tool.uv.sources] redirects a dependency name to a git/url source
  const uvSources = new Map<string, string>();
  const uv = tool?.['uv'] as Record<string, unknown> | undefined;
  for (const [name, value] of Object.entries((uv?.['sources'] as Record<string, unknown> | undefined) ?? {})) {
    for (const entry of Array.isArray(value) ? value : [value]) {
      const remote = tableRemoteSpec(entry);
      if (remote) {
        uvSources.set(normalizePyName(name), remote);
        break;
      }
    }
  }
  const push = (name: string | undefined, context: string): void => {
    if (!name || name.toLowerCase() === 'python') return;
    const uvSource = uvSources.get(normalizePyName(name));
    if (uvSource) remoteSpecs.push({ name, ecosystem: 'pypi', spec: uvSource, file, context: `tool.uv.sources (${context})` });
    else refs.push({ name, ecosystem: 'pypi', origin: 'manifest', file, context });
  };
  const pushDep = (dep: string, context: string): void => {
    const direct = directUrlRequirement(dep);
    if (direct) remoteSpecs.push({ ...direct, ecosystem: 'pypi', file, context });
    else push(parseRequirementLine(dep), context);
  };
  const project = data['project'] as Record<string, unknown> | undefined;
  if (project) {
    for (const dep of (project['dependencies'] as unknown[] | undefined) ?? []) {
      if (typeof dep === 'string') pushDep(dep, 'project.dependencies');
    }
    const optional = project['optional-dependencies'] as Record<string, unknown> | undefined;
    for (const [group, deps] of Object.entries(optional ?? {})) {
      for (const dep of (deps as unknown[] | undefined) ?? []) {
        if (typeof dep === 'string') pushDep(dep, `project.optional-dependencies.${group}`);
      }
    }
  }
  // PEP 735 dependency groups (uv, pip >= 25.1)
  const groups = data['dependency-groups'] as Record<string, unknown> | undefined;
  for (const [group, deps] of Object.entries(groups ?? {})) {
    for (const dep of Array.isArray(deps) ? deps : []) {
      if (typeof dep === 'string') pushDep(dep, `dependency-groups.${group}`);
    }
  }
  const poetry = tool?.['poetry'] as Record<string, unknown> | undefined;
  const pushPoetryDep = (name: string, value: unknown, context: string): void => {
    const remote = tableRemoteSpec(value);
    if (remote) remoteSpecs.push({ name, ecosystem: 'pypi', spec: remote, file, context });
    else push(name, context);
  };
  for (const section of ['dependencies', 'dev-dependencies'] as const) {
    const deps = poetry?.[section] as Record<string, unknown> | undefined;
    for (const [name, value] of Object.entries(deps ?? {})) pushPoetryDep(name, value, `tool.poetry.${section}`);
  }
  const poetryGroups = poetry?.['group'] as Record<string, unknown> | undefined;
  for (const [group, table] of Object.entries(poetryGroups ?? {})) {
    const deps = (table as Record<string, unknown> | null)?.['dependencies'] as Record<string, unknown> | undefined;
    for (const [name, value] of Object.entries(deps ?? {})) {
      pushPoetryDep(name, value, `tool.poetry.group.${group}.dependencies`);
    }
  }
  return refs;
}

/** PEP 503 normalized distribution name. */
function normalizePyName(name: string): string {
  return name.toLowerCase().replace(/[-_.]+/g, '-');
}

/** Poetry/uv table-form remote source (`{ git = …, branch/tag/rev }` or `{ url = … }`) as a pip-style spec. */
function tableRemoteSpec(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  const dep = value as Record<string, unknown>;
  if (typeof dep['git'] === 'string') {
    const ref = [dep['rev'], dep['tag'], dep['branch']].find((r): r is string => typeof r === 'string');
    return `git+${dep['git']}${ref ? `@${ref}` : ''}`;
  }
  return typeof dep['url'] === 'string' ? dep['url'] : undefined;
}

/**
 * Collect dependency references from manifests (package.json, requirements*.txt,
 * pyproject.toml) and, optionally, bare import specifiers in source files.
 * Import-origin refs are only reported when not already declared in a manifest.
 */
export function collectDependencies(dir: string, opts: CollectOptions = {}): CollectResult {
  const ignoreRes = (opts.ignore ?? []).map(globToRegExp);
  const manifestRefs: DependencyRef[] = [];
  const remoteSpecs: RemoteDepSpec[] = [];
  const importRefs: DependencyRef[] = [];
  const scannedFiles: string[] = [];
  const warnings: string[] = [];
  // workspace/file/git deps and the project's own package names: declared, not verified
  const localNames = new Set<string>();
  // first-party Python modules present in the tree: never registry-verified
  const localPyModules = new Set<string>();
  // lockfile-resolved remote sources, held back until manifest-declared remotes are known
  const lockSpecs: RemoteDepSpec[] = [];

  for (const file of walk(dir)) {
    const rel = path.relative(dir, file).split(path.sep).join('/');
    if (ignoreRes.some((re) => re.test(rel))) continue;
    const base = path.basename(file);
    const ext = path.extname(file);
    const isManifest = base === 'package.json' || base === 'pyproject.toml' || /^requirements[\w.-]*\.txt$/.test(base);
    if (base === 'package-lock.json' || base === 'yarn.lock') {
      try {
        if (fs.statSync(file).size > MAX_LOCKFILE_BYTES) continue;
        lockSpecs.push(...lockfileRemoteSpecs(rel, fs.readFileSync(file, 'utf8')));
        scannedFiles.push(rel);
      } catch {
        /* unreadable: ignore */
      }
      continue;
    }
    if (base === 'deno.json' || base === 'deno.jsonc') {
      try {
        declareDenoImportMap(fs.readFileSync(file, 'utf8'), localNames);
      } catch {
        /* unreadable: ignore */
      }
    }
    const isSource = opts.includeImports !== false && (JS_EXTENSIONS.has(ext) || ext === '.py');
    if (ext === '.py') {
      localPyModules.add(base.slice(0, -3));
      // every directory on the path is importable as a (namespace) package root
      for (const part of rel.split('/').slice(0, -1)) localPyModules.add(part);
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
    if (base === 'package.json') manifestRefs.push(...refsFromPackageJson(rel, content, localNames, warnings, remoteSpecs));
    else if (base === 'pyproject.toml') manifestRefs.push(...refsFromPyproject(rel, content, warnings, remoteSpecs));
    else if (isManifest) manifestRefs.push(...refsFromRequirementsTxt(rel, content, remoteSpecs));
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
    ...remoteSpecs.map((s) => `${s.ecosystem}:${normalizeName(s.name, s.ecosystem)}`),
  ]);
  // a manifest-declared remote dep is already reported once from the manifest;
  // only lockfile resolutions no manifest accounts for are new information
  const declaredRemote = new Set(remoteSpecs.filter((s) => s.ecosystem === 'npm').map((s) => s.name));
  const seenLock = new Set<string>();
  for (const spec of lockSpecs) {
    const key = `${spec.name}\u0000${spec.spec}`;
    if (declaredRemote.has(spec.name) || seenLock.has(key)) continue;
    seenLock.add(key);
    remoteSpecs.push(spec);
  }
  const refs = [...manifestRefs];
  const seenImports = new Set<string>();
  for (const ref of importRefs) {
    const key = `${ref.ecosystem}:${normalizeName(ref.name, ref.ecosystem)}`;
    if (declared.has(key) || seenImports.has(key)) continue;
    seenImports.add(key);
    refs.push(ref);
  }
  return { refs: dedupe(refs), remoteSpecs, scannedFiles, warnings };
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
