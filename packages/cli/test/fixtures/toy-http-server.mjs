#!/usr/bin/env node
// Minimal MCP Streamable HTTP server used by CLI end-to-end tests.
// One transport per session (standard SDK pattern); prints `PORT <n>` when ready.
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

const transports = new Map();

async function newTransport() {
  const server = new McpServer({ name: 'toy-http-server', version: '1.0.0' });
  server.registerTool(
    'add',
    { description: 'Add two numbers', inputSchema: { a: z.number(), b: z.number() } },
    async ({ a, b }) => ({ content: [{ type: 'text', text: String(a + b) }] }),
  );
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (id) => transports.set(id, transport),
  });
  transport.onclose = () => {
    if (transport.sessionId) transports.delete(transport.sessionId);
  };
  await server.connect(transport);
  return transport;
}

const httpServer = http.createServer(async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'];
    const transport = (sessionId && transports.get(sessionId)) || (await newTransport());
    await transport.handleRequest(req, res);
  } catch {
    if (!res.headersSent) res.writeHead(500).end();
  }
});

httpServer.listen(0, '127.0.0.1', () => {
  console.log(`PORT ${httpServer.address().port}`);
});
