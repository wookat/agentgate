import { DependencyRef } from '../deps/types.js';
import { McpServerConfig } from '../types.js';
import { Rule, finding } from './rule.js';
import { COPILOT_SETTINGS_FILE, parseGooseRecipeDoc, parseJsonc } from './skill-poisoning.js';

const PKG_RUNNERS = ['npx', 'pnpx', 'pnpm', 'bunx', 'uvx', 'pipx'];
const PYPI_RUNNERS = new Set(['uvx', 'pipx']);

function extractPackageSpec(command: string | undefined, args: string[]): string | undefined {
  const base = (command ?? '').split(/[\\/]/).pop() ?? '';
  if (!PKG_RUNNERS.includes(base)) return undefined;
  // skip flags like -y / --yes / -q and `dlx` subcommand
  for (const arg of args) {
    if (arg.startsWith('-')) continue;
    if (arg === 'dlx' || arg === 'exec') continue;
    return arg;
  }
  return undefined;
}

/**
 * Split "name@1.2.3" / "@scope/name@1.2.3" / PEP 508 "name==1.2.3" into name
 * and pinned version. PEP 508 range specs (`name>=1.0`, `name~=2.1`), extras
 * (`name[extra]`), and markers yield the bare name with no version.
 */
function splitSpec(spec: string): { name: string; version?: string } {
  const eq = spec.indexOf('==');
  if (eq > 0 && !/[><!~;[]/.test(spec.slice(0, eq))) {
    const version = spec.slice(eq + 2);
    return /^\d/.test(version) ? { name: spec.slice(0, eq), version } : { name: spec.slice(0, eq) };
  }
  const range = spec.match(/^([\w.-]+)\s*(?:[><!~;[]|==)/);
  if (range?.[1] !== undefined) return { name: range[1] };
  const at = spec.lastIndexOf('@');
  if (at <= 0) return { name: spec };
  const version = spec.slice(at + 1);
  return /^\d/.test(version) ? { name: spec.slice(0, at), version } : { name: spec.slice(0, at) };
}

/**
 * The registry package a configured MCP server launches through a package
 * runner (npx/pnpx/bunx → npm, uvx/pipx → PyPI), if any — so it can be
 * checked against known-malware advisories.
 */
export function serverPackageRef(server: McpServerConfig): (DependencyRef & { version?: string }) | undefined {
  const spec = extractPackageSpec(server.command, server.args ?? []);
  if (spec === undefined || spec.startsWith('.') || spec.includes('://') || /^[A-Za-z]:[\\/]/.test(spec) || spec.includes('\\')) {
    return undefined;
  }
  const base = (server.command ?? '').split(/[\\/]/).pop() ?? '';
  const { name, version } = splitSpec(spec);
  return {
    name,
    version,
    ecosystem: PYPI_RUNNERS.has(base) ? 'pypi' : 'npm',
    origin: 'manifest',
    file: server.source ?? server.name,
    context: `server "${server.name}"`,
  };
}

function isPinned(spec: string): boolean {
  // scoped: @scope/name@1.2.3 ; unscoped: name@1.2.3 ; PEP 508: name==1.2.3 ; also git+…#sha
  const eq = spec.indexOf('==');
  if (eq > 0) return /^\d+(\.\d+)*([-+.][\w.]+)?$/.test(spec.slice(eq + 2));
  const at = spec.lastIndexOf('@');
  if (at <= 0) return /#[0-9a-f]{7,40}$/.test(spec);
  const version = spec.slice(at + 1);
  return /^\d+\.\d+\.\d+([-+][\w.]+)?$/.test(version);
}

/** OpenCode config files; npm packages in their `plugin` array are auto-installed by Bun and executed at startup. */
export const OPENCODE_CONFIG_FILE = /(^|\/)opencode\.jsonc?$/i;

/** The npm plugin specs in an OpenCode config's `plugin` array (local file paths and git-URL specs excluded). */
function opencodeNpmPluginSpecs(content: string): string[] {
  const data = parseJsonc(content);
  if (typeof data !== 'object' || data === null) return [];
  const plugins = (data as { plugin?: unknown }).plugin;
  if (!Array.isArray(plugins)) return [];
  return plugins.filter(
    (spec): spec is string =>
      typeof spec === 'string' && !spec.startsWith('.') && !spec.startsWith('/') && !spec.includes('://') && !/\.[cm]?[jt]s$/.test(spec),
  );
}

/**
 * Registry package refs for the npm plugins an OpenCode config auto-installs
 * at startup — so they can be checked against known-malware advisories.
 */
export function opencodePluginRefs(file: string, content: string): (DependencyRef & { version?: string })[] {
  if (!OPENCODE_CONFIG_FILE.test(file)) return [];
  return opencodeNpmPluginSpecs(content).map((spec) => {
    const { name, version } = splitSpec(spec);
    return { name, version, ecosystem: 'npm', origin: 'manifest', file, context: `OpenCode plugin "${spec}"` };
  });
}

/**
 * Registry package refs for the PyPI `dependencies` of `inline_python`
 * extensions in a Goose recipe — uvx installs and runs them for everyone who
 * runs the recipe, so they get the same known-malware advisory checks. Gated
 * on the documented recipe shape since the filename is generic.
 */
export function gooseRecipeDependencyRefs(file: string, content: string): (DependencyRef & { version?: string })[] {
  const recipe = parseGooseRecipeDoc(file, content);
  if (!recipe) return [];
  const refs: (DependencyRef & { version?: string })[] = [];
  for (const entryRaw of Array.isArray(recipe.extensions) ? recipe.extensions : []) {
    if (typeof entryRaw !== 'object' || entryRaw === null) continue;
    const entry = entryRaw as { type?: unknown; name?: unknown; dependencies?: unknown };
    if (entry.type !== 'inline_python' || !Array.isArray(entry.dependencies)) continue;
    const extName = typeof entry.name === 'string' ? entry.name : 'unnamed';
    for (const spec of entry.dependencies) {
      if (typeof spec !== 'string') continue;
      const { name, version } = splitSpec(spec);
      refs.push({ name, version, ecosystem: 'pypi', origin: 'manifest', file, context: `Goose recipe inline_python extension "${extName}"` });
    }
  }
  return refs;
}

/** Claude Code project settings; `extraKnownMarketplaces` + `enabledPlugins` auto-install plugin code for anyone who trusts the folder. */
const CLAUDE_SETTINGS_FILE = /(^|\/)\.claude\/settings(\.local)?\.json$/i;

/** Release-style refs (v1.2.3, 2.3.0) are treated as pinned; branch-like refs are mutable. */
const VERSION_REF = /^v?\d+(\.\d+)*([-+.][\w.]+)?$/;

type MarketplaceSource = { source?: unknown; repo?: unknown; url?: unknown; ref?: unknown; sha?: unknown; package?: unknown; version?: unknown; sha256?: unknown };

/** Exact npm versions (2.1.0, 2.1.0-beta.1) are pinned; ranges (^, ~, x, latest) and absent versions are mutable. */
const EXACT_NPM_VERSION = /^\d+\.\d+\.\d+([-+][\w.]+)?$/;

/** True when a marketplace source fetches mutable remote content (git with no sha/release ref, npm with no exact version, archive with no sha256 pin). */
function isMutableMarketplaceSource(src: MarketplaceSource): boolean {
  if (typeof src.source !== 'string') return false;
  if (src.source === 'npm') return !(typeof src.version === 'string' && EXACT_NPM_VERSION.test(src.version));
  if (src.source === 'archive') return !(typeof src.sha256 === 'string' && /^[0-9a-f]{64}$/i.test(src.sha256));
  if (!['github', 'git', 'url', 'git-subdir'].includes(src.source)) return false;
  if (typeof src.sha === 'string' && /^[0-9a-f]{7,40}$/i.test(src.sha)) return false;
  return !(typeof src.ref === 'string' && VERSION_REF.test(src.ref));
}

/** Per-source-type pin advice and location description for mutable marketplace sources. */
function describeMutableSource(src: MarketplaceSource): { where: string; advice: string } {
  if (src.source === 'npm') {
    return { where: typeof src.package === 'string' ? `npm:${src.package}${typeof src.version === 'string' ? `@${src.version}` : ''}` : 'npm package', advice: 'Pin an exact version' };
  }
  if (src.source === 'archive') {
    return { where: typeof src.url === 'string' ? src.url : 'archive url', advice: 'Pin the archive with a sha256 digest' };
  }
  const where = typeof src.repo === 'string' ? src.repo : typeof src.url === 'string' ? src.url : 'remote source';
  return { where: `${where}${typeof src.ref === 'string' ? `#${src.ref}` : ''}`, advice: 'Pin a sha or release ref' };
}

/** Findings for plugins auto-enabled from mutable marketplace sources (Claude Code and Copilot CLI settings share the schema). */
function checkClaudeMarketplaces(rule: Rule, file: string, content: string, client = 'Claude Code') {
  const data = parseJsonc(content);
  if (typeof data !== 'object' || data === null) return [];
  const marketplaces = (data as { extraKnownMarketplaces?: unknown }).extraKnownMarketplaces;
  const enabled = (data as { enabledPlugins?: unknown }).enabledPlugins;
  if (typeof marketplaces !== 'object' || marketplaces === null) return [];
  if (typeof enabled !== 'object' || enabled === null) return [];
  const findings = [];
  for (const [pluginSpec, on] of Object.entries(enabled)) {
    if (on !== true) continue;
    const marketplaceName = pluginSpec.split('@')[1];
    if (marketplaceName === undefined) continue;
    const market = (marketplaces as Record<string, { source?: MarketplaceSource }>)[marketplaceName];
    if (market?.source === undefined || !isMutableMarketplaceSource(market.source)) continue;
    const where = typeof market.source.repo === 'string' ? market.source.repo : typeof market.source.url === 'string' ? market.source.url : 'remote source';
    const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${pluginSpec}"`)) + 1;
    findings.push(
      finding(rule, {
        severity: 'medium',
        target: file,
        file,
        ...(line > 0 ? { line } : {}),
        message: `${client} plugin "${pluginSpec}" is auto-enabled from marketplace "${marketplaceName}" fetched from a mutable source (${where}${typeof market.source.ref === 'string' ? `#${market.source.ref}` : ''}) — plugins install hooks, MCP servers, and skills for anyone who trusts this folder, and every fetch picks up whatever the branch points at. Pin a release ref or sha`,
      }),
    );
  }
  return findings;
}

/** In-repo plugin marketplace catalog (Claude Code `.claude-plugin/`, Copilot CLI `.github/plugin/`); each entry's `source` tells installers where plugin code comes from. */
export const MARKETPLACE_CATALOG_FILE = /(^|\/)(\.claude-plugin|\.github\/plugin)\/marketplace\.json$/i;

/**
 * Registry package refs for the npm-distributed plugins in a marketplace
 * catalog — installers run `npm install` on these, so they get the same
 * known-malware advisory checks as server packages.
 */
export function marketplacePluginRefs(file: string, content: string): (DependencyRef & { version?: string })[] {
  if (!MARKETPLACE_CATALOG_FILE.test(file)) return [];
  const data = parseJsonc(content);
  if (typeof data !== 'object' || data === null) return [];
  const plugins = (data as { plugins?: unknown }).plugins;
  if (!Array.isArray(plugins)) return [];
  const refs: (DependencyRef & { version?: string })[] = [];
  for (const entry of plugins) {
    const name = (entry as { name?: unknown })?.name;
    const src = (entry as { source?: unknown })?.source as MarketplaceSource | undefined;
    if (typeof src !== 'object' || src === null || src.source !== 'npm' || typeof src.package !== 'string') continue;
    const version = typeof src.version === 'string' && EXACT_NPM_VERSION.test(src.version) ? src.version : undefined;
    refs.push({
      name: src.package,
      version,
      ecosystem: 'npm',
      origin: 'manifest',
      file,
      context: `marketplace plugin "${typeof name === 'string' ? name : src.package}"`,
    });
  }
  return refs;
}

/** Findings for marketplace catalog plugin entries served from mutable git sources. */
function checkMarketplaceCatalog(rule: Rule, file: string, content: string) {
  const data = parseJsonc(content);
  if (typeof data !== 'object' || data === null) return [];
  const plugins = (data as { plugins?: unknown }).plugins;
  if (!Array.isArray(plugins)) return [];
  const findings = [];
  for (const entry of plugins) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { name, source } = entry as { name?: unknown; source?: unknown };
    // String sources are relative paths inside the marketplace repo — not remote fetches.
    if (typeof source !== 'object' || source === null) continue;
    if (!isMutableMarketplaceSource(source as MarketplaceSource)) continue;
    const src = source as MarketplaceSource;
    const { where, advice } = describeMutableSource(src);
    const pluginName = typeof name === 'string' ? name : 'unknown';
    const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${pluginName}"`)) + 1;
    findings.push(
      finding(rule, {
        severity: 'medium',
        target: file,
        file,
        ...(line > 0 ? { line } : {}),
        message: `Marketplace plugin "${pluginName}" is served from a mutable source (${where}) — everyone who installs it gets whatever upstream serves next (rug-pull exposure). ${advice}`,
      }),
    );
  }
  return findings;
}

export const supplyChainRule: Rule = {
  id: 'AG-SC-001',
  category: 'supply-chain',
  description: 'Detects unpinned package execution (npx -y pkg@latest) and other rug-pull-prone launch patterns',
  checkServer(server) {
    const findings = [];
    const args = server.args ?? [];
    const spec = extractPackageSpec(server.command, args);
    if (spec !== undefined) {
      if (!isPinned(spec)) {
        const bareName = splitSpec(spec.split('@latest')[0] ?? spec).name.split(/[><=!~]/)[0] ?? spec;
        const pinExample = PYPI_RUNNERS.has((server.command ?? '').split(/[\\/]/).pop() ?? '')
          ? `${bareName}==1.2.3`
          : `${bareName}@1.2.3`;
        findings.push(
          finding(this, {
            severity: 'medium',
            target: server.name,
            file: server.source,
            message: `Server "${server.name}" runs unpinned package "${spec}" — every launch fetches whatever is latest (rug-pull / compromised-release exposure). Pin an exact version (e.g. ${pinExample}) and lock the tool surface with \`agentgate lock\``,
          }),
        );
      }
      if (args.some((a) => a === '-y' || a === '--yes')) {
        findings.push(
          finding(this, {
            severity: 'low',
            target: server.name,
            file: server.source,
            message: `Server "${server.name}" auto-confirms package installation (-y) — combined with an unpinned spec this installs new upstream code silently`,
          }),
        );
      }
    }
    // docker without digest pinning
    const base = (server.command ?? '').split(/[\\/]/).pop() ?? '';
    const positional = args.filter((a) => !a.startsWith('-'));
    // Only the `docker run` / `docker container run` forms take an image; CLI
    // plugins like `docker mcp gateway run` don't (their last word is not an image).
    const isDockerRun = positional[0] === 'run' || (positional[0] === 'container' && positional[1] === 'run');
    if (base === 'docker' && isDockerRun) {
      const image = positional.at(-1);
      if (image && image !== 'run' && !image.includes('@sha256:') && (image.endsWith(':latest') || !image.includes(':'))) {
        findings.push(
          finding(this, {
            severity: 'medium',
            target: server.name,
            file: server.source,
            message: `Server "${server.name}" runs docker image "${image}" without a tag/digest pin`,
          }),
        );
      }
    }
    return findings;
  },
  checkSource(file, content) {
    if (CLAUDE_SETTINGS_FILE.test(file)) return checkClaudeMarketplaces(this, file, content);
    if (COPILOT_SETTINGS_FILE.test(file)) return checkClaudeMarketplaces(this, file, content, 'Copilot CLI');
    if (MARKETPLACE_CATALOG_FILE.test(file)) return checkMarketplaceCatalog(this, file, content);
    if (!OPENCODE_CONFIG_FILE.test(file)) return [];
    const data = parseJsonc(content);
    if (typeof data !== 'object' || data === null) return [];
    const plugins = (data as { plugin?: unknown }).plugin;
    const findings = [];
    for (const spec of Array.isArray(plugins) ? plugins : []) {
      if (typeof spec !== 'string') continue;
      // Local plugin files/paths are loaded from the repo, not fetched from npm.
      if (spec.startsWith('.') || spec.startsWith('/') || /\.[cm]?[jt]s$/.test(spec)) continue;
      const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${spec}"`)) + 1;
      if (spec.includes('://')) {
        // Git-URL specs fetch mutable upstream code unless pinned to a commit.
        if (/#[0-9a-f]{7,40}$/i.test(spec)) continue;
        findings.push(
          finding(this, {
            severity: 'medium',
            target: file,
            file,
            ...(line > 0 ? { line } : {}),
            message: `OpenCode plugin "${spec.slice(0, 100)}" is fetched from a git URL and executed at startup without a commit pin — every launch fetches whatever the branch points at (rug-pull / compromised-release exposure). Pin a commit (e.g. …#<sha>)`,
          }),
        );
        continue;
      }
      if (isPinned(spec)) continue;
      findings.push(
        finding(this, {
          severity: 'medium',
          target: file,
          file,
          ...(line > 0 ? { line } : {}),
          message: `OpenCode plugin "${spec}" is auto-installed from npm and executed at startup without a pinned version — every launch fetches whatever is latest (rug-pull / compromised-release exposure). Pin an exact version (e.g. ${spec}@1.2.3)`,
        }),
      );
    }
    return findings;
  },
};
