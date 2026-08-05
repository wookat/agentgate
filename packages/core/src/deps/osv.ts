import { DepEcosystem, DependencyRef } from './types.js';

export interface OsvAdvisory {
  ref: DependencyRef;
  /** OSV advisory id (e.g. MAL-2026-4312). */
  id: string;
  summary?: string;
  /**
   * Enumerated affected versions, when the advisory scopes the malware to
   * specific releases (a compromised-release incident rather than a
   * package that is malware in every version). Undefined = all versions.
   */
  affectedVersions?: string[];
}

export interface OsvQueryResult {
  advisories: OsvAdvisory[];
  /** Network/API error, when the OSV API could not be reached at all. */
  error?: string;
}

export interface OsvOptions {
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

const OSV_ECOSYSTEM: Record<DepEcosystem, string> = { npm: 'npm', pypi: 'PyPI' };
const BATCH_SIZE = 500;

interface BatchVuln {
  id: string;
}

/**
 * Check dependencies against the OSV.dev database for known-malicious packages
 * (MAL-* entries from the OSV malicious-packages project, which aggregates the
 * GitHub Advisory Database, PyPI, and partner feeds). Version-range
 * vulnerabilities are out of scope here: package-level malware applies to every
 * version, which is exactly the class relevant to hallucinated/typosquatted names.
 */
export async function queryOsvMalware(refs: DependencyRef[], opts: OsvOptions = {}): Promise<OsvQueryResult> {
  const fetchFn = opts.fetchFn ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 10000;
  const unique = [...new Map(refs.map((r) => [`${r.ecosystem}:${r.name}`, r])).values()];
  const advisories: OsvAdvisory[] = [];

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    let results: { vulns?: BatchVuln[] }[];
    try {
      const res = await fetchFn('https://api.osv.dev/v1/querybatch', {
        method: 'POST',
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'content-type': 'application/json', 'user-agent': 'agentgate (https://github.com/wookat/agentgate)' },
        body: JSON.stringify({
          queries: batch.map((r) => ({ package: { name: r.name, ecosystem: OSV_ECOSYSTEM[r.ecosystem] } })),
        }),
      });
      if (!res.ok) throw new Error(`OSV API responded ${res.status}`);
      results = ((await res.json()) as { results?: { vulns?: BatchVuln[] }[] }).results ?? [];
    } catch (err) {
      return { advisories, error: err instanceof Error ? err.message : String(err) };
    }
    for (let j = 0; j < batch.length; j++) {
      const malware = (results[j]?.vulns ?? []).filter((v) => v.id.startsWith('MAL-'));
      for (const v of malware) {
        advisories.push({ ref: batch[j]!, ...(await fetchDetails(fetchFn, v.id, timeoutMs)) });
      }
    }
  }
  return { advisories };
}

async function fetchDetails(
  fetchFn: typeof fetch,
  id: string,
  timeoutMs: number,
): Promise<{ id: string; summary?: string; affectedVersions?: string[] }> {
  try {
    const res = await fetchFn(`https://api.osv.dev/v1/vulns/${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: 'application/json', 'user-agent': 'agentgate (https://github.com/wookat/agentgate)' },
    });
    if (!res.ok) return { id };
    const data = (await res.json()) as {
      summary?: string;
      affected?: { versions?: string[]; ranges?: { events?: { introduced?: string; fixed?: string }[] }[] }[];
    };
    // Treat the advisory as version-scoped only when every affected entry
    // enumerates versions; any open range means "assume all versions".
    const affected = data.affected ?? [];
    const scoped = affected.length > 0 && affected.every((a) => (a.versions?.length ?? 0) > 0 && !a.ranges?.length);
    return {
      id,
      summary: data.summary,
      affectedVersions: scoped ? affected.flatMap((a) => a.versions ?? []) : undefined,
    };
  } catch {
    return { id };
  }
}
