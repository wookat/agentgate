---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks Roo Code project MCP configs (`.roo/mcp.json`): a wildcard `"*"` in a server's `alwaysAllow`/`autoApprove` list (high) and auto-approved destructive-looking tools such as `execute_sql`/`apply_migration` (medium) are flagged.
