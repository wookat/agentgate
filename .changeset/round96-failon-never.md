---
'mcp-agentgate': patch
---

`scan` and `ci` accept `--fail-on never` (like `deps`): `scan --fail-on never` reports without gating, `ci --fail-on never` gates on lockfile drift only.
