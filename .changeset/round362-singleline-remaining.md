---
'mcp-agentgate-core': patch
---

Extend single-line message normalization to the remaining excerpt-embedding message sites: AG-TP-001 tool-description injection matches, all AG-SK-003 hook/monitor/LSP command excerpts, and AG-SC-001 remote instruction/plugin specifiers now collapse embedded newlines to spaces, matching the round-361 fix for AG-RC-001/AG-SK-001.
