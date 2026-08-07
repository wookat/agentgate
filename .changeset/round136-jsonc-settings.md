---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SK-002 parses Claude Code settings files tolerantly (JSONC comments and trailing commas), matching what Claude Code itself accepts — real-world settings with trailing commas are no longer silently skipped.
