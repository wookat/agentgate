---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

AG-SS-001 skips metadata-endpoint mentions on comment-only lines when choosing the reported occurrence: severity is decided by the first non-comment mention (a live fetch below a doc comment still reports high), and files where every mention is a comment report low with comment wording.
