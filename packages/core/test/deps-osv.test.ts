import { describe, expect, it } from 'vitest';
import { queryOsvMalware } from '../src/deps/osv.js';
import { scoreAdvisories } from '../src/deps/score.js';
import { DependencyRef } from '../src/deps/types.js';

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

const ref = (name: string, ecosystem: 'npm' | 'pypi' = 'npm'): DependencyRef => ({
  name,
  ecosystem,
  origin: 'manifest',
  file: 'package.json',
});

describe('queryOsvMalware', () => {
  it('reports MAL advisories and ignores version-range vulnerabilities', async () => {
    const fetchFn: typeof fetch = (input, init) => {
      const url = String(input);
      if (url.endsWith('/querybatch')) {
        const queries = (JSON.parse(String(init?.body)) as { queries: unknown[] }).queries;
        expect(queries).toHaveLength(2);
        return Promise.resolve(
          jsonResponse(200, {
            results: [{ vulns: [{ id: 'MAL-2026-4312', modified: 'x' }, { id: 'GHSA-aaaa-bbbb-cccc', modified: 'x' }] }, {}],
          }),
        );
      }
      return Promise.resolve(jsonResponse(200, { summary: 'Malware in evil-pkg (npm)', affected: [{ ranges: [{ events: [{ introduced: '0' }] }] }] }));
    };
    const { advisories, error } = await queryOsvMalware([ref('evil-pkg'), ref('lodash')], { fetchFn });
    expect(error).toBeUndefined();
    expect(advisories).toHaveLength(1);
    expect(advisories[0]).toMatchObject({ id: 'MAL-2026-4312', summary: 'Malware in evil-pkg (npm)' });
    expect(advisories[0]!.ref.name).toBe('evil-pkg');
    expect(advisories[0]!.affectedVersions).toBeUndefined();
  });

  it('extracts enumerated affected versions for compromised-release advisories', async () => {
    const fetchFn: typeof fetch = (input) => {
      if (String(input).endsWith('/querybatch')) {
        return Promise.resolve(jsonResponse(200, { results: [{ vulns: [{ id: 'MAL-2025-46974', modified: 'x' }] }] }));
      }
      return Promise.resolve(jsonResponse(200, { summary: 'Malicious code in debug (npm)', affected: [{ versions: ['4.4.2'] }] }));
    };
    const { advisories } = await queryOsvMalware([ref('debug')], { fetchFn });
    expect(advisories[0]!.affectedVersions).toEqual(['4.4.2']);
  });

  it('degrades gracefully when the OSV API is unreachable', async () => {
    const fetchFn: typeof fetch = () => Promise.reject(new Error('fetch failed'));
    const { advisories, error } = await queryOsvMalware([ref('anything')], { fetchFn });
    expect(advisories).toHaveLength(0);
    expect(error).toBe('fetch failed');
  });

  it('deduplicates refs across files before querying', async () => {
    let batchCalls = 0;
    const fetchFn: typeof fetch = (input, init) => {
      if (String(input).endsWith('/querybatch')) {
        batchCalls++;
        expect((JSON.parse(String(init?.body)) as { queries: unknown[] }).queries).toHaveLength(1);
        return Promise.resolve(jsonResponse(200, { results: [{}] }));
      }
      return Promise.resolve(jsonResponse(200, {}));
    };
    await queryOsvMalware([ref('same'), { ...ref('same'), file: 'src/app.ts', origin: 'import' }], { fetchFn });
    expect(batchCalls).toBe(1);
  });
});

describe('scoreAdvisories', () => {
  it('produces critical AG-DP-006 findings with an OSV link', () => {
    const findings = scoreAdvisories([{ ref: ref('evil-pkg'), id: 'MAL-2026-4312', summary: 'Malware in evil-pkg (npm)' }]);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'AG-DP-006', severity: 'critical' });
    expect(findings[0]!.detail).toBe('https://osv.dev/vulnerability/MAL-2026-4312');
    expect(findings[0]!.message).toContain('known-malicious');
  });

  it('downgrades version-scoped advisories when the installed version is unaffected', () => {
    const advisory = { ref: ref('debug'), id: 'MAL-2025-46974', affectedVersions: ['4.4.2'] };
    const clean = scoreAdvisories([advisory], () => '4.4.3');
    expect(clean[0]).toMatchObject({ severity: 'low' });
    const hit = scoreAdvisories([advisory], () => '4.4.2');
    expect(hit[0]).toMatchObject({ severity: 'critical' });
    const unknown = scoreAdvisories([advisory], () => undefined);
    expect(unknown[0]).toMatchObject({ severity: 'high' });
    expect(unknown[0]!.message).toContain('4.4.2');
  });
});
