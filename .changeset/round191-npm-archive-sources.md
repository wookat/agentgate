---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SC-001 marketplace source mutability now covers `npm` and `archive` plugin sources: an npm source with no version or a range (`^2.0.0`) and a zip archive with no `sha256` digest both report medium — every install fetches whatever upstream serves next. Exact npm versions and sha256-pinned archives stay clean, and each finding carries source-type-specific pin advice.
