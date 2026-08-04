import fs from 'node:fs';
import pc from 'picocolors';
import { LockDiff, createLockfile, diffLockfiles, formatDiff, parseLockfile } from 'mcp-agentgate-core';
import { gatherServers, gatherSurfaces } from '../context.js';
import { GENERATED_BY } from './lock.js';

export interface DiffOptions {
  config?: string;
  server?: string[];
  lockfile: string;
  timeout: string;
  json?: boolean;
}

export async function computeDrift(opts: DiffOptions): Promise<{ diff: LockDiff; errors: { server: string; error: string }[] } | { fatal: string }> {
  if (!fs.existsSync(opts.lockfile)) {
    return { fatal: `lockfile not found: ${opts.lockfile} (run \`agentgate lock\` first)` };
  }
  let baseline;
  try {
    baseline = parseLockfile(fs.readFileSync(opts.lockfile, 'utf8'));
  } catch (err) {
    return { fatal: `invalid lockfile ${opts.lockfile}: ${err instanceof Error ? err.message : err}` };
  }
  const lockedServers = Object.keys(baseline.servers);
  const { servers } = gatherServers({ config: opts.config, server: opts.server ?? lockedServers });
  const { surfaces, errors } = await gatherSurfaces(servers, Number(opts.timeout));
  const current = createLockfile(surfaces, GENERATED_BY);
  return { diff: diffLockfiles(baseline, current), errors };
}

export async function runDiff(opts: DiffOptions): Promise<number> {
  const result = await computeDrift(opts);
  if ('fatal' in result) {
    console.error(pc.red(`error: ${result.fatal}`));
    return 2;
  }
  for (const { server, error } of result.errors) {
    console.error(pc.yellow(`warning: could not reach "${server}": ${error}`));
  }
  if (opts.json) {
    console.log(JSON.stringify(result.diff, null, 2));
  } else {
    console.log(result.diff.drifted ? pc.red(formatDiff(result.diff)) : pc.green(formatDiff(result.diff)));
  }
  return result.diff.drifted ? 1 : 0;
}
