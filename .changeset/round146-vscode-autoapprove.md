---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks VS Code workspace settings (`.vscode/settings.json`): `chat.tools.global.autoApprove: true` (or the legacy `chat.tools.autoApprove`) is flagged high — it bypasses every chat tool approval for anyone opening the project. `.vscode` is walked for settings/MCP configs only.
