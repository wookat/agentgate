---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

Round 378 precision: AG-SK-001 grades poisoning markers used as bare code identifiers (e.g. `self.conversation_history = []` in embedded example code) low, and AG-RC-001 grades curl|sh text inside detection-rule rows (list items carrying a `pattern:`/`re:`/`regex:` field, including their `message:` text) low as defensive rule data.
