---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

AG-SK-002 no longer flags `allowed-tools` frontmatter in Roo Code / Kilo Code command files (`.roo/commands`, `.kilo/commands`) — both hosts ignore that field (verified in upstream source), so a pasted grant is inert and was a false positive.
