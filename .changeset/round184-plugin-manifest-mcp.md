---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Plugin manifest `mcpServers` fields are now resolved during discovery: inline server config in `.claude-plugin/plugin.json` and config paths relative to the plugin root (string or array, `${CLAUDE_PLUGIN_ROOT}` prefix supported) both surface their servers for the full config-level rule set and advisory checks. References escaping the plugin root are ignored.
