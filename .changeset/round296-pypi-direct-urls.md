---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

`agentgate deps` extends AG-DP-007 to Python PEP 508 direct references: `name @ git+https://…` and `name @ https://…archive.zip` requirements in `requirements*.txt` and `pyproject.toml` (including PEP 735 `[dependency-groups]`, now parsed for registry names too) are now classified like npm remote specifiers (unpinned git ref medium, non-registry archive URL high; full commit SHA exempt). Direct-URL names still count as declared, so their imports are not flagged as missing.
