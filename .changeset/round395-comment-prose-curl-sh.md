---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-RC-001 precision: comment-line curl|sh mentions (`#`, `//`, and block-comment `*` continuations) in non-executable sources now report low with comment wording — a commented line never executes in any file class. Backtick inline-code spans quoting the idiom in Python sources (docstring/RST prose, where backticks are not syntax) also report low. Live command strings, real installer pipelines, and yaml block-scalar commands keep their previous grades.
