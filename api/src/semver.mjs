// Minimal SemVer comparison — enough to evaluate OSV-style
// introduced / fixed / last_affected range events. No external deps.

function parse(v) {
  // Partial versions ("0", "1.2") are common in OSV-style `introduced`
  // events; missing segments count as 0.
  const m = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/.exec(String(v).trim());
  if (!m) return null;
  return {
    release: [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)],
    prerelease: m[4] ? m[4].split(".") : [],
  };
}

function compareIdentifiers(a, b) {
  const an = /^\d+$/.test(a);
  const bn = /^\d+$/.test(b);
  if (an && bn) return Math.sign(Number(a) - Number(b));
  if (an) return -1; // numeric identifiers sort before alphanumeric
  if (bn) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Returns -1, 0, or 1; null when either version is unparseable. */
export function compare(a, b) {
  const pa = parse(a);
  const pb = parse(b);
  if (!pa || !pb) return null;
  for (let i = 0; i < 3; i++) {
    if (pa.release[i] !== pb.release[i]) return Math.sign(pa.release[i] - pb.release[i]);
  }
  if (pa.prerelease.length && !pb.prerelease.length) return -1;
  if (!pa.prerelease.length && pb.prerelease.length) return 1;
  for (let i = 0; i < Math.max(pa.prerelease.length, pb.prerelease.length); i++) {
    if (pa.prerelease[i] === undefined) return -1;
    if (pb.prerelease[i] === undefined) return 1;
    const c = compareIdentifiers(pa.prerelease[i], pb.prerelease[i]);
    if (c !== 0) return c;
  }
  return 0;
}

/**
 * True when `version` falls inside one of the OSV-style ranges.
 * A range = { introduced, fixed?, last_affected? }. With neither `fixed`
 * nor `last_affected`, everything from `introduced` onward is affected.
 * Returns false (never throws) for unparseable versions.
 */
export function isAffected(version, ranges) {
  for (const r of ranges || []) {
    const geIntro = compare(version, r.introduced);
    if (geIntro === null || geIntro < 0) continue;
    if (r.fixed !== undefined) {
      const ltFixed = compare(version, r.fixed);
      if (ltFixed !== null && ltFixed < 0) return true;
      continue;
    }
    if (r.last_affected !== undefined) {
      const leLast = compare(version, r.last_affected);
      if (leLast !== null && leLast <= 0) return true;
      continue;
    }
    return true;
  }
  return false;
}
