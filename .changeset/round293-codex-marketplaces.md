---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

Scan the two remaining Codex marketplace manifest paths: `.cursor-plugin/marketplace.json` and `.agents/plugins/api_marketplace.json` now get the same mutable-source (AG-SC-001), inline-hook (AG-SK-003), inline `mcpServers` discovery, and npm plugin advisory checks as the other marketplace catalogs.
