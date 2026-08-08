---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Scan the Cline `.cline/` project tree: `.cline/skills/**/SKILL.md` project skills are skill-scanned (AG-SK-001), and `.cline/plugins/` project plugin files (auto-loaded and executed by Cline at startup) are treated as startup exec surface by AG-RC-001 — curl|sh reports critical and dynamic code-execution primitives report medium without needing MCP markers. Previously the `.cline/` directory was not walked at all.
