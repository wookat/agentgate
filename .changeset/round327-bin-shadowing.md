---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-RC-001 flags plugin `bin/` entries that shadow core system commands (`git`, `curl`, `python`, …) on the Bash tool PATH as high — the classic PATH-hijack move; compiled binaries in plugin bin/ are no longer skipped, so name-based shadowing checks fire even when the content cannot be text-scanned.
