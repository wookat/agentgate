---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 also checks Claude Code settings files (`.claude/settings.json`, `.claude/settings.local.json`): dangerous unscoped `permissions.allow` grants (bare `Bash`, unscoped `Write`/`Edit`/`WebFetch`/`WebSearch`) and `permissions.defaultMode: "bypassPermissions"` are flagged.
