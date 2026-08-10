---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-TP-001 grades trojan-grade hidden Unicode characters low when they sit on a comment line whose surrounding prose discusses hidden-unicode attacks (bidi/RLO/homoglyph documentation in security tooling). Comment lines without attack prose, and code lines anywhere in the file, stay high — the scanner now surfaces the first non-defensive hit instead of stopping at the first hit.
