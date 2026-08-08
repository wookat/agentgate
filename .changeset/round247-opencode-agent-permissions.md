---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks OpenCode agent markdown frontmatter permissions (`.opencode/agents/*.md`): catch-all `"*": allow` or `bash: allow` report high, unrestricted `edit`/`write`/`webfetch`/`websearch` allows report medium — same semantics as the existing `opencode.json` permission checks.
