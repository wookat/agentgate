---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks Zed project settings (`.zed/settings.json`): the legacy `agent.always_allow_tool_actions: true` is high, and in `agent.tool_permissions` a global `default: "allow"` is high, per-tool `default: "allow"` is high for `terminal` and medium for file-write/delete/fetch tools. `.zed` is walked for settings only.
