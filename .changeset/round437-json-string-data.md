---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-TP-001 grades bidi/hidden-unicode characters low when they sit entirely inside string tokens of valid plain-data JSON (locale catalogs, language corpora). Agent-facing config JSON (mcp/settings/plugin/marketplace/hooks/agents/config), invalid JSON, and hidden characters outside string tokens keep reporting high.
