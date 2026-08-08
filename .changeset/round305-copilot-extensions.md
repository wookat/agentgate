---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Scan Copilot CLI extensions (`.github/extensions/<name>/extension.{mjs,cjs,js}` and plugin-shipped `com.github.copilot/extensions/`) as auto-executed startup surface: AG-RC-001 flags dynamic code-execution primitives and curl|sh launches in extension entrypoints, which run as forked Node processes on session start.
