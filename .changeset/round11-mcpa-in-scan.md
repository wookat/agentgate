---
'mcp-agentgate': minor
'mcp-agentgate-core': minor
---

`agentgate scan` cross-checks configured server packages against the bundled AgentGate MCP advisory database (`MCPA-*`) — new `AG-SC-003` finding covering RCE/SSRF/path-traversal/auth advisories beyond malware, with SemVer range comparison for pinned versions; works fully offline. New core exports `MCPA_ADVISORIES`, `matchMcpaAdvisories()`, `scoreMcpaMatches()`. Also fixed: `agentgate --version` reported a hardcoded `0.1.0`.
