---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Plugin discovery keeps descending past a bare `plugin.json` that resolves servers, so metadata-dir manifests (`.codex-plugin/` et al.) coexisting at the same root still contribute their bundled configs. AG-CL-001 also reports secret-shaped strings quietly in `test_*` / `*_test.*`-named script files, matching the existing test-path convention.
