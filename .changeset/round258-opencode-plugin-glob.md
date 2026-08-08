---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-RC-001 now matches only `.opencode/{plugin,plugins}/*.{ts,js}` as auto-executed OpenCode plugins — `.mjs`/`.cjs`/`.mts`/`.cts` files are not loaded by OpenCode's plugin glob and no longer get the startup-exec classification.
