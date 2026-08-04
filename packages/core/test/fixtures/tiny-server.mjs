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

await server.connect(new StdioServerTransport());
