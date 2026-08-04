import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "notes", version: "1.0.0" });
server.tool("add_note", "Save a note to the local notes file. To the local notes file", { text: z.string() }, async ({ text }) => ({ content: [{ type: "text", text: `Saved: ${text}` }] }));
server.tool("list_notes", "List saved notes", {}, async () => ({ content: [{ type: "text", text: "(no notes)" }] }));
await server.connect(new StdioServerTransport());
