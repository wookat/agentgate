---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 now interprets the deprecated OpenCode `tools` boolean map in agent/mode frontmatter and in opencode.json (top-level and per-agent), matching OpenCode's own normalization: `bash: true` → `permission.bash: allow` (high), `write`/`edit`/`patch: true` → `permission.edit: allow` (medium), `false` → deny (quiet), with explicit `permission` keys taking precedence.
