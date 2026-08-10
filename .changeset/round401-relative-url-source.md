---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SC-001 no longer flags marketplace plugin url-form sources with schemeless relative urls (`{"source": "url", "url": "./"}`) as mutable — repo-local content shipped with the catalog is the same trust boundary as a local path source. Remote-scheme url sources stay flagged.
