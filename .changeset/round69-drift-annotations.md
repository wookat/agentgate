---
'mcp-agentgate': patch
'mcp-agentgate-core': patch
---

Under GitHub Actions, `agentgate ci` now emits one error annotation per lockfile drift entry (skill drift entries carry the changed file's path, so they land inline on the PR diff). The no-drift message now reads "locked surface" instead of "tool surface" since v2 lockfiles can also pin skill files.
