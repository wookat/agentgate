---
"mcp-agentgate": patch
---

Findings table: messages containing tokens wider than the Message column (source URLs, long package specs) now wrap mid-word instead of being truncated with "…", so the full remote-source URL of e.g. an AG-DP-007 finding stays visible. Ordinary messages keep word-boundary wrapping.
