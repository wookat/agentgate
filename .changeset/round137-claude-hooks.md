---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 also checks Claude Code hooks in `.claude/settings.json` / `.claude/settings.local.json`: `type: "command"` hooks that pipe remote downloads into a shell (critical), exfiltrate data, or read credential material (high) are flagged — they run automatically on session events for everyone opening the project.
