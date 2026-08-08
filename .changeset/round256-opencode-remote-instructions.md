---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SC-001 now flags remote http(s) URLs in the OpenCode `instructions` array — the content is fetched and injected into the system prompt on every session, so the host can change it at any time (remote prompt injection / rug-pull).
