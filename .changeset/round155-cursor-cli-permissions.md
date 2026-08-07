---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks Cursor CLI project permission configs (`.cursor/cli.json`): `Shell(*)` and `Mcp(*:*)` in `permissions.allow` are high; catch-all `Write(**)`, `WebFetch(*)`, and whole-server `Mcp(server:*)` are medium. Scoped tokens stay clean and a matching `permissions.deny` entry suppresses the allow.
