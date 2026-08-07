---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

npm-distributed marketplace plugins (`source: "npm"` entries in `.claude-plugin/marketplace.json`) are now cross-checked against OSV.dev known-malware advisories and the AgentGate MCP advisory database, the same pipeline as runner-launched server packages and OpenCode plugins. Exact pinned versions are compared against version-scoped advisories.
