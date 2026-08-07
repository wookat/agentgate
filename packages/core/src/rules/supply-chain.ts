import { DependencyRef } from '../deps/types.js';
import { McpServerConfig } from '../types.js';
import { Rule, finding } from './rule.js';
import { parseJsonc } from './skill-poisoning.js';

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

/** Claude Code project settings; `extraKnownMarketplaces` + `enabledPlugins` auto-install plugin code for anyone who trusts the folder. */
const CLAUDE_SETTINGS_FILE = /(^|\/)\.claude\/settings(\.local)?\.json$/i;

/** Release-style refs (v1.2.3, 2.3.0) are treated as pinned; branch-like refs are mutable. */
const VERSION_REF = /^v?\d+(\.\d+)*([-+.][\w.]+)?$/;

type MarketplaceSource = { source?: unknown; repo?: unknown; url?: unknown; ref?: unknown; sha?: unknown };

/** True when a marketplace source fetches a mutable remote catalog (git-based, no sha, no release-style ref). */
function isMutableMarketplaceSource(src: MarketplaceSource): boolean {
  if (typeof src.source !== 'string' || !['github', 'git', 'url', 'git-subdir'].includes(src.source)) return false;
  if (typeof src.sha === 'string' && /^[0-9a-f]{7,40}$/i.test(src.sha)) return false;
  return !(typeof src.ref === 'string' && VERSION_REF.test(src.ref));
}

/** Findings for Claude Code plugins auto-enabled from mutable marketplace sources. */
function checkClaudeMarketplaces(rule: Rule, file: string, content: string) {
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
        message: `Claude Code plugin "${pluginSpec}" is auto-enabled from marketplace "${marketplaceName}" fetched from a mutable source (${where}${typeof market.source.ref === 'string' ? `#${market.source.ref}` : ''}) — plugins install hooks, MCP servers, and skills for anyone who trusts this folder, and every fetch picks up whatever the branch points at. Pin a release ref or sha`,
      }),
    );
  }
  return findings;
}

/** In-repo plugin marketplace catalog; each entry's `source` tells installers where plugin code comes from. */
const MARKETPLACE_CATALOG_FILE = /(^|\/)\.claude-plugin\/marketplace\.json$/i;

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
    const where = typeof src.repo === 'string' ? src.repo : typeof src.url === 'string' ? src.url : 'remote source';
    const pluginName = typeof name === 'string' ? name : 'unknown';
    const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${pluginName}"`)) + 1;
    findings.push(
      finding(rule, {
        severity: 'medium',
        target: file,
        file,
        ...(line > 0 ? { line } : {}),
        message: `Marketplace plugin "${pluginName}" is served from a mutable git source (${where}${typeof src.ref === 'string' ? `#${src.ref}` : ''}) — everyone who installs it gets whatever the branch points at (rug-pull exposure). Pin a sha or release ref`,
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
    if (base === 'docker' && args.includes('run')) {
      const image = args.filter((a) => !a.startsWith('-')).at(-1);
      if (image && !image.includes('@sha256:') && (image.endsWith(':latest') || !image.includes(':'))) {
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
