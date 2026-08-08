---
'mcp-agentgate-config-convert': minor
'mcp-agentgate': minor
---

`config convert` supports the Kilo CLI: new `kilo` client for `kilo.json(c)` (OpenCode schema); the `opencode` and `kilo` adapters are JSONC-tolerant; default-path auto-discovery splits the two Kilo surfaces by schema (`kilo` → `kilo.json(c)`, `kilocode` → mcp.json / mcp_settings.json).
