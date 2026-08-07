---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 now classifies Claude Code plugin LSP server commands: `.lsp.json` (or inline `lspServers` in `.claude-plugin/plugin.json`) declares commands that run automatically after workspace trust whenever matching files are edited. Command + args go through the shared dangerous-command classification; real language servers stay clean.
