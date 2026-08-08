---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Cover the Kilo CLI (OpenCode fork) project tree: discover `kilo.json(c)` MCP configs (OpenCode schema, JSONC-tolerant) with AG-SK-002 permission checks and AG-SC-001/002/003 plugin checks; scan `.kilo`/`.kilocode` agent and mode markdown (frontmatter permissions + skill pipeline) and treat `.kilo`/`.kilocode` plugin files as startup-execution surface (AG-RC-001). Also downgrade curl|sh strings listed under deny/block-list keys to low (defensive control, not an execution vector).
