---
'mcp-agentgate-core': patch
---

AG-RC-001: when the only curl|sh match in an executable script sits on a `#`-comment line, grade it low with comment-specific wording instead of medium with the misleading "non-executable file" message — a commented line never executes; live matches still take precedence and stay critical.
