---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 also checks inline `[hooks]` tables in Codex project config (`.codex/config.toml`): they use the same event schema as `hooks.json`, so dangerous lifecycle hook commands (remote-script pipes, data-exfil/credential reads) report identically wherever they are declared.
