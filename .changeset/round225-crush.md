---
"mcp-agentgate-core": minor
"mcp-agentgate": minor
---

Crush (Charm) client support: discover MCP servers in the legacy JSON config (`~/.config/crush/crush.json`, project `.crush.json`/`crush.json` — JSONC `mcp` map with stdio/http/sse entries) and run the full config rule set plus advisory cross-checks on them; classify dangerous `hooks` event commands (AG-SK-003); flag risky `permissions.allowed_tools` pre-approvals (`bash` high, `edit`/`write` medium) (AG-SK-002).
