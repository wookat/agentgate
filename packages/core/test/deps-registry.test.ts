import { describe, expect, it } from 'vitest';
import { fetchNpmInfo, fetchPypiInfo, verifyDependencies } from '../src/deps/registry.js';
import { DependencyRef } from '../src/deps/types.js';

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

function mockFetch(handler: (url: string) => Response): typeof fetch {
  return (input) => Promise.resolve(handler(String(input)));
}

const NPM_DOC = {
  time: { created: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
  versions: { '1.0.0': { scripts: { postinstall: 'node x.js' } } },
  'dist-tags': { latest: '1.0.0' },
  repository: { url: 'https://github.com/x/y' },
  license: 'MIT',
  description: 'a package',
};

describe('fetchNpmInfo', () => {
  it('maps registry metadata', async () => {
    const fetchFn = mockFetch((url) =>
      url.includes('api.npmjs.org') ? jsonResponse(200, { downloads: 42 }) : jsonResponse(200, NPM_DOC),
    );
    const info = await fetchNpmInfo('some-pkg', { fetchFn });
    expect(info).toMatchObject({ exists: true, versionCount: 1, hasRepository: true, hasLicense: true, hasInstallScripts: true, weeklyDownloads: 42 });
    expect(info.ageDays).toBeGreaterThanOrEqual(9);
  });

  it('returns exists=false on 404 and tolerates download failures', async () => {
    expect(await fetchNpmInfo('ghost', { fetchFn: mockFetch(() => jsonResponse(404)) })).toEqual({ exists: false });
    const info = await fetchNpmInfo('some-pkg', {
      fetchFn: mockFetch((url) => (url.includes('api.npmjs.org') ? jsonResponse(500) : jsonResponse(200, NPM_DOC))),
    });
    expect(info.exists).toBe(true);
    expect(info.weeklyDownloads).toBeUndefined();
  });

  it('throws on server errors', async () => {
    await expect(fetchNpmInfo('some-pkg', { fetchFn: mockFetch(() => jsonResponse(503)) })).rejects.toThrow('503');
  });
});

describe('fetchPypiInfo', () => {
  it('maps releases and project urls', async () => {
    const info = await fetchPypiInfo('flask', {
      fetchFn: mockFetch(() =>
        jsonResponse(200, {
          info: { summary: 'web framework', license: 'BSD', project_urls: { Source: 'https://github.com/pallets/flask' } },
          releases: { '1.0': [{ upload_time_iso_8601: '2018-04-26T00:00:00Z' }], '2.0': [{ upload_time_iso_8601: '2021-05-11T00:00:00Z' }] },
        }),
      ),
    });
    expect(info).toMatchObject({ exists: true, versionCount: 2, hasRepository: true, hasLicense: true, hasDescription: true });
    expect(info.ageDays).toBeGreaterThan(1000);
    expect(info.weeklyDownloads).toBeUndefined();
  });

  it('returns exists=false on 404', async () => {
    expect(await fetchPypiInfo('ghost', { fetchFn: mockFetch(() => jsonResponse(404)) })).toEqual({ exists: false });
  });
});

describe('verifyDependencies', () => {
  it('checks each ref against the right registry and captures errors', async () => {
    const refs: DependencyRef[] = [
      { name: 'ok-pkg', ecosystem: 'npm', origin: 'manifest', file: 'package.json' },
      { name: 'Ghost_Pkg', ecosystem: 'pypi', origin: 'manifest', file: 'requirements.txt' },
      { name: 'boom', ecosystem: 'npm', origin: 'manifest', file: 'package.json' },
    ];
    const fetchFn = mockFetch((url) => {
      if (url.includes('registry.npmjs.org/boom')) throw new Error('network down');
      if (url.includes('pypi.org')) {
        expect(url).toContain('ghost-pkg'); // PEP 503 normalization applied
        return jsonResponse(404);
      }
      if (url.includes('api.npmjs.org')) return jsonResponse(200, { downloads: 1 });
      return jsonResponse(200, NPM_DOC);
    });
    const results = await verifyDependencies(refs, { fetchFn, concurrency: 2 });
    expect(results[0]!.info?.exists).toBe(true);
    expect(results[1]!.info?.exists).toBe(false);
    expect(results[2]!.error).toContain('network down');
  });
});
