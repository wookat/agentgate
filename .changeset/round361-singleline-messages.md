---
'mcp-agentgate-core': patch
---

Finding messages stay single-line: matched-content excerpts embedded in AG-RC-001 dynamic-exec and AG-SK-001 prompt-injection messages now collapse internal newlines/whitespace runs to single spaces, so multi-line regex matches (e.g. `child_process` … `exec(` spanning lines) no longer break findings-table rows, GitHub annotations, or SARIF message text.
