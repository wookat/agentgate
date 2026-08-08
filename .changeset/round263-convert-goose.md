---
'mcp-agentgate-config-convert': minor
'mcp-agentgate': minor
---

`config convert` supports `goose` (Block): parse/render the config.yaml `extensions` map — stdio/streamable_http/sse MCP extensions convert (`cmd`/`envs`/`uri` notation, `enabled` flag); non-MCP extension types (builtin, platform, frontend, inline_python) and goose-only fields (`timeout`, `available_tools`, `env_keys`) warn as skipped/lossy.
