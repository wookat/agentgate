---
"mcp-agentgate-core": minor
"mcp-agentgate": minor
---

AG-SK-002 Crush allowed_tools classification covers scoped `tool:action` keys (e.g. `bash:execute` now reports as bash) and `mcp_<server>_<tool>` MCP tool names whose tool part suggests shell execution, data mutation, or exfiltration (medium) — both in `crush.json` `permissions.allowed_tools` and crushrc `permissions allow` lines.
