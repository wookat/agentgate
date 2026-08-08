import { describe, expect, it } from 'vitest';
import { editDistance, findTyposquatTarget, scoreDependencies, scoreDependency, scoreOffline, scoreRemoteSpecs } from '../src/deps/score.js';
import { DepCheckResult, DependencyRef } from '../src/deps/types.js';

function ref(partial: Partial<DependencyRef> = {}): DependencyRef {
  return { name: 'some-pkg', ecosystem: 'npm', origin: 'manifest', file: 'package.json', ...partial };
}

describe('editDistance', () => {
  it('computes substitutions, insertions, transpositions', () => {
    expect(editDistance('react', 'react')).toBe(0);
    expect(editDistance('reqests', 'requests')).toBe(1);
    expect(editDistance('lodahs', 'lodash')).toBe(1); // transposition
    expect(editDistance('abc', 'xyz', 2)).toBeGreaterThan(2);
    expect(editDistance('a', 'abcd', 2)).toBe(3); // length gap short-circuit
  });
});

describe('findTyposquatTarget', () => {
  it('flags one-edit neighbors of popular packages', () => {
    expect(findTyposquatTarget(ref({ name: 'lodahs' }))).toBe('lodash');
    expect(findTyposquatTarget(ref({ name: 'reqests', ecosystem: 'pypi' }))).toBe('requests');
  });
  it('does not flag popular packages themselves or short names', () => {
    expect(findTyposquatTarget(ref({ name: 'lodash' }))).toBeUndefined();
    expect(findTyposquatTarget(ref({ name: 'abc' }))).toBeUndefined();
  });
});

describe('scoreDependency', () => {
  it('flags nonexistent packages as critical and stops there', () => {
    const findings = scoreDependency({ ref: ref({ name: 'ghost-pkg', origin: 'import', file: 'app.js' }), info: { exists: false } });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'AG-DP-001', severity: 'critical', target: 'npm:ghost-pkg (import)' });
    expect(findings[0]!.message).toContain('imported in app.js');
  });

  it('downgrades nonexistent import-only packages under test/example paths to low', () => {
    const findings = scoreDependency({
      ref: ref({ name: 'runtime_module', ecosystem: 'pypi', origin: 'import', file: 'tests/test_config.py' }),
      info: { exists: false },
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'AG-DP-001', severity: 'low' });
    expect(findings[0]!.message).toContain('test/example path');
  });

  it('keeps manifest-declared nonexistent packages critical even under test paths', () => {
    const findings = scoreDependency({
      ref: ref({ name: 'ghost', ecosystem: 'pypi', origin: 'manifest', file: 'tests/requirements.txt' }),
      info: { exists: false },
    });
    expect(findings[0]).toMatchObject({ severity: 'critical' });
  });

  it('reports registry errors as info, not failures', () => {
    const findings = scoreDependency({ ref: ref(), error: 'timeout' });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'AG-DP-001', severity: 'info' });
  });

  it('flags young low-download packages as high', () => {
    const findings = scoreDependency({
      ref: ref(),
      info: { exists: true, ageDays: 3, weeklyDownloads: 5, versionCount: 1, hasRepository: false, hasLicense: false, hasDescription: true },
    });
    expect(findings.map((f) => f.ruleId)).toContain('AG-DP-003');
    expect(findings.find((f) => f.ruleId === 'AG-DP-003')!.severity).toBe('high');
    expect(findings.map((f) => f.ruleId)).toContain('AG-DP-005');
  });

  it('flags low-adoption mature packages as medium', () => {
    const findings = scoreDependency({
      ref: ref(),
      info: { exists: true, ageDays: 400, weeklyDownloads: 2, versionCount: 1, hasRepository: true, hasLicense: true, hasDescription: true },
    });
    expect(findings.find((f) => f.ruleId === 'AG-DP-003')!.severity).toBe('medium');
  });

  it('flags install scripts combined with other signals', () => {
    const findings = scoreDependency({
      ref: ref(),
      info: { exists: true, ageDays: 2, weeklyDownloads: 0, versionCount: 1, hasInstallScripts: true, hasRepository: true, hasLicense: true, hasDescription: true },
    });
    expect(findings.map((f) => f.ruleId)).toContain('AG-DP-004');
  });

  it('emits nothing for healthy packages', () => {
    const findings = scoreDependency({
      ref: ref({ name: 'express' }),
      info: { exists: true, ageDays: 4000, weeklyDownloads: 30000000, versionCount: 271, hasRepository: true, hasLicense: true, hasDescription: true, hasInstallScripts: false },
    });
    expect(findings).toEqual([]);
  });
});

describe('scoreDependencies / scoreOffline', () => {
  it('flattens results', () => {
    const results: DepCheckResult[] = [
      { ref: ref({ name: 'ghost' }), info: { exists: false } },
      { ref: ref({ name: 'express' }), info: { exists: true, ageDays: 4000, weeklyDownloads: 1e7, versionCount: 100, hasRepository: true, hasLicense: true, hasDescription: true } },
    ];
    expect(scoreDependencies(results)).toHaveLength(1);
  });

  it('offline mode only does name-shape checks', () => {
    const findings = scoreOffline([ref({ name: 'lodahs' }), ref({ name: 'totally-unknown-pkg' })]);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'AG-DP-002', severity: 'high' });
  });
});

describe('scoreRemoteSpecs', () => {
  const spec = (name: string, s: string) => ({ name, ecosystem: 'npm' as const, spec: s, file: 'package.json', context: 'dependencies' });
  const pySpec = (name: string, s: string) => ({ name, ecosystem: 'pypi' as const, spec: s, file: 'requirements.txt', context: 'requirements' });

  it('flags unpinned git refs medium and non-registry archive URLs high (AG-DP-007)', () => {
    const findings = scoreRemoteSpecs([
      spec('branchdep', 'github:acme/branchdep#main'),
      spec('tagdep', 'git+https://github.com/acme/tagdep.git#v1.2.3'),
      spec('tarball', 'https://cdn.example.com/tarball-1.0.0.tgz'),
    ]);
    expect(findings.map((f) => `${f.ruleId}:${f.severity}:${f.target}`)).toEqual([
      'AG-DP-007:medium:npm:branchdep',
      'AG-DP-007:medium:npm:tagdep',
      'AG-DP-007:high:npm:tarball',
    ]);
  });

  it('does not flag commit-pinned git specs or registry tarball hosts', () => {
    expect(
      scoreRemoteSpecs([
        spec('pinned', 'git+https://github.com/acme/pinned.git#aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
        spec('registry', 'https://registry.npmjs.org/x/-/x-1.0.0.tgz'),
        pySpec('sha-archive', 'https://github.com/acme/pyrav4l2/archive/3c071a7494b6b67263c4dddb87b47025338fd960.zip'),
      ]),
    ).toEqual([]);
  });

  it('classifies PyPI direct-URL requirements with pypi targets', () => {
    const findings = scoreRemoteSpecs([
      pySpec('tweety-ns', 'https://github.com/acme/tweety/archive/main.zip'),
      pySpec('tagged', 'git+https://github.com/acme/tagged.git@v0.2.0'),
      pySpec('pinned', 'git+https://github.com/acme/pinned.git@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
    ]);
    expect(findings.map((f) => `${f.ruleId}:${f.severity}:${f.target}`)).toEqual([
      'AG-DP-007:high:pypi:tweety-ns',
      'AG-DP-007:medium:pypi:tagged',
    ]);
  });
});
