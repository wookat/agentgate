import { Finding } from '../types.js';
import { McpaMatch } from './match.js';

const ADVISORY_BASE = 'https://agentgate.zalize.com/advisories';

/**
 * Turn MCPA advisory matches for a configured server package into findings
 * (`AG-SC-003`). Version-confirmed matches carry the advisory's severity;
 * unconfirmed matches (no version to compare against a version-scoped
 * advisory) report `medium` with a pin-and-verify instruction.
 */
export function scoreMcpaMatches(
  matches: McpaMatch[],
  pkg: { name: string; ecosystem: string; version?: string },
  context: { serverName: string; file?: string },
): Finding[] {
  return matches.map(({ advisory, versionConfirmed }) => {
    const base = {
      ruleId: 'AG-SC-003' as const,
      category: 'supply-chain' as const,
      target: `${pkg.ecosystem}:${pkg.name}`,
      file: context.file,
      detail: `${ADVISORY_BASE}/${advisory.id.toLowerCase()}/`,
    };
    if (versionConfirmed) {
      return {
        ...base,
        severity: advisory.severity,
        message: `"${pkg.name}"${pkg.version ? ` ${pkg.version}` : ''} is affected by ${advisory.id}: ${advisory.title} (server "${context.serverName}")`,
      };
    }
    return {
      ...base,
      severity: 'medium',
      message: `"${pkg.name}" has advisory ${advisory.id}: ${advisory.title} — the launch spec pins no version, so the affected range cannot be ruled out; pin a fixed version (server "${context.serverName}")`,
    };
  });
}
