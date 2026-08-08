---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Cover the Codex Agent Plugins repository surface: discover MCP servers from `.codex-plugin/plugin.json` and `.cursor-plugin/plugin.json` manifests (inline `mcpServers` and sibling `.mcp.json`), scan repo plugin marketplaces at `.agents/plugins/marketplace.json` for mutable sources and inline hooks (AG-SC-001/AG-SK-003), classify inline Codex manifest hook lists, and skill-scan plugin trees under `.codex-plugin/`/`.cursor-plugin/`.
