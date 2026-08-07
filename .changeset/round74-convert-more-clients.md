---
'mcp-agentgate-config-convert': minor
'mcp-agentgate': minor
---

`config convert` supports three more clients: `kiro` and `roo-code` (standard `mcpServers`) and `zed` (`context_servers` inside `settings.json`, JSONC comments/trailing commas tolerated on parse; output is a standalone `context_servers` document to merge into your settings).
