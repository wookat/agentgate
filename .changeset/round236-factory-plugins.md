---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Cover the Factory Droid plugin surface: discover MCP servers bundled by `.factory-plugin/` plugins (bare `mcp.json` at the plugin root, `${DROID_PLUGIN_ROOT}` path references, marketplace catalogs in `.factory-plugin/marketplace.json`), classify inline plugin/marketplace hooks (AG-SK-003), and flag plugins auto-enabled from mutable marketplace sources in `.factory/settings.json` (AG-SC-001).
