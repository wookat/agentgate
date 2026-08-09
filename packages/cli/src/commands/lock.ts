import fs from 'node:fs';
import pc from 'picocolors';
import { LOCKFILE_NAME, SkillsLock, ToolSurface, collectSkillFiles, createLockfile, lockSkills, serializeLockfile } from 'mcp-agentgate-core';
import { gatherServers, gatherSurfaces } from '../context.js';
import { CLI_VERSION } from '../version.js';

export interface LockOptions {
  config?: string;
  server?: string[];
  out: string;
  timeout: string;
  /** true = current directory; string = explicit directory */
  skills?: boolean | string;
}

export function skillsDir(skills: boolean | string | undefined): string | undefined {
  if (skills === undefined || skills === false) return undefined;
  return skills === true ? '.' : skills;
}

export const GENERATED_BY = `mcp-agentgate@${CLI_VERSION}`;

export async function runLock(opts: LockOptions): Promise<number> {
  const dir = skillsDir(opts.skills);
  let skills: SkillsLock | undefined;
  if (dir !== undefined) {
    skills = lockSkills(collectSkillFiles(dir));
  }
  const { servers } = gatherServers({ config: opts.config, server: opts.server });
  if (servers.length === 0 && !skills) {
    console.error(pc.red('error: no MCP servers found (use --config to point at a client config file)'));
    return 2;
  }
  let surfaces: Record<string, ToolSurface[]> = {};
  let errors: { server: string; error: string }[] = [];
  if (servers.length > 0) {
    console.error(pc.dim(`Connecting to ${servers.length} server(s) to capture their tool surface…`));
    ({ surfaces, errors } = await gatherSurfaces(servers, Number(opts.timeout)));
    for (const { server, error } of errors) {
      console.error(pc.yellow(`warning: skipped "${server}": ${error}`));
    }
  }
  if (Object.keys(surfaces).length === 0 && !skills) {
    console.error(pc.red('error: could not capture any tool surface; nothing to lock'));
    return 2;
  }
  const lockfile = createLockfile(surfaces, GENERATED_BY, skills);
  fs.writeFileSync(opts.out, serializeLockfile(lockfile));
  const toolCount = Object.values(surfaces).reduce((n, tools) => n + tools.length, 0);
  const skillNote = skills ? ` + ${Object.keys(skills.files).length} skill file(s)` : '';
  console.log(
    pc.green(`✔ Locked ${toolCount} tool(s) across ${Object.keys(surfaces).length} server(s)${skillNote} → ${opts.out || LOCKFILE_NAME}`),
  );
  return errors.length > 0 ? 1 : 0;
}
