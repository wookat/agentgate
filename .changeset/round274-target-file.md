---
"mcp-agentgate": patch
---

Findings table shows the source config file under the target for server-scoped findings, so identical findings for the same server declared in several client configs (e.g. `.roo/mcp.json` + `.kilocode/mcp.json` + `.gemini/settings.json`) are distinguishable instead of looking like duplicate rows.
