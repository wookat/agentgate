---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Two false-positive fixes from a flagship-repo sweep: the AG-RC-001 curl|sh pattern no longer spans plain newlines (only backslash continuations), so a pipe in a later unrelated statement is not attributed to an earlier download command; the AG-SK-001 concealment pattern no longer matches "do not tell the user to <verb> ..." phrasing guidance. Real single-line and continuation-line curl|sh launches and genuine concealment instructions still report.
