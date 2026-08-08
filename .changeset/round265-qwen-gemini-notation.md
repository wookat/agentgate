---
'mcp-agentgate-config-convert': patch
'mcp-agentgate': patch
---

`config convert`: `qwen-code` now uses Gemini CLI notation (Qwen Code is a Gemini CLI fork) — `httpUrl` parses as streamable HTTP and `url` as SSE, and remote servers render with the same fields; previously `httpUrl` remote servers were silently dropped.
