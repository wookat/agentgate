#!/usr/bin/env node
// Minimal MCP Streamable HTTP server that requires `Authorization: Bearer good-token`.
// Used to verify OAuth token pickup during live scans. Prints `PORT <n>` when ready.
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

const transports = new Map();

async function newTransport() {
  const server = new McpServer({ name: 'toy-auth-http-server', version: '1.0.0' });
  server.registerTool(
    'whoami',
    { description: 'Report the caller', inputSchema: { name: z.string() } },
    async ({ name }) => ({ content: [{ type: 'text', text: name }] }),
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
    if (req.headers.authorization !== 'Bearer good-token') {
      res.writeHead(401, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'unauthorized' }));
      return;
    }
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
