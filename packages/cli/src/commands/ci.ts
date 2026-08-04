import pc from 'picocolors';
import { Severity, formatDiff, scanServers, sortFindings } from 'mcp-agentgate-core';
import { gatherServers } from '../context.js';
import { maxSeverityAtLeast, renderFindingsTable } from '../output.js';
import { computeDrift } from './diff.js';

export interface CiOptions {
  config?: string;
  server?: string[];
  lockfile: string;
  timeout: string;
  failOn: Severity;
}

/**
 * CI gate: fail (non-zero exit) when the tool surface drifted from agentgate.lock
 * or when the static scan reports findings at/above the --fail-on threshold.
 */
export async function runCi(opts: CiOptions): Promise<number> {
  let failed = false;

  const drift = await computeDrift(opts);
  if ('fatal' in drift) {
    console.error(pc.red(`error: ${drift.fatal}`));
    return 2;
  }
  for (const { server, error } of drift.errors) {
    console.error(pc.yellow(`warning: could not reach "${server}": ${error}`));
    failed = true;
  }
  console.log(drift.diff.drifted ? pc.red(formatDiff(drift.diff)) : pc.green(formatDiff(drift.diff)));
  if (drift.diff.drifted) failed = true;

  const { servers } = gatherServers({ config: opts.config, server: opts.server });
  const findings = sortFindings(scanServers(servers));
  console.log('');
  console.log(renderFindingsTable(findings));
  if (maxSeverityAtLeast(findings, opts.failOn)) {
    console.log(pc.red(`\nGate failed: findings at or above "${opts.failOn}" severity`));
    failed = true;
  }

  if (failed) {
    console.log(pc.red('\n✖ agentgate ci: FAILED'));
    return 1;
  }
  console.log(pc.green('\n✔ agentgate ci: PASSED'));
  return 0;
}
