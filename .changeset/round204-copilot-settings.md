---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Copilot CLI settings files (repo-level `.github/copilot/settings.json` + `settings.local.json`, user-level `.copilot/settings.json`) are now scanned: inline `hooks` commands go through the shared dangerous-command classification (AG-SK-003), and plugins auto-enabled via `enabledPlugins` from mutable `extraKnownMarketplaces` git sources report AG-SC-001 — repository settings apply to everyone who works in the repository.
