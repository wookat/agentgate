---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SC-001 flags unpinned OpenCode npm plugins: packages in the `plugin` array of `opencode.json`/`opencode.jsonc` are auto-installed by Bun and executed at startup, so specs without an exact version report medium (rug-pull / compromised-release exposure). Local plugin file paths and pinned specs stay clean.
