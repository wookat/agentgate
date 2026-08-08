---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-CL-001 treats boundary-delimited `test` and `demo` segments in secret-shaped values as placeholder markers (e.g. `xoxb-test-token` no longer reports as a hardcoded secret); real random-body tokens are unaffected.
