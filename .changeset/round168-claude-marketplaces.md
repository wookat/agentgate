---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SC-001 flags Claude Code plugins auto-enabled from mutable marketplaces: `.claude/settings.json` entries in `enabledPlugins` whose marketplace (`extraKnownMarketplaces`) has a git-based source without a `sha` or release-style `ref` report medium — anyone who trusts the folder is prompted to install plugin hooks, MCP servers, and skills fetched from whatever the branch points at. Local directory/file sources, release-pinned sources, and non-enabled plugins stay clean.
