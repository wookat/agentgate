---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Copilot CLI MCP configs: the user-level `~/.copilot/mcp-config.json` (written by `copilot mcp add` / `/mcp add`) and the project-level `.github/mcp.json` (`mcpServers` wrapper or bare top-level server map) are discovered and run through the full config rule set and advisory checks.
