import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport, StreamableHTTPError } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { McpServerConfig, ToolSurface } from './types.js';

export interface LiveScanOptions {
  /** Milliseconds before giving up on the server. Default 15000. */
  timeoutMs?: number;
  /**
   * OAuth provider supplying cached tokens for remote servers. Only consulted
   * when the server config has no static `headers`. Must never start an
   * interactive flow — a 401 with an unusable/expired token surfaces as an
   * auth error.
   */
  authProvider?: OAuthClientProvider;
}

/**
 * Connect to an MCP server (stdio, or remote via Streamable HTTP with SSE
 * fallback), list its tools, and disconnect.
 */
export async function fetchToolSurface(server: McpServerConfig, opts: LiveScanOptions = {}): Promise<ToolSurface[]> {
  const timeoutMs = opts.timeoutMs ?? 15000;
  if (!server.command && !server.url) {
    throw new Error(`Server "${server.name}" has neither a stdio command nor a url`);
  }
  if (server.command) {
    const transport = new StdioClientTransport({
      command: server.command,
      args: server.args ?? [],
      env: { ...(process.env as Record<string, string>), ...(server.env ?? {}) },
      stderr: 'ignore',
    });
    return listAllTools(server, transport, timeoutMs);
  }
  // remote: Streamable HTTP first (current spec), SSE transport as fallback (legacy servers)
  const headers = server.headers ?? {};
  // Static headers take precedence; cached OAuth tokens are only used when none are configured.
  const authProvider = Object.keys(headers).length === 0 ? opts.authProvider : undefined;
  try {
    return await listAllTools(server, new StreamableHTTPClientTransport(new URL(server.url!), { requestInit: { headers }, authProvider }), timeoutMs);
  } catch (httpErr) {
    if (isAuthError(httpErr)) throw authHint(server, httpErr, authProvider !== undefined);
    try {
      return await listAllTools(server, new SSEClientTransport(new URL(server.url!), { requestInit: { headers }, authProvider }), timeoutMs);
    } catch {
      throw httpErr instanceof Error ? httpErr : new Error(String(httpErr));
    }
  }
}

function isAuthError(err: unknown): err is Error {
  if (err instanceof StreamableHTTPError && (err.code === 401 || err.code === 403)) return true;
  if (!(err instanceof Error)) return false;
  // The SDK transport surfaces a rejected/expired token either as an
  // UnauthorizedError or by demanding a new interactive authorization.
  return err.name === 'UnauthorizedError' || /authorizationCode is required/.test(err.message);
}

function authHint(server: McpServerConfig, err: Error, usedOAuthTokens: boolean): Error {
  const configured = Object.keys(server.headers ?? {});
  const detail = configured.length > 0
    ? `the configured header(s) (${configured.join(', ')}) were rejected — check the token value and scope`
    : usedOAuthTokens
      ? `the cached OAuth tokens were rejected — run \`agentgate auth login ${server.name}\` to log in again`
      : `no credentials are configured — run \`agentgate auth login ${server.name}\` for OAuth servers, or add a token under "headers" in the server config (e.g. "headers": { "Authorization": "Bearer …" })`;
  return new Error(`${err.message.trim()} — ${detail}.`);
}

async function listAllTools(server: McpServerConfig, transport: Transport, timeoutMs: number): Promise<ToolSurface[]> {
  const client = new Client({ name: 'agentgate', version: '0.1.0' });
  try {
    await withTimeout(client.connect(transport, { timeout: timeoutMs }), timeoutMs, `connecting to "${server.name}"`);
    const tools: ToolSurface[] = [];
    let cursor: string | undefined;
    do {
      const page = await withTimeout(client.listTools({ cursor }, { timeout: timeoutMs }), timeoutMs, `listing tools of "${server.name}"`);
      for (const tool of page.tools) {
        tools.push({ name: tool.name, description: tool.description ?? '', inputSchema: tool.inputSchema ?? {} });
      }
      cursor = page.nextCursor;
    } while (cursor);
    return tools;
  } finally {
    await client.close().catch(() => {});
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms while ${what}`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}
