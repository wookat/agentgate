---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks Kiro project custom agents (`.kiro/agents/*.json` and `*.md` frontmatter) for embedded `permissions.rules`: a catch-all `allow` is high for `shell`/`all`/`builtin` and medium for `filesystem`/`fs_write`, `mcp`, and `web_fetch`. Scoped matches and `fs_read` stay clean; a catch-all `deny` for the same capability suppresses the allow. Kiro agent Markdown bodies are also scanned as instruction files.
