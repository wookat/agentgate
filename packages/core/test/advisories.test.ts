import { describe, expect, it } from 'vitest';
import { MCPA_ADVISORIES, McpaAdvisory, fetchLiveMcpaAdvisories, matchMcpaAdvisories, scoreMcpaMatches } from '../src/index.js';

const ranged: McpaAdvisory = {
  id: 'MCPA-9999-0001',
  title: 'test-pkg RCE before 2.0.0',
  type: 'rce-vectors',
  severity: 'critical',
  packages: [{ ecosystem: 'npm', name: 'test-pkg', ranges: [{ introduced: '0.5.0', fixed: '2.0.0' }] }],
};

const packageWide: McpaAdvisory = {
  id: 'MCPA-9999-0002',
  title: 'evil-pkg is malware',
  type: 'malicious-package',
  severity: 'critical',
  packages: [{ ecosystem: 'pypi', name: 'evil-pkg', ranges: [{ introduced: '0' }] }],
};

describe('matchMcpaAdvisories', () => {
  it('matches a version inside a fixed range', () => {
    const m = matchMcpaAdvisories('test-pkg', 'npm', '1.4.0', [ranged]);
    expect(m).toHaveLength(1);
    expect(m[0]!.versionConfirmed).toBe(true);
  });

  it('does not match versions before introduced or at/after fixed', () => {
    expect(matchMcpaAdvisories('test-pkg', 'npm', '0.4.9', [ranged])).toHaveLength(0);
    expect(matchMcpaAdvisories('test-pkg', 'npm', '2.0.0', [ranged])).toHaveLength(0);
    expect(matchMcpaAdvisories('test-pkg', 'npm', '2.1.0', [ranged])).toHaveLength(0);
  });

  it('matches last_affected inclusively', () => {
    const la: McpaAdvisory = {
      ...ranged,
      packages: [{ ecosystem: 'npm', name: 'test-pkg', ranges: [{ introduced: '1.0.0', last_affected: '1.2.3' }] }],
    };
    expect(matchMcpaAdvisories('test-pkg', 'npm', '1.2.3', [la])).toHaveLength(1);
    expect(matchMcpaAdvisories('test-pkg', 'npm', '1.2.4', [la])).toHaveLength(0);
  });

  it('without a version, a ranged advisory matches unconfirmed; an open range confirmed', () => {
    const m1 = matchMcpaAdvisories('test-pkg', 'npm', undefined, [ranged]);
    expect(m1).toHaveLength(1);
    expect(m1[0]!.versionConfirmed).toBe(false);
    const m2 = matchMcpaAdvisories('evil-pkg', 'pypi', undefined, [packageWide]);
    expect(m2).toHaveLength(1);
    expect(m2[0]!.versionConfirmed).toBe(true);
  });

  it('requires the ecosystem to match and compares names case-insensitively', () => {
    expect(matchMcpaAdvisories('test-pkg', 'pypi', '1.0.0', [ranged])).toHaveLength(0);
    expect(matchMcpaAdvisories('Test-Pkg', 'npm', '1.0.0', [ranged])).toHaveLength(1);
  });

  it('bundled database is loaded and finds a real entry', () => {
    expect(MCPA_ADVISORIES.length).toBeGreaterThan(0);
    const m = matchMcpaAdvisories('mcp-remote', 'npm', '0.1.10');
    expect(m.some((x) => x.advisory.id === 'MCPA-2025-0001' && x.versionConfirmed)).toBe(true);
    expect(matchMcpaAdvisories('mcp-remote', 'npm', '0.1.16')).toHaveLength(0);
  });
});

describe('scoreMcpaMatches', () => {
  it('confirmed matches carry the advisory severity and link', () => {
    const [f] = scoreMcpaMatches(
      [{ advisory: ranged, versionConfirmed: true }],
      { name: 'test-pkg', ecosystem: 'npm', version: '1.0.0' },
      { serverName: 'srv', file: 'mcp.json' },
    );
    expect(f!.ruleId).toBe('AG-SC-003');
    expect(f!.severity).toBe('critical');
    expect(f!.detail).toContain('/advisories/mcpa-9999-0001/');
    expect(f!.message).toContain('server "srv"');
  });

  it('unconfirmed matches downgrade to medium with a pin instruction', () => {
    const [f] = scoreMcpaMatches(
      [{ advisory: ranged, versionConfirmed: false }],
      { name: 'test-pkg', ecosystem: 'npm' },
      { serverName: 'srv' },
    );
    expect(f!.severity).toBe('medium');
    expect(f!.message).toContain('pin');
  });
});

describe('fetchLiveMcpaAdvisories', () => {
  const jsonResponse = (body: unknown, status = 200) =>
    Promise.resolve(new Response(JSON.stringify(body), { status }));

  it('merges live records over the bundled database by id', async () => {
    const bundledId = MCPA_ADVISORIES[0]!.id;
    const override: McpaAdvisory = { ...ranged, id: bundledId };
    const fresh: McpaAdvisory = { ...packageWide, id: 'MCPA-9999-0100' };
    const res = await fetchLiveMcpaAdvisories({
      fetchFn: () => jsonResponse({ advisories: [override, fresh] }),
    });
    expect(res.error).toBeUndefined();
    expect(res.advisories.length).toBe(MCPA_ADVISORIES.length + 1);
    expect(res.advisories.find((a) => a.id === bundledId)?.title).toBe(ranged.title);
    expect(res.advisories.find((a) => a.id === 'MCPA-9999-0100')).toBeDefined();
  });

  it('drops malformed live records', async () => {
    const res = await fetchLiveMcpaAdvisories({
      fetchFn: () => jsonResponse({ advisories: [{ id: 'MCPA-9999-0101' }, 42, null] }),
    });
    expect(res.error).toBeUndefined();
    expect(res.advisories.length).toBe(MCPA_ADVISORIES.length);
  });

  it('falls back to the bundled database on HTTP errors and network failures', async () => {
    const http = await fetchLiveMcpaAdvisories({ fetchFn: () => jsonResponse({}, 500) });
    expect(http.error).toContain('500');
    expect(http.advisories).toBe(MCPA_ADVISORIES);

    const network = await fetchLiveMcpaAdvisories({ fetchFn: () => Promise.reject(new Error('fetch failed')) });
    expect(network.error).toBe('fetch failed');
    expect(network.advisories).toBe(MCPA_ADVISORIES);
  });
});
