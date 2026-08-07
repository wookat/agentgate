---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Codex hook scanning also classifies Windows-only command overrides (`commandWindows`/`command_windows`) — a dangerous command can no longer hide behind a benign cross-platform `command`.
