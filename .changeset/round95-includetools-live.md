---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

`scan --live` correlates a server's `includeTools` allowlist against its actual tool surface: entries matching no live tool report a low AG-OP-001 finding (stale or typoed allowlist entries scope nothing).
