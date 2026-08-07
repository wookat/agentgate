---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Copilot CLI hooks: repo-level `.github/hooks/*.json` and user-level `.copilot/hooks/*.json` command hooks (both `bash` and `powershell` keys) run through the shared dangerous-command classification (AG-SK-003) — they execute automatically on lifecycle events for anyone who opens the repository in Copilot CLI.
