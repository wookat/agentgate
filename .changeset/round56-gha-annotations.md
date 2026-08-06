---
'mcp-agentgate': minor
---

`scan` (table format) and `ci` emit GitHub Actions workflow-command annotations (`::error file=…,line=…::`) — one per finding, critical/high as errors, medium as warnings, low/info as notices — when `GITHUB_ACTIONS=true`, so findings surface inline on the PR diff without needing SARIF upload. JSON/SARIF stdout is never mixed with annotations.
