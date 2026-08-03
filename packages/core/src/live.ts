import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { McpServerConfig, ToolSurface } from './types.js';

export interface LiveScanOptions {
  /** Milliseconds before giving up on the server. Default 15000. */
  timeoutMs?: number;
}

/**
 * Connect to a stdio MCP server, list its tools, and disconnect.
 * Only stdio transports are supported for live scanning; remote servers are analyzed statically.
 */
export async function fetchToolSurface(server: McpServerConfig, opts: LiveScanOptions = {}): Promise<ToolSurface[]> {
  if (!server.command) {
    throw new Error(`Server "${server.name}" has no stdio command; live scan supports stdio servers only`);
  }
  const transport = new StdioClientTransport({
    command: server.command,
    args: server.args ?? [],
    env: { ...(process.env as Record<string, string>), ...(server.env ?? {}) },
    stderr: 'ignore',
  });
  const client = new Client({ name: 'agentgate', version: '0.1.0' });
  const timeoutMs = opts.timeoutMs ?? 15000;
  try {
    await withTimeout(client.connect(transport), timeoutMs, `connecting to "${server.name}"`);
    const tools: ToolSurface[] = [];
    let cursor: string | undefined;
    do {
      const page = await withTimeout(client.listTools({ cursor }), timeoutMs, `listing tools of "${server.name}"`);
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
