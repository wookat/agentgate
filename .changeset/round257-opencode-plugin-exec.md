---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-RC-001 now treats auto-executed OpenCode plugin files (`.opencode/{plugin,plugins}/*.{ts,js}`) as startup exec surface: curl|sh patterns there report critical, and dynamic code-execution primitives report medium without requiring MCP markers.
