---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 checks Amazon Q CLI agent hooks (`hooks` field in `.amazonq/cli-agents/*.json`): commands run automatically at lifecycle trigger points (agentSpawn, userPromptSubmit, preToolUse, postToolUse) get the same dangerous-command classification as Claude Code and Kiro hooks — remote-script pipes report critical, data exfiltration and credential reads report high. Benign context commands stay clean.
