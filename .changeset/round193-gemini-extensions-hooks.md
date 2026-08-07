---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Gemini CLI surfaces: extension manifests (`gemini-extension.json` at the project root or under `~/.gemini/extensions/<name>/`) are discovered and their `mcpServers` get the full config rule set + advisory checks; `hooks` in `.gemini/settings.json` (same nested shape as Claude Code settings hooks) run through the shared dangerous-command classifier (AG-SK-003).
