import { DependencyRef } from '../deps/types.js';
import { McpServerConfig } from '../types.js';
import { Rule, finding } from './rule.js';

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

/** Split "name@1.2.3" / "@scope/name@1.2.3" / PEP 508 "name==1.2.3" into name and pinned version. */
function splitSpec(spec: string): { name: string; version?: string } {
  const eq = spec.indexOf('==');
  if (eq > 0) {
    const version = spec.slice(eq + 2);
    return /^\d/.test(version) ? { name: spec.slice(0, eq), version } : { name: spec.slice(0, eq) };
  }
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
};
