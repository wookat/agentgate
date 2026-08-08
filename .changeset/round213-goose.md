---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Goose (Block) support: discover MCP extensions in the goose user config (`~/.config/goose/config.yaml`, Windows `%APPDATA%\Block\goose\config\config.yaml`) — `stdio` and remote (`streamable_http`/`sse`) extension types run the full config rule set plus advisory checks (goose-internal `builtin`/`platform`/`frontend`/`inline_python` types are skipped) — and scan `.goosehints` files (added to the system prompt for every request in their directory tree) for AG-SK-001 injection/hidden-Unicode poisoning.
