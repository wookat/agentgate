---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Copilot CLI plugin surfaces: marketplace catalogs at `.github/plugin/marketplace.json` and plugin manifests at `.plugin/plugin.json` / `.github/plugin/plugin.json` are now scanned — mutable plugin `source` entries (no `sha`/release `ref`) report AG-SC-001, inline `hooks` (flat Copilot event schema) go through the shared dangerous-command classification (AG-SK-003), and manifest `mcpServers` are discovered and advisory-checked like Claude Code plugins.
