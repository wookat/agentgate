---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-RC-001 grades curl|sh text warnings low when the match sits in the value of an example-marked key (`bad_example:` payloads, `"examples": [...]` arrays) in non-executable files, with example-specific wording; live pipelines in executable files are unaffected.
