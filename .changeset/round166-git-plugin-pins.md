---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SC-001 also flags OpenCode git-URL plugin specs without a commit pin (`pkg@git+https://…` with no `#<sha>`): they fetch and execute whatever the branch points at on every startup. Commit-pinned git specs stay clean.
