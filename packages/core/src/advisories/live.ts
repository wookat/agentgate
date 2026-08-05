import { McpaAdvisory } from './types.js';
import { MCPA_ADVISORIES } from './data.js';

const DEFAULT_API = 'https://agentgate-advisory-api.wookat520.workers.dev';

export interface LiveAdvisoryOptions {
  timeoutMs?: number;
  fetchFn?: typeof fetch;
  /** Override the advisory API base URL (also via AGENTGATE_ADVISORY_API). */
  apiBase?: string;
}

export interface LiveAdvisoryResult {
  /** Bundled database merged with any fresher records from the live API (live wins by id). */
  advisories: McpaAdvisory[];
  /** Set when the live API could not be reached — `advisories` is then the bundled database. */
  error?: string;
}

const SEVERITIES = new Set(['critical', 'high', 'medium', 'low']);

function isMcpaAdvisory(a: unknown): a is McpaAdvisory {
  if (typeof a !== 'object' || a === null) return false;
  const rec = a as Record<string, unknown>;
  return (
    typeof rec.id === 'string' &&
    typeof rec.title === 'string' &&
    typeof rec.type === 'string' &&
    typeof rec.severity === 'string' &&
    SEVERITIES.has(rec.severity) &&
    Array.isArray(rec.packages)
  );
}

/**
 * Fetch the current MCPA advisory database from the AgentGate advisory API
 * and merge it over the bundled copy, so scans see advisories published after
 * this CLI release. Failures fall back to the bundled database.
 */
export async function fetchLiveMcpaAdvisories(opts: LiveAdvisoryOptions = {}): Promise<LiveAdvisoryResult> {
  const fetchFn = opts.fetchFn ?? fetch;
  const base = opts.apiBase ?? process.env.AGENTGATE_ADVISORY_API ?? DEFAULT_API;
  const timeoutMs = opts.timeoutMs ?? 5000;
  try {
    const res = await fetchFn(`${base}/v1/advisories`, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: 'application/json' },
    });
    if (!res.ok) {
      return { advisories: MCPA_ADVISORIES, error: `advisory API responded ${res.status}` };
    }
    const body = (await res.json()) as { advisories?: unknown[] };
    const live = (body.advisories ?? []).filter(isMcpaAdvisory);
    const merged = new Map(MCPA_ADVISORIES.map((a) => [a.id, a]));
    for (const a of live) merged.set(a.id, a);
    return { advisories: [...merged.values()] };
  } catch (err) {
    return { advisories: MCPA_ADVISORIES, error: err instanceof Error ? err.message : String(err) };
  }
}
