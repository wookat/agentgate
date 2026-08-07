---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Project-level discovery now finds MCP servers bundled by Claude Code plugins: an `.mcp.json` next to a `.claude-plugin/plugin.json` (including nested plugin roots in marketplace repos) starts automatically for everyone who enables the plugin, so its servers get the full config-level rule set and advisory checks like any other discovered config.
