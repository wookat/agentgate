---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Cover OpenCode's singular project directories: `.opencode/agent/`, `.opencode/command/`, and `.opencode/mode(s)/` markdown files are now scanned (AG-SK-001) and their `permission` frontmatter checked (AG-SK-002), matching OpenCode's own `{agent,agents}` / `{command,commands}` / `{mode,modes}` loader globs.
