import fs from 'node:fs';
import path from 'node:path';
import {
  ClientConfigLocation,
  McpServerConfig,
  ToolSurface,
  discoverConfigFiles,
  fetchToolSurface,
  parseConfigFile,
} from 'mcp-agentgate-core';
import pc from 'picocolors';
import { debugLog } from './debug.js';

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
    debugLog(`parsing ${location.client} config: ${location.path} (${location.format})`);
    try {
      servers.push(...parseConfigFile(location));
    } catch (err) {
      const message = `failed to parse ${location.path}: ${err instanceof Error ? err.message : err}`;
      if (location.client === 'explicit') {
        throw new Error(message, { cause: err });
      }
      console.error(pc.yellow(`warning: ${message}`));
    }
  }
  const filter = opts.server;
  const filtered = filter && filter.length > 0 ? servers.filter((s) => filter.includes(s.name)) : servers;
  return { servers: filtered, files };
}

/** How many servers to connect to at once during live gathering. */
const GATHER_CONCURRENCY = 4;

export async function gatherSurfaces(servers: McpServerConfig[], timeoutMs: number): Promise<{ surfaces: Record<string, ToolSurface[]>; errors: { server: string; error: string }[] }> {
  const results: ({ server: string; tools: ToolSurface[] } | { server: string; error: string })[] = new Array(servers.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < servers.length) {
      const index = next++;
      const server = servers[index]!;
      if (!server.command && !server.url) {
        results[index] = { server: server.name, error: 'has neither a stdio command nor a url' };
        continue;
      }
      try {
        debugLog(`connecting to "${server.name}" (${server.command ?? server.url}) with timeout ${timeoutMs}ms`);
        const tools = await fetchToolSurface(server, { timeoutMs });
        debugLog(`"${server.name}" exposed ${tools.length} tool(s)`);
        results[index] = { server: server.name, tools };
      } catch (err) {
        results[index] = { server: server.name, error: err instanceof Error ? err.message : String(err) };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(GATHER_CONCURRENCY, servers.length) }, worker));

  const surfaces: Record<string, ToolSurface[]> = {};
  const errors: { server: string; error: string }[] = [];
  for (const result of results) {
    if ('tools' in result) surfaces[result.server] = result.tools;
    else errors.push(result);
  }
  return { surfaces, errors };
}
