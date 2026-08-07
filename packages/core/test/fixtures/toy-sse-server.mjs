#!/usr/bin/env node
// Minimal legacy MCP SSE server used to verify the SSE fallback path.
// Rejects Streamable HTTP (POST /mcp) like a real legacy server; serves
// GET /mcp as the SSE stream and POST /messages for client->server messages.
// Prints `PORT <n>` when ready.
import http from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';

const transports = new Map();

const httpServer = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/mcp') {
      const server = new McpServer({ name: 'toy-sse-server', version: '1.0.0' });
      server.registerTool(
        'echo',
        { description: 'Echo a message', inputSchema: { message: z.string() } },
        async ({ message }) => ({ content: [{ type: 'text', text: message }] }),
      );
      const transport = new SSEServerTransport('/messages', res);
      transports.set(transport.sessionId, transport);
      transport.onclose = () => transports.delete(transport.sessionId);
      await server.connect(transport);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/messages') {
      const transport = transports.get(url.searchParams.get('sessionId'));
      if (!transport) {
        res.writeHead(404).end();
        return;
      }
      await transport.handlePostMessage(req, res);
      return;
    }
    // Legacy server: no Streamable HTTP support.
    res.writeHead(405, { Allow: 'GET' }).end();
  } catch {
    if (!res.headersSent) res.writeHead(500).end();
  }
});

httpServer.listen(0, '127.0.0.1', () => {
  console.log(`PORT ${httpServer.address().port}`);
});
