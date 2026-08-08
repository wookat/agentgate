---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Factory Droid client coverage: discover user-level `~/.factory/mcp.json` and project-level `.factory/mcp.json` (standard `mcpServers`, stdio/http/sse) through the full config rule set and advisory cross-check; classify hook commands in `.factory/hooks.json` (legacy `.factory/hooks/hooks.json`, or a `hooks` key in `.factory/settings.json`) with AG-SK-003; and scan `.factory/skills/**.md`, `.factory/commands/**.md`, and `.factory/droids/*.md` instruction files with AG-SK-001.
