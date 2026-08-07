---
'mcp-agentgate': minor
---

`deps` now gates by default: `--fail-on` defaults to `high` (matching `ci`), so a bare `agentgate deps` exits 1 on hallucinated/typosquatted/malicious dependencies instead of silently passing. Use `--fail-on never` to report without gating.
