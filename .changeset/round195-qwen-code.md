---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Qwen Code support: MCP configs in `~/.qwen/settings.json` and project `.qwen/settings.json` are discovered (full config rule set + advisory checks), and AG-SK-002 checks project settings for `tools.approvalMode: "yolo"`/`"auto-edit"`, unscoped `permissions.allow` grants (`Bash`, `Write`/`Edit`, `WebFetch`), and `trust: true` MCP servers.
