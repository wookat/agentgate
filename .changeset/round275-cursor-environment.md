---
"mcp-agentgate-core": minor
"mcp-agentgate": minor
---

Scan Cursor cloud-agent environment configs (`.cursor/environment.json`): the `install` script runs at Build creation and `start`/`terminals[].command` run when an agent boots, all sourced from the repo — dangerous commands are classified with the shared AG-SK-003 classifier, naming the config key. Also fix a false positive: `cp .env.example .env.local`-style template scaffolding no longer counts as reading .env secrets.
