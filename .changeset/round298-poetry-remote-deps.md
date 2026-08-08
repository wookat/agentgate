---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

`agentgate deps` extends AG-DP-007 to Poetry table-form dependencies: `{ git = "…", branch/tag/rev = "…" }` entries in `[tool.poetry.dependencies]`, `[tool.poetry.dev-dependencies]`, and `[tool.poetry.group.<g>.dependencies]` are classified like other remote specifiers (unpinned git ref medium, full-SHA `rev` exempt), `{ url = "…" }` entries are flagged as non-registry archive URLs (high, now including direct `.whl` wheel URLs), and git-only dependency names are no longer sent to PyPI registry lookup.
