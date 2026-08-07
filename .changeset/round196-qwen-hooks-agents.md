---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Qwen Code agent surfaces: `hooks` in project `.qwen/settings.json` (same nested shape as Claude Code/Gemini CLI settings hooks, fire on lifecycle events) run through the shared dangerous-command classifier (AG-SK-003); `.qwen/agents/*.md` sub-agents, `.qwen/commands/**.md` custom commands (incl. deprecated `.qwen/commands/**.toml`), and `.qwen/skills`/`.qwen/commands` markdown get skill scanning (AG-SK-001 injection/hidden-Unicode + AG-SK-003 `!{...}` shell blocks).
