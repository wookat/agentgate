import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runAuthLogin, runAuthLogout, runAuthStatus } from '../src/commands/auth.js';
import { readStore, storePath } from '../src/oauth/store.js';

/**
 * Minimal OAuth 2.1 authorization server (metadata discovery + dynamic client
 * registration + PKCE authorization-code flow) so the whole `auth login`
 * round trip runs against a real HTTP loopback, no browser: the test plays
 * the user agent by fetching the authorization URL and following the
 * redirect to the CLI's callback listener.
 */
function startAuthServer(): Promise<{ url: string; close: () => void; issued: string[] }> {
  const codes = new Map<string, string>(); // code -> code_challenge
  const issued: string[] = [];
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    if (url.pathname === '/.well-known/oauth-authorization-server') {
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(
        JSON.stringify({
          issuer: origin,
          authorization_endpoint: `${origin}/authorize`,
          token_endpoint: `${origin}/token`,
          registration_endpoint: `${origin}/register`,
          response_types_supported: ['code'],
          grant_types_supported: ['authorization_code', 'refresh_token'],
          code_challenge_methods_supported: ['S256'],
          token_endpoint_auth_methods_supported: ['none'],
        }),
      );
      return;
    }
    if (url.pathname === '/register' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        const meta = JSON.parse(body) as Record<string, unknown>;
        res.writeHead(201, { 'Content-Type': 'application/json' }).end(
          JSON.stringify({ ...meta, client_id: 'test-client-id' }),
        );
      });
      return;
    }
    if (url.pathname === '/authorize') {
      const code = crypto.randomBytes(8).toString('hex');
      codes.set(code, url.searchParams.get('code_challenge') ?? '');
      const redirect = new URL(url.searchParams.get('redirect_uri')!);
      redirect.searchParams.set('code', code);
      const state = url.searchParams.get('state');
      if (state) redirect.searchParams.set('state', state);
      res.writeHead(302, { Location: redirect.href }).end();
      return;
    }
    if (url.pathname === '/token' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        const params = new URLSearchParams(body);
        const challenge = codes.get(params.get('code') ?? '');
        const expected = crypto
          .createHash('sha256')
          .update(params.get('code_verifier') ?? '')
          .digest('base64url');
        if (challenge === undefined || challenge !== expected) {
          res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'invalid_grant' }));
          return;
        }
        const token = `token-${crypto.randomBytes(4).toString('hex')}`;
        issued.push(token);
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(
          JSON.stringify({ access_token: token, token_type: 'Bearer', expires_in: 3600, refresh_token: 'refresh-1' }),
        );
      });
      return;
    }
    // MCP endpoint and anything else: not needed for the login flow.
    res.writeHead(404).end();
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };
      resolve({ url: `http://127.0.0.1:${port}/mcp`, close: () => server.close(), issued });
    });
  });
}

/** Plays the user agent: fetches the printed authorization URL and follows the 302 to the CLI callback. */
function autoApprove(logs: string[]): NodeJS.Timeout {
  return setInterval(() => {
    // eslint-disable-next-line no-control-regex
    const line = logs.map((l) => l.replace(/\x1b\[[0-9;]*m/g, '')).find((l) => l.includes('/authorize?'));
    if (!line) return;
    const authUrl = /https?:\/\/\S+/.exec(line)?.[0];
    if (!authUrl) return;
    logs.length = 0;
    void fetch(authUrl, { redirect: 'follow' });
  }, 50);
}

describe('agentgate auth', () => {
  let dir: string;
  let logs: string[];
  const origLog = console.log;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-auth-'));
    process.env.AGENTGATE_CONFIG_DIR = dir;
    process.env.AGENTGATE_NO_BROWSER = '1';
    logs = [];
    console.log = (...args: unknown[]) => {
      logs.push(args.join(' '));
    };
  });

  afterEach(() => {
    console.log = origLog;
    delete process.env.AGENTGATE_CONFIG_DIR;
    delete process.env.AGENTGATE_NO_BROWSER;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('completes a full PKCE login against a local authorization server and persists tokens', async () => {
    const as = await startAuthServer();
    const approver = autoApprove(logs);
    try {
      const exit = await runAuthLogin(as.url, { timeout: '15000' });
      expect(exit).toBe(0);
      expect(as.issued).toHaveLength(1);
      const store = readStore();
      const entry = store[new URL(as.url).origin]!;
      expect(entry.tokens?.access_token).toBe(as.issued[0]);
      expect(entry.tokens?.refresh_token).toBe('refresh-1');
      expect(entry.clientInformation?.client_id).toBe('test-client-id');
      // Token file must not be world-readable.
      const mode = fs.statSync(storePath()).mode & 0o777;
      if (process.platform !== 'win32') expect(mode).toBe(0o600);
    } finally {
      clearInterval(approver);
      as.close();
    }
  }, 20000);

  it('reports the login in auth status and removes it on logout', async () => {
    const as = await startAuthServer();
    const approver = autoApprove(logs);
    try {
      expect(await runAuthLogin(as.url, { timeout: '15000' })).toBe(0);
      logs.length = 0;
      expect(runAuthStatus()).toBe(0);
      expect(logs.join('\n')).toContain(new URL(as.url).origin);
      expect(logs.join('\n')).toContain('logged in');

      expect(runAuthLogout(as.url, {})).toBe(0);
      expect(readStore()).toEqual({});
      logs.length = 0;
      expect(runAuthStatus()).toBe(0);
      expect(logs.join('\n')).toContain('No OAuth logins saved');
    } finally {
      clearInterval(approver);
      as.close();
    }
  }, 20000);

  it('treats a corrupted or non-object token store as empty', async () => {
    const { writeStore } = await import('../src/oauth/store.js');
    fs.mkdirSync(path.dirname(storePath()), { recursive: true });
    fs.writeFileSync(storePath(), 'not json');
    expect(readStore()).toEqual({});
    fs.writeFileSync(storePath(), '[1,2]');
    expect(readStore()).toEqual({});
    // Writing over a loosened existing file re-tightens permissions.
    fs.chmodSync(storePath(), 0o644);
    writeStore({});
    const mode = fs.statSync(storePath()).mode & 0o777;
    if (process.platform !== 'win32') expect(mode).toBe(0o600);
  });

  it('fails fast with a helpful error for stdio-only server names', async () => {
    const cfg = path.join(dir, 'mcp.json');
    fs.writeFileSync(cfg, JSON.stringify({ mcpServers: { local: { command: 'node' } } }));
    await expect(runAuthLogin('local', { timeout: '1000', config: cfg })).rejects.toThrow(/stdio server/);
  });
});

describe('live scans pick up stored OAuth tokens', () => {
  const CLI = path.resolve(__dirname, '..', 'dist', 'index.js');
  const AUTH_FIXTURE = path.resolve(__dirname, '..', '..', 'core', 'test', 'fixtures', 'toy-auth-http-server.mjs');
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-auth-live-'));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  async function withAuthServer(fn: (url: string) => Promise<void>): Promise<void> {
    const { spawn } = await import('node:child_process');
    const child = spawn(process.execPath, [AUTH_FIXTURE], { stdio: ['ignore', 'pipe', 'ignore'] });
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

  async function runCli(args: string[], cwd: string): Promise<{ code: number; out: string }> {
    const { execFile } = await import('node:child_process');
    return new Promise((resolve) => {
      execFile(
        process.execPath,
        [CLI, ...args],
        { cwd, env: { ...process.env, AGENTGATE_CONFIG_DIR: dir, GITHUB_ACTIONS: 'false' } },
        (err, stdout, stderr) => {
          resolve({ code: (err as { code?: number } | null)?.code ?? 0, out: `${stdout}\n${stderr}` });
        },
      );
    });
  }

  it('scan --live authenticates with the saved token and reports the rejected-token hint otherwise', async () => {
    await withAuthServer(async (url) => {
      const cfg = path.join(dir, 'mcp.json');
      fs.writeFileSync(cfg, JSON.stringify({ mcpServers: { hosted: { url } } }));

      // No stored tokens: actionable hint pointing at auth login.
      const before = await runCli(['scan', '--live', '--config', cfg, '--fail-on', 'never'], dir);
      expect(before.out).toContain('agentgate auth login');

      // Store the token the fixture accepts, as `auth login` would.
      const { updateServerAuth } = await import('../src/oauth/store.js');
      process.env.AGENTGATE_CONFIG_DIR = dir;
      try {
        updateServerAuth(url, { tokens: { access_token: 'good-token', token_type: 'Bearer' } });
      } finally {
        delete process.env.AGENTGATE_CONFIG_DIR;
      }

      const after = await runCli(['lock', '--config', cfg], dir);
      expect(after.out).not.toContain('agentgate auth login');
      expect(after.code).toBe(0);
      const lockfile = fs.readFileSync(path.join(dir, 'agentgate.lock'), 'utf8');
      expect(lockfile).toContain('whoami');
    });
  }, 60000);
});
