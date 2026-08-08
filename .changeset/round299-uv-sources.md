---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

`agentgate deps` extends AG-DP-007 to uv source overrides: `[tool.uv.sources]` entries that redirect a declared dependency to a git or URL source are now classified like other remote specifiers (unpinned/branch/tag git ref medium, full-SHA `rev` exempt, non-registry archive/wheel URL high), and redirected names are no longer sent to PyPI registry lookup.
