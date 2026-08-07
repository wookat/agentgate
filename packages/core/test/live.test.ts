import { spawn } from 'node:child_process';
import http from 'node:http';
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

  describe('remote auth errors', () => {
    async function with401Server(fn: (url: string) => Promise<void>): Promise<void> {
      const srv = http.createServer((_req, res) => {
        res.writeHead(401, { 'Content-Type': 'text/plain' }).end('Unauthorized');
      });
      await new Promise<void>((resolve) => srv.listen(0, '127.0.0.1', resolve));
      const { port } = srv.address() as { port: number };
      try {
        await fn(`http://127.0.0.1:${port}/mcp`);
      } finally {
        srv.close();
      }
    }

    it('suggests auth login or headers when a remote server returns 401 and no credentials are set', async () => {
      await with401Server(async (url) => {
        await expect(
          fetchToolSurface(server({ command: undefined, args: undefined, url }), { timeoutMs: 5000 }),
        ).rejects.toThrow(/no credentials are configured.*agentgate auth login.*"headers"/s);
      });
    }, 20000);

    it('points at the rejected headers when a remote server returns 401 despite configured headers', async () => {
      await with401Server(async (url) => {
        await expect(
          fetchToolSurface(
            server({ command: undefined, args: undefined, url, headers: { Authorization: 'Bearer bad' } }),
            { timeoutMs: 5000 },
          ),
        ).rejects.toThrow(/header\(s\) \(Authorization\) were rejected/);
      });
    }, 20000);
  });

  describe('OAuth token pickup', () => {
    function stubProvider(accessToken: string) {
      return {
        redirectUrl: undefined,
        clientMetadata: { redirect_uris: [] },
        clientInformation: () => ({ client_id: 'stub' }),
        tokens: () => ({ access_token: accessToken, token_type: 'Bearer' }),
        saveTokens: () => {},
        redirectToAuthorization: () => {},
        saveCodeVerifier: () => {},
        codeVerifier: () => 'stub-verifier',
      };
    }

    async function withAuthServer(fn: (url: string) => Promise<void>): Promise<void> {
      const fixture = path.resolve(__dirname, 'fixtures', 'toy-auth-http-server.mjs');
      const child = spawn(process.execPath, [fixture], { stdio: ['ignore', 'pipe', 'ignore'] });
      try {
        const port = await new Promise<string>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('auth fixture did not start')), 15000);
          child.stdout.on('data', (chunk: Buffer) => {
            const m = /PORT (\d+)/.exec(chunk.toString());
            if (m) {
              clearTimeout(timer);
              resolve(m[1]!);
            }
          });
        });
        await fn(`http://127.0.0.1:${port}/mcp`);
      } finally {
        child.kill();
      }
    }

    it('authenticates with cached OAuth tokens when no headers are configured', async () => {
      await withAuthServer(async (url) => {
        const tools = await fetchToolSurface(
          server({ command: undefined, args: undefined, url }),
          { timeoutMs: 15000, authProvider: stubProvider('good-token') },
        );
        expect(tools.map((t) => t.name)).toEqual(['whoami']);
      });
    }, 30000);

    it('suggests logging in again when cached OAuth tokens are rejected', async () => {
      await withAuthServer(async (url) => {
        await expect(
          fetchToolSurface(
            server({ command: undefined, args: undefined, url }),
            { timeoutMs: 15000, authProvider: stubProvider('expired-token') },
          ),
        ).rejects.toThrow(/cached OAuth tokens were rejected.*agentgate auth login/s);
      });
    }, 30000);

    it('prefers configured headers over the OAuth provider', async () => {
      await withAuthServer(async (url) => {
        const tools = await fetchToolSurface(
          server({
            command: undefined,
            args: undefined,
            url,
            headers: { Authorization: 'Bearer good-token' },
          }),
          { timeoutMs: 15000, authProvider: stubProvider('expired-token') },
        );
        expect(tools.map((t) => t.name)).toEqual(['whoami']);
      });
    }, 30000);
  });
});
