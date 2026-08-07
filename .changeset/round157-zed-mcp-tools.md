---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 flags Zed `tool_permissions` MCP tool keys (`mcp:<server>:<tool>`) defaulted to `"allow"` as medium when the tool name looks destructive (exec/sql/write/delete/deploy, …). Read-only-named MCP allows stay clean — rug-pull risk is covered by the tool-surface lockfile.
