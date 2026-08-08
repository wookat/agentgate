---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

`agentgate deps` AG-DP-007 precision (wild-corpus sweep): also recognizes extras (`name[extra] @ url`), editable (`-e …#egg=name`), and bare-URL requirement lines (name from `#egg=` or the repo/archive path); commit-addressed forge archives (`…/archive/<40-char-sha>.zip`) are now exempt like SHA-pinned git specs.
