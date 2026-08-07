---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

OpenCode npm plugins get known-malware advisory checks: packages in the `plugin` array of `opencode.json` are now cross-checked against OSV.dev known-malware advisories (AG-SC-002) and the AgentGate MCP advisory database (AG-SC-003), the same as MCP server packages launched via npx-style runners — because they are auto-installed and executed at startup.
