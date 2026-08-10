---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SK-001 fence tracking follows CommonMark closing-fence rules: a closing fence must use the same character, be at least the opener's length, and carry no info string. Shorter inner runs (or ones carrying a language tag) inside a longer fence no longer end the block, so quoted injection examples nested in `~~~~`-fenced untrusted-text blocks stay graded low instead of escalating to critical.
