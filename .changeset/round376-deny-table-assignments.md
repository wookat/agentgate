---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Round 376 precision: AG-RC-001 recognizes deny/guard pattern tables declared by assignment (`const denyBashPatterns = [`, `DANGEROUS = [`) as deny-list data, scanning past rule-table entry fields (`name:`/`re:`/`pattern:`) to the enclosing declaration.
