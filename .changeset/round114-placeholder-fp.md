---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-CL-001 no longer reports secret-shaped placeholder values (e.g. `xoxb-your-bot-token`, `sk-my-anthropic-api-key`) found in source files or command-line args — the placeholder check that already covered env/header values now applies everywhere the secret patterns are matched.
