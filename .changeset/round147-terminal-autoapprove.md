---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks the `chat.tools.terminal.autoApprove` map in VS Code workspace settings: a catch-all regex rule (`"/.*/": true`) is high, and auto-approving a command from VS Code's own default-deny list (`rm`, `curl`, `chmod`, shells, `sudo`, ...) is medium. Scoped safe commands stay clean.
