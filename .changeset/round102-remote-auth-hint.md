---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Remote live-scan auth failures (HTTP 401/403) now explain how to fix them: if no `headers` are configured the error shows the exact `"headers": { "Authorization": "Bearer …" }` snippet to add; if headers were configured it names the rejected header(s). Auth errors also no longer trigger a pointless SSE fallback attempt.
