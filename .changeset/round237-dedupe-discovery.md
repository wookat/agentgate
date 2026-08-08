---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Deduplicate discovered config locations by path: a project-root `.mcp.json` reachable both as the claude-code location and via a plugin manifest's path ref (or a bare `mcp.json` doubling as a Factory plugin sibling) was scanned twice, duplicating its servers and findings.
