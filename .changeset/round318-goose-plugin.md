---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Cover goose Open Plugin manifests: `.goose-plugin/plugin.json` is now walked and scanned like other plugin metadata dirs, and the Open Plugin Spec component form `mcpServers: { paths: [...], exclusive }` resolves referenced config documents (plus the plugin root's `.mcp.json` when not exclusive) for discovery, pin, and advisory checks.
