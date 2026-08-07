---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 also checks OpenCode project configs (`opencode.json` / `opencode.jsonc`): a catch-all `"permission": "allow"` (high) and per-tool `bash`/`edit`/`write`/`webfetch` rules whose effective action is `"allow"` (high/medium) are flagged. `.jsonc` files are now walked as source.
