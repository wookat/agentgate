---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks Gemini CLI project settings (`.gemini/settings.json`): bare `run_shell_command` (high), `write_file`/`replace`/`web_fetch`/`google_web_search` (medium) in `tools.allowed`, and `general.defaultApprovalMode: "auto_edit"` (medium).
