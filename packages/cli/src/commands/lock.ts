import fs from 'node:fs';
import pc from 'picocolors';
import { LOCKFILE_NAME, createLockfile, serializeLockfile } from '@agentgate/core';
import { gatherServers, gatherSurfaces } from '../context.js';

export interface LockOptions {
  config?: string;
  server?: string[];
  out: string;
  timeout: string;
}

export const GENERATED_BY = 'agentgate@0.1.0';

export async function runLock(opts: LockOptions): Promise<number> {
  const { servers } = gatherServers({ config: opts.config, server: opts.server });
  if (servers.length === 0) {
    console.error(pc.red('error: no MCP servers found (use --config to point at a client config file)'));
    return 2;
  }
  console.error(pc.dim(`Connecting to ${servers.length} server(s) to capture their tool surface…`));
  const { surfaces, errors } = await gatherSurfaces(servers, Number(opts.timeout));
  for (const { server, error } of errors) {
    console.error(pc.yellow(`warning: skipped "${server}": ${error}`));
  }
  if (Object.keys(surfaces).length === 0) {
    console.error(pc.red('error: could not capture any tool surface; nothing to lock'));
    return 2;
  }
  const lockfile = createLockfile(surfaces, GENERATED_BY);
  fs.writeFileSync(opts.out, serializeLockfile(lockfile));
  const toolCount = Object.values(surfaces).reduce((n, tools) => n + tools.length, 0);
  console.log(pc.green(`✔ Locked ${toolCount} tool(s) across ${Object.keys(surfaces).length} server(s) → ${opts.out || LOCKFILE_NAME}`));
  return errors.length > 0 ? 1 : 0;
}
