---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Marketplace catalog entries (`.claude-plugin/marketplace.json`) can define plugins entirely inline (`strict: false`). AgentGate now covers both inline surfaces: entry-level `mcpServers` are discovered and get the full config rule set + advisory checks, and entry-level `hooks` commands run through the shared dangerous-command classifier (AG-SK-003).
