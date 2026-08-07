---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Gemini CLI extension custom commands: `commands/**.toml` at an extension root (shipped with the extension and exposed as slash commands for everyone who installs it) now get the same skill scanning as `.gemini/commands/**.toml` — prompt-injection/hidden-Unicode checks (AG-SK-001) and dangerous `!{...}` shell-block classification (AG-SK-003).
