---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Scan goose local memory files (`.goose/memory/*.txt`) for prompt poisoning and hidden Unicode (AG-SK-001) — committed memories become model context for everyone using the goose memory extension in the repo. They are also pinnable via `lock --skills`.
