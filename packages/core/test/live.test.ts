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
});
