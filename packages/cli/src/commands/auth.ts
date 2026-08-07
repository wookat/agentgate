import { spawn } from 'node:child_process';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { auth } from '@modelcontextprotocol/sdk/client/auth.js';
import pc from 'picocolors';
import { debugLog } from '../debug.js';
import { gatherServers } from '../context.js';
import { FileOAuthProvider } from '../oauth/provider.js';
import { originKey, readStore, removeServerAuth, storePath } from '../oauth/store.js';

export interface AuthLoginOptions {
  config?: string;
  timeout: string;
  clientId?: string;
}

/** Resolve a CLI argument to a remote server URL: a literal URL, or a configured server name. */
function resolveServerUrl(target: string, opts: { config?: string }): string {
  if (/^https?:\/\//.test(target)) return target;
  const { servers } = gatherServers({ config: opts.config });
  const match = servers.find((s) => s.name === target);
  if (!match) {
    const remote = servers.filter((s) => s.url).map((s) => s.name);
    throw new Error(
      `No configured server named "${target}".${remote.length > 0 ? ` Remote servers found: ${remote.join(', ')}` : ' No remote (url) servers found.'}`,
    );
  }
  if (!match.url) throw new Error(`Server "${target}" is a stdio server — OAuth login only applies to remote (url) servers`);
  return match.url;
}

function openBrowser(url: string): void {
  if (process.env.AGENTGATE_NO_BROWSER) return;
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  try {
    // The URL is printed either way; opening the browser is best-effort.
    spawn(cmd, args, { stdio: 'ignore', detached: true })
      .on('error', () => {})
      .unref();
  } catch {
    /* ignore */
  }
}

/** One-shot loopback listener that captures the OAuth authorization code. */
async function waitForCallback(server: http.Server, timeoutMs: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms waiting for the browser callback`)), timeoutMs);
    server.on('request', (req, res) => {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
      }
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      res.writeHead(200, { 'Content-Type': 'text/html' }).end(
        '<html><body style="font-family:system-ui"><h2>agentgate</h2><p>' +
          (code ? 'Login complete — you can close this tab and return to the terminal.' : `Login failed: ${error ?? 'no code returned'}`) +
          '</p></body></html>',
      );
      clearTimeout(timer);
      if (code) resolve(code);
      else reject(new Error(`Authorization failed: ${error ?? 'no code returned by the authorization server'}`));
    });
  });
}

export async function runAuthLogin(target: string, opts: AuthLoginOptions): Promise<number> {
  const serverUrl = resolveServerUrl(target, opts);
  const timeoutMs = Number(opts.timeout);

  const callbackServer = http.createServer();
  await new Promise<void>((resolve) => callbackServer.listen(0, '127.0.0.1', resolve));
  const { port } = callbackServer.address() as AddressInfo;
  const provider = new FileOAuthProvider(serverUrl, `http://127.0.0.1:${port}/callback`, opts.clientId);
  // Register the callback listener before the flow starts so a fast redirect
  // can never race it.
  const callback = waitForCallback(callbackServer, timeoutMs);
  callback.catch(() => {});

  try {
    debugLog(`starting OAuth flow for ${serverUrl} (callback port ${port})`);
    const first = await auth(provider, { serverUrl });
    if (first === 'AUTHORIZED') {
      console.log(pc.green(`✔ Already authorized for ${originKey(serverUrl)} (cached tokens are valid)`));
      return 0;
    }

    const authorizationUrl = provider.pendingAuthorizationUrl();
    if (!authorizationUrl) throw new Error('Authorization server did not produce an authorization URL');
    console.log(`Opening your browser to authorize ${pc.bold(originKey(serverUrl))} …`);
    console.log(pc.dim(`If it does not open, visit:\n  ${authorizationUrl.href}`));
    openBrowser(authorizationUrl.href);

    const code = await callback;
    const second = await auth(provider, { serverUrl, authorizationCode: code });
    if (second !== 'AUTHORIZED') throw new Error(`Token exchange did not complete (state: ${second})`);
    console.log(pc.green(`✔ Logged in to ${originKey(serverUrl)} — tokens saved to ${storePath()}`));
    console.log(pc.dim('Live scans of this server will use these tokens automatically.'));
    return 0;
  } catch (err) {
    let message = err instanceof Error ? err.message : String(err);
    if (/dynamic client registration/i.test(message)) {
      message += ' — pre-register an OAuth app with the provider and pass its ID via --client-id';
    }
    console.error(pc.red(`Login failed: ${message}`));
    return 1;
  } finally {
    callbackServer.close();
  }
}

export function runAuthStatus(): number {
  const store = readStore();
  const origins = Object.keys(store).sort();
  if (origins.length === 0) {
    console.log(`No OAuth logins saved (${storePath()}).`);
    return 0;
  }
  for (const origin of origins) {
    const entry = store[origin]!;
    const hasTokens = Boolean(entry.tokens?.access_token);
    const refresh = entry.tokens?.refresh_token ? 'refresh token available' : 'no refresh token';
    const expiry = entry.tokensExpireAt
      ? entry.tokensExpireAt > Date.now()
        ? `expires ${new Date(entry.tokensExpireAt).toISOString()}`
        : 'access token expired'
      : 'no recorded expiry';
    console.log(`${pc.bold(origin)}  ${hasTokens ? pc.green('logged in') : pc.yellow('registered, no tokens')}  (${expiry}; ${refresh})`);
  }
  return 0;
}

export function runAuthLogout(target: string, opts: { config?: string }): number {
  const serverUrl = resolveServerUrl(target, opts);
  if (removeServerAuth(serverUrl)) {
    console.log(pc.green(`✔ Removed saved OAuth state for ${originKey(serverUrl)}`));
    return 0;
  }
  console.log(`No saved OAuth state for ${originKey(serverUrl)}.`);
  return 0;
}
