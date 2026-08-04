import { normalizeName } from './collect.js';
import { DepCheckResult, DependencyRef, RegistryInfo } from './types.js';

export interface VerifyOptions {
  /** Per-request timeout in ms (default 10000). */
  timeoutMs?: number;
  /** Max concurrent registry lookups (default 8). */
  concurrency?: number;
  /** Injectable fetch for testing. */
  fetchFn?: typeof fetch;
}

const DAY_MS = 24 * 60 * 60 * 1000;

async function getJson(fetchFn: typeof fetch, url: string, timeoutMs: number): Promise<{ status: number; body?: unknown }> {
  const res = await fetchFn(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { accept: 'application/json', 'user-agent': 'agentgate (https://github.com/wookat/agentgate)' },
  });
  if (res.status === 404) return { status: 404 };
  if (!res.ok) throw new Error(`registry responded ${res.status} for ${url}`);
  return { status: res.status, body: (await res.json()) as unknown };
}

export async function fetchNpmInfo(name: string, opts: VerifyOptions = {}): Promise<RegistryInfo> {
  const fetchFn = opts.fetchFn ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 10000;
  const { status, body } = await getJson(fetchFn, `https://registry.npmjs.org/${encodeURIComponent(name).replace('%40', '@')}`, timeoutMs);
  if (status === 404) return { exists: false };
  const data = body as {
    time?: Record<string, string>;
    versions?: Record<string, { scripts?: Record<string, string> }>;
    'dist-tags'?: Record<string, string>;
    repository?: unknown;
    license?: unknown;
    description?: unknown;
  };
  const created = data.time?.['created'];
  const latestVersion = data['dist-tags']?.['latest'];
  const latest = latestVersion ? data.versions?.[latestVersion] : undefined;
  const scripts = latest?.scripts ?? {};
  const info: RegistryInfo = {
    exists: true,
    ageDays: created ? Math.floor((Date.now() - Date.parse(created)) / DAY_MS) : undefined,
    versionCount: data.versions ? Object.keys(data.versions).length : undefined,
    hasRepository: Boolean(data.repository),
    hasLicense: Boolean(data.license),
    hasDescription: Boolean(typeof data.description === 'string' && data.description.trim()),
    hasInstallScripts: ['preinstall', 'install', 'postinstall'].some((s) => s in scripts),
  };
  try {
    const dl = await getJson(fetchFn, `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name).replace('%40', '@')}`, timeoutMs);
    const downloads = (dl.body as { downloads?: number } | undefined)?.downloads;
    if (typeof downloads === 'number') info.weeklyDownloads = downloads;
  } catch {
    // downloads are a soft signal; ignore failures
  }
  return info;
}

export async function fetchPypiInfo(name: string, opts: VerifyOptions = {}): Promise<RegistryInfo> {
  const fetchFn = opts.fetchFn ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 10000;
  const { status, body } = await getJson(fetchFn, `https://pypi.org/pypi/${encodeURIComponent(name)}/json`, timeoutMs);
  if (status === 404) return { exists: false };
  const data = body as {
    info?: { summary?: unknown; license?: unknown; project_urls?: Record<string, string> | null; author?: unknown; author_email?: unknown };
    releases?: Record<string, { upload_time_iso_8601?: string }[]>;
  };
  const releases = data.releases ?? {};
  let earliest: number | undefined;
  for (const files of Object.values(releases)) {
    for (const f of files) {
      if (!f.upload_time_iso_8601) continue;
      const t = Date.parse(f.upload_time_iso_8601);
      if (earliest === undefined || t < earliest) earliest = t;
    }
  }
  const urls = data.info?.project_urls ?? {};
  const hasRepo = Object.entries(urls).some(
    ([k, v]) => /source|repository|github|gitlab|code/i.test(k) || /github\.com|gitlab\.com|codeberg\.org/i.test(v ?? ''),
  );
  return {
    exists: true,
    ageDays: earliest !== undefined ? Math.floor((Date.now() - earliest) / DAY_MS) : undefined,
    versionCount: Object.keys(releases).length,
    hasRepository: hasRepo,
    hasLicense: Boolean(typeof data.info?.license === 'string' && data.info.license.trim()),
    hasDescription: Boolean(typeof data.info?.summary === 'string' && data.info.summary.trim()),
    // PyPI JSON API has no reliable download counts; leave weeklyDownloads unset.
  };
}

/** Verify each dependency against its live registry, with bounded concurrency. */
export async function verifyDependencies(refs: DependencyRef[], opts: VerifyOptions = {}): Promise<DepCheckResult[]> {
  const concurrency = opts.concurrency ?? 8;
  const results: DepCheckResult[] = new Array<DepCheckResult>(refs.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < refs.length) {
      const i = next++;
      const ref = refs[i]!;
      try {
        const info =
          ref.ecosystem === 'npm'
            ? await fetchNpmInfo(ref.name, opts)
            : await fetchPypiInfo(normalizeName(ref.name, 'pypi'), opts);
        results[i] = { ref, info };
      } catch (err) {
        results[i] = { ref, error: err instanceof Error ? err.message : String(err) };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, refs.length) }, () => worker()));
  return results;
}
