---
'mcp-agentgate-config-convert': minor
'mcp-agentgate': minor
---

`config convert` supports `crush` (Charm): parse/render the `.crush.json` / `crush.json` `mcp` map with stdio/http/sse `type` semantics and the `disabled` flag; crush-only fields (`oauth`, `disabled_tools`, `enabled_tools`, `timeout`) warn as lossy.
