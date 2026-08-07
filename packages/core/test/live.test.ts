import { spawn } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { fetchToolSurface } from '../src/live.js';
import { McpServerConfig } from '../src/types.js';

const FIXTURE = path.resolve(__dirname, 'fixtures', 'tiny-server.mjs');

function server(overrides: Partial<McpServerConfig> = {}): McpServerConfig {
  return {
    name: 'tiny',
    command: process.execPath,
    args: [FIXTURE],
    source: 'test',
    client: 'test',
    ...overrides,
  };
}

describe('fetchToolSurface', () => {
  it('lists tools from a live stdio server', async () => {
    const tools = await fetchToolSurface(server(), { timeoutMs: 30000 });
    expect(tools.map((t) => t.name)).toEqual(['ping']);
    expect(tools[0]!.description).toBe('Reply with pong');
    expect(tools[0]!.inputSchema).toMatchObject({ type: 'object' });
  }, 60000);

  it('rejects servers with neither a stdio command nor a url', async () => {
    await expect(fetchToolSurface(server({ command: undefined }))).rejects.toThrow(/neither a stdio command nor a url/);
  });

  it('times out when the process is not an MCP server', async () => {
    await expect(
      fetchToolSurface(server({ args: ['-e', 'setInterval(() => {}, 1000)'] }), { timeoutMs: 1500 }),
    ).rejects.toThrow(/Timed out/);
  }, 20000);

  it('falls back to SSE for legacy remote servers that reject Streamable HTTP', async () => {
    const fixture = path.resolve(__dirname, 'fixtures', 'toy-sse-server.mjs');
    const child = spawn(process.execPath, [fixture], { stdio: ['ignore', 'pipe', 'ignore'] });
    try {
      const port = await new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('SSE fixture did not start')), 15000);
        child.stdout.on('data', (chunk: Buffer) => {
          const m = /PORT (\d+)/.exec(chunk.toString());
          if (m) {
            clearTimeout(timer);
            resolve(m[1]!);
          }
        });
      });
      const tools = await fetchToolSurface(
        server({ command: undefined, args: undefined, url: `http://127.0.0.1:${port}/mcp` }),
        { timeoutMs: 15000 },
      );
      expect(tools.map((t) => t.name)).toEqual(['echo']);
      expect(tools[0]!.description).toBe('Echo a message');
    } finally {
      child.kill();
    }
  }, 30000);
});
