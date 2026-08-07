---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 checks Cursor project hooks (`.cursor/hooks.json`): hook commands run automatically around agent-loop stages (sessionStart, beforeShellExecution, afterFileEdit, …) — including in Cursor cloud agents — and get the same dangerous-command classification as Claude Code, Kiro, and Amazon Q hooks. Guard scripts and local formatters stay clean.
