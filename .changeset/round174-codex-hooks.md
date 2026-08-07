---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 checks Codex project hook files (`.codex/hooks.json`): command hooks run on lifecycle events (SessionStart, PreToolUse, UserPromptSubmit, …) for anyone who trusts the project's `.codex/` layer, so their commands get the shared dangerous-command classification (remote-script pipes critical, data-exfil/credential reads high). Local policy/lint scripts stay clean.
