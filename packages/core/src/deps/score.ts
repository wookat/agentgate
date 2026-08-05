import { Finding } from '../types.js';
import { normalizeName } from './collect.js';
import { POPULAR_NPM, POPULAR_PYPI } from './popular.js';
import { DepCheckResult, DependencyRef } from './types.js';

export const DEP_RULES = [
  { id: 'AG-DP-001', description: 'Dependency does not exist on the registry (likely AI-hallucinated / slopsquatting target)' },
  { id: 'AG-DP-002', description: 'Dependency name is one edit away from a popular package (possible typosquat)' },
  { id: 'AG-DP-003', description: 'Dependency is a young package with near-zero downloads' },
  { id: 'AG-DP-004', description: 'npm dependency runs install scripts (preinstall/install/postinstall)' },
  { id: 'AG-DP-005', description: 'Dependency has weak registry metadata (no repository/license/description, single version)' },
] as const;

/** Damerau-Levenshtein distance (optimal string alignment), capped early for speed. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) d[i]![0] = i;
  for (let j = 0; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i]![j] = Math.min(d[i]![j]!, d[i - 2]![j - 2]! + cost);
      }
    }
  }
  return d[a.length]![b.length]!;
}

const POPULAR = {
  npm: new Set(POPULAR_NPM),
  pypi: new Set(POPULAR_PYPI.map((n) => normalizeName(n, 'pypi'))),
};

/** Find a popular package the name is within one edit of (and is not itself). */
export function findTyposquatTarget(ref: DependencyRef): string | undefined {
  const name = normalizeName(ref.name, ref.ecosystem);
  const popular = ref.ecosystem === 'npm' ? POPULAR.npm : POPULAR.pypi;
  if (popular.has(name) || name.length < 4) return undefined;
  for (const candidate of popular) {
    if (editDistance(name, candidate, 1) <= 1) return candidate;
  }
  return undefined;
}

const TEST_PATH_RE = /(^|\/)(tests?|testing|__tests__|examples?|fixtures|docs?)\//i;

/** Imports inside test/example/docs trees are often runtime-generated or sample modules, not installable deps. */
function isTestOrExamplePath(file: string): boolean {
  return TEST_PATH_RE.test(file);
}

function target(ref: DependencyRef): string {
  return `${ref.ecosystem}:${ref.name}${ref.origin === 'import' ? ' (import)' : ''}`;
}

/** Turn a registry check result into zero or more findings. */
export function scoreDependency(result: DepCheckResult): Finding[] {
  const { ref, info, error } = result;
  const findings: Finding[] = [];
  const origin = ref.origin === 'import' ? ` (imported in ${ref.file}, not declared in any manifest)` : '';

  if (error) {
    findings.push({
      ruleId: 'AG-DP-001',
      category: 'supply-chain',
      severity: 'info',
      message: `could not verify "${ref.name}" against the ${ref.ecosystem} registry: ${error}`,
      target: target(ref),
      file: ref.file,
    });
    return findings;
  }
  if (!info) return findings;

  if (!info.exists) {
    const testContext = ref.origin === 'import' && isTestOrExamplePath(ref.file);
    findings.push({
      ruleId: 'AG-DP-001',
      category: 'supply-chain',
      severity: testContext ? 'low' : 'critical',
      message: testContext
        ? `"${ref.name}" does not exist on ${ref.ecosystem} — imported only under a test/example path (${ref.file}); likely a runtime-generated or sample module, review if unexpected`
        : `"${ref.name}" does not exist on ${ref.ecosystem} — likely AI-hallucinated; an attacker can register it (slopsquatting)${origin}`,
      target: target(ref),
      file: ref.file,
    });
    return findings;
  }

  const squatOf = findTyposquatTarget(ref);
  if (squatOf) {
    findings.push({
      ruleId: 'AG-DP-002',
      category: 'supply-chain',
      severity: 'high',
      message: `"${ref.name}" is one edit away from popular package "${squatOf}" — possible typosquat${origin}`,
      target: target(ref),
      file: ref.file,
    });
  }

  const young = info.ageDays !== undefined && info.ageDays < 30;
  const fewDownloads = info.weeklyDownloads !== undefined && info.weeklyDownloads < 100;
  if (young && (fewDownloads || info.weeklyDownloads === undefined)) {
    findings.push({
      ruleId: 'AG-DP-003',
      category: 'supply-chain',
      severity: 'high',
      message: `"${ref.name}" was first published ${info.ageDays} day(s) ago${info.weeklyDownloads !== undefined ? ` with ${info.weeklyDownloads} weekly downloads` : ''} — matches the slopsquat registration pattern${origin}`,
      target: target(ref),
      file: ref.file,
    });
  } else if (fewDownloads && info.versionCount !== undefined && info.versionCount <= 2) {
    findings.push({
      ruleId: 'AG-DP-003',
      category: 'supply-chain',
      severity: 'medium',
      message: `"${ref.name}" has ${info.weeklyDownloads} weekly downloads and only ${info.versionCount} version(s) — low-adoption package, review before trusting${origin}`,
      target: target(ref),
      file: ref.file,
    });
  }

  if (ref.ecosystem === 'npm' && info.hasInstallScripts && (young || fewDownloads || squatOf)) {
    findings.push({
      ruleId: 'AG-DP-004',
      category: 'supply-chain',
      severity: 'high',
      message: `"${ref.name}" runs npm install scripts — the primary slopsquat payload vector — and has other risk signals`,
      target: target(ref),
      file: ref.file,
    });
  }

  const weak: string[] = [];
  if (info.hasRepository === false) weak.push('no source repository');
  if (info.hasLicense === false) weak.push('no license');
  if (info.hasDescription === false) weak.push('no description');
  if (info.versionCount === 1) weak.push('single version');
  if (weak.length >= 2 && (young || fewDownloads)) {
    findings.push({
      ruleId: 'AG-DP-005',
      category: 'supply-chain',
      severity: 'low',
      message: `"${ref.name}" has weak registry metadata: ${weak.join(', ')}`,
      target: target(ref),
      file: ref.file,
    });
  }
  return findings;
}

export function scoreDependencies(results: DepCheckResult[]): Finding[] {
  return results.flatMap((r) => scoreDependency(r));
}

/** Offline mode: only name-shape checks (typosquat similarity), no registry data. */
export function scoreOffline(refs: DependencyRef[]): Finding[] {
  const findings: Finding[] = [];
  for (const ref of refs) {
    const squatOf = findTyposquatTarget(ref);
    if (squatOf) {
      findings.push({
        ruleId: 'AG-DP-002',
        category: 'supply-chain',
        severity: 'high',
        message: `"${ref.name}" is one edit away from popular package "${squatOf}" — possible typosquat (offline check)`,
        target: target(ref),
        file: ref.file,
      });
    }
  }
  return findings;
}
