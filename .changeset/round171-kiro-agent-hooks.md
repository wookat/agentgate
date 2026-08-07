---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 checks Kiro agent hook files (`.kiro/hooks/*.kiro.hook`, when/then schema): `then.type: "runCommand"` actions execute automatically on IDE events (file save, prompt submit, tool use) for anyone who opens the project, so their commands get the shared dangerous-command classification (remote-script pipes critical, data-exfil/credential reads high). Disabled hooks and `askAgent` prompt actions are not flagged.
