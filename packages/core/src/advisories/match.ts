import { McpaAdvisory, McpaRange } from './types.js';
import { MCPA_ADVISORIES } from './data.js';

/** Numeric-aware version compare over dotted segments; pre-release tails compare lexically. */
function compareVersions(a: string, b: string): number {
  const norm = (v: string) => v.replace(/^v/, '').split(/[.+-]/);
  const as = norm(a);
  const bs = norm(b);
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const x = as[i] ?? '0';
    const y = bs[i] ?? '0';
    const nx = Number(x);
    const ny = Number(y);
    const cmp =
      Number.isNaN(nx) || Number.isNaN(ny) ? x.localeCompare(y) : nx - ny;
    if (cmp !== 0) return cmp < 0 ? -1 : 1;
  }
  return 0;
}

function inRange(version: string, range: McpaRange): boolean {
  if (compareVersions(version, range.introduced) < 0) return false;
  if (range.fixed !== undefined) return compareVersions(version, range.fixed) < 0;
  if (range.last_affected !== undefined) return compareVersions(version, range.last_affected) <= 0;
  return true; // open range: everything since `introduced`
}

export interface McpaMatch {
  advisory: McpaAdvisory;
  /** false when no version was available and the advisory's ranges are not package-wide. */
  versionConfirmed: boolean;
}

/**
 * Match a package against the bundled AgentGate MCP advisory database.
 * With a version: only ranges covering it match. Without one: any advisory
 * for the package matches, `versionConfirmed` true only for open ranges
 * (package-wide, e.g. malware in every version).
 */
export function matchMcpaAdvisories(
  name: string,
  ecosystem: string,
  version?: string,
  advisories: McpaAdvisory[] = MCPA_ADVISORIES,
): McpaMatch[] {
  const matches: McpaMatch[] = [];
  for (const advisory of advisories) {
    for (const pkg of advisory.packages) {
      if (pkg.ecosystem !== ecosystem || pkg.name.toLowerCase() !== name.toLowerCase()) continue;
      if (version !== undefined) {
        if (pkg.ranges.some((r) => inRange(version, r))) {
          matches.push({ advisory, versionConfirmed: true });
        }
      } else {
        const packageWide = pkg.ranges.some((r) => r.fixed === undefined && r.last_affected === undefined);
        matches.push({ advisory, versionConfirmed: packageWide });
      }
      break;
    }
  }
  return matches;
}
