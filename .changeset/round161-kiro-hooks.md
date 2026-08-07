---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 checks Kiro project hooks (`.kiro/hooks/*.json`): command actions that pipe remote scripts into a shell report critical, and ones that send data out or read credential material report high — they run automatically on session events for everyone who opens the project. Local lint/setup commands, agent prompt actions, and protective guard hooks stay clean. The shared credential-read pattern now requires a read verb before the credential path, so guard hooks (and Claude hooks) that merely pattern-match paths like `id_rsa` no longer report.
