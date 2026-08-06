import pc from 'picocolors';
import Table from 'cli-table3';
import {
  MCPA_ADVISORIES,
  McpaAdvisory,
  fetchLiveMcpaAdvisories,
  matchMcpaAdvisories,
} from 'mcp-agentgate-core';
import { debugLog } from '../debug.js';

const SEVERITY_COLOR: Record<string, (s: string) => string> = {
  critical: (s) => pc.bold(pc.red(s)),
  high: pc.red,
  medium: pc.yellow,
  low: pc.cyan,
};

const sev = (s: string) => (SEVERITY_COLOR[s] ?? pc.dim)(s.toUpperCase());

export interface AdvisoryListOptions {
  json?: boolean;
  offline?: boolean;
  timeout: string;
}

export interface AdvisoryCheckOptions extends AdvisoryListOptions {
  ecosystem: string;
}

async function loadDatabase(opts: AdvisoryListOptions): Promise<{ advisories: McpaAdvisory[]; source: string }> {
  if (opts.offline) return { advisories: MCPA_ADVISORIES, source: 'bundled' };
  const live = await fetchLiveMcpaAdvisories({ timeoutMs: Number(opts.timeout) });
  if (live.error) {
    debugLog(`live advisory fetch failed: ${live.error}`);
    console.error(pc.yellow(`warning: advisory API unreachable (${live.error}); using the bundled database`));
    return { advisories: live.advisories, source: 'bundled' };
  }
  return { advisories: live.advisories, source: 'live' };
}

function publishedDate(a: McpaAdvisory): string {
  // Live API records carry the full timeline; the bundled subset has `published`.
  return a.published ?? (a as { timeline?: { published?: string } }).timeline?.published ?? 'unknown';
}

function byNewest(a: McpaAdvisory, b: McpaAdvisory): number {
  return a.id < b.id ? 1 : -1;
}

export async function runAdvisoryList(opts: AdvisoryListOptions): Promise<number> {
  const { advisories, source } = await loadDatabase(opts);
  const sorted = [...advisories].sort(byNewest);
  if (opts.json) {
    console.log(JSON.stringify({ source, count: sorted.length, advisories: sorted }, null, 2));
    return 0;
  }
  const table = new Table({
    head: ['ID', 'Severity', 'Type', 'Packages', 'Published'].map((h) => pc.bold(h)),
    wordWrap: true,
    colWidths: [16, 10, 20, 40, 12],
    style: { head: [] },
  });
  for (const a of sorted) {
    table.push([
      a.id,
      sev(a.severity),
      a.type,
      a.packages.map((p) => `${p.ecosystem}/${p.name}`).join('\n'),
      publishedDate(a),
    ]);
  }
  console.log(table.toString());
  console.log(`\n${sorted.length} advisories (${source} database). Details: https://agentgate.zalize.com/advisories/`);
  return 0;
}

export async function runAdvisoryCheck(spec: string, opts: AdvisoryCheckOptions): Promise<number> {
  const at = spec.lastIndexOf('@');
  const name = at > 0 ? spec.slice(0, at) : spec;
  const version = at > 0 ? spec.slice(at + 1) : undefined;
  if (!name) {
    console.error('usage: agentgate advisory check <package>[@version]');
    return 2;
  }
  const { advisories, source } = await loadDatabase(opts);
  const matches = matchMcpaAdvisories(name, opts.ecosystem, version, advisories);
  if (opts.json) {
    console.log(
      JSON.stringify(
        {
          package: { ecosystem: opts.ecosystem, name, version: version ?? null },
          source,
          matches: matches.map((m) => ({ versionConfirmed: m.versionConfirmed, advisory: m.advisory })),
        },
        null,
        2,
      ),
    );
    return matches.length > 0 ? 1 : 0;
  }
  const coord = `${opts.ecosystem}/${name}${version ? `@${version}` : ''}`;
  if (matches.length === 0) {
    console.log(pc.green(`✔ ${coord}: no MCPA advisories (${source} database, ${advisories.length} entries)`));
    return 0;
  }
  for (const m of matches.sort((x, y) => byNewest(x.advisory, y.advisory))) {
    const a = m.advisory;
    const confidence = m.versionConfirmed ? '' : pc.dim(' (no version given — match not version-confirmed)');
    console.log(`${sev(a.severity)} ${a.id}: ${a.title}${confidence}`);
    console.log(pc.dim(`  https://agentgate.zalize.com/advisories/${a.id.toLowerCase()}/`));
  }
  console.log(`\n${coord}: ${matches.length} advisory match(es) (${source} database)`);
  return 1;
}
