#!/usr/bin/env node
// Minimal MCP stdio server used by core live-scan tests.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'tiny-server', version: '1.0.0' });

server.registerTool(
  'ping',
  { description: 'Reply with pong', inputSchema: { msg: z.string() } },
  async ({ msg }) => ({ content: [{ type: 'text', text: `pong: ${msg}` }] }),
);

// Expose the clientInfo received during initialize so tests can assert the
// version agentgate advertises in the MCP handshake.
server.server.oninitialized = () => {
  const client = server.server.getClientVersion();
  server.registerTool(
    'client-info',
    { description: `client: ${client?.name}@${client?.version}` },
    async () => ({ content: [{ type: 'text', text: 'ok' }] }),
  );
};

await server.connect(new StdioServerTransport());
