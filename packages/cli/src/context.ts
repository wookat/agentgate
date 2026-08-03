import fs from 'node:fs';
import path from 'node:path';
import {
  ClientConfigLocation,
  McpServerConfig,
  ToolSurface,
  discoverConfigFiles,
  fetchToolSurface,
  parseConfigFile,
} from '@agentgate/core';
import pc from 'picocolors';

export interface GatherOptions {
  /** Explicit config file path (skips discovery). */
  config?: string;
  /** Project directory for project-level config discovery. Default: cwd. */
  projectDir?: string;
  /** Restrict to specific server names. */
  server?: string[];
}

function guessFormat(file: string): ClientConfigLocation['format'] {
  if (file.endsWith('.toml')) return 'codex-toml';
  if (path.basename(file) === 'opencode.json') return 'opencode-json';
  return 'mcpServers-json';
}

export function gatherServers(opts: GatherOptions): { servers: McpServerConfig[]; files: string[] } {
  let locations: ClientConfigLocation[];
  if (opts.config) {
    const file = path.resolve(opts.config);
    if (!fs.existsSync(file)) {
      throw new Error(`Config file not found: ${file}`);
    }
    locations = [{ client: 'explicit', path: file, format: guessFormat(file) }];
  } else {
    locations = discoverConfigFiles({ projectDir: opts.projectDir ?? process.cwd() });
  }
  const servers: McpServerConfig[] = [];
  const files: string[] = [];
  for (const location of locations) {
    files.push(location.path);
    try {
      servers.push(...parseConfigFile(location));
    } catch (err) {
      console.error(pc.yellow(`warning: failed to parse ${location.path}: ${err instanceof Error ? err.message : err}`));
    }
  }
  const filter = opts.server;
  const filtered = filter && filter.length > 0 ? servers.filter((s) => filter.includes(s.name)) : servers;
  return { servers: filtered, files };
}

export async function gatherSurfaces(servers: McpServerConfig[], timeoutMs: number): Promise<{ surfaces: Record<string, ToolSurface[]>; errors: { server: string; error: string }[] }> {
  const surfaces: Record<string, ToolSurface[]> = {};
  const errors: { server: string; error: string }[] = [];
  for (const server of servers) {
    if (!server.command) {
      errors.push({ server: server.name, error: 'not a stdio server (remote transports are analyzed statically only)' });
      continue;
    }
    try {
      surfaces[server.name] = await fetchToolSurface(server, { timeoutMs });
    } catch (err) {
      errors.push({ server: server.name, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return { surfaces, errors };
}
