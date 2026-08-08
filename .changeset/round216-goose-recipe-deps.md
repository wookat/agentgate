---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Goose recipe `inline_python` PyPI `dependencies` (installed by uvx and imported for everyone who runs the recipe) are checked against the OSV known-malware (AG-SC-002) and MCPA advisory (AG-SC-003) databases, with `name==version` pins compared against version-scoped advisories.
