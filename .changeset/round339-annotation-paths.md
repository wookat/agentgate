---
'mcp-agentgate': patch
---

GitHub Actions annotations relativize absolute `file=` paths under the
working directory so findings and drift entries map onto the PR diff when a
target was scanned by absolute path; paths outside the workspace are left
unchanged.
