---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SC-001 now checks in-repo plugin marketplace catalogs (`.claude-plugin/marketplace.json`): a plugin entry whose git-based `source` (`github`, `url`, `git-subdir`) has no `sha` and no release-style `ref` reports medium — everyone who installs the plugin gets whatever the branch points at (rug-pull exposure). Relative-path sources (plugin code inside the marketplace repo) stay clean.
