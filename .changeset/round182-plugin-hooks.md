---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 now checks Claude Code plugin hooks: `type: "command"` entries in a plugin's `hooks/hooks.json` (or inline in `.claude-plugin/plugin.json`) run automatically on lifecycle events for everyone who installs the plugin, so they get the shared dangerous-command classification (remote-script pipes critical, exfiltration/credential reads high). Install instructions merely printed via `echo '…'` are no longer misclassified as pipelines (precision fix, applies to all hook surfaces).
