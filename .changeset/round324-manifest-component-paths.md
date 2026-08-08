---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Plugin component scanning follows manifest-declared custom `commands`/`agents`/`skills` paths (files, directories, and glob patterns relative to the plugin root, per the Claude Code plugins reference), so markdown installed through non-conventional paths like `./ads/` or `./command/` is text-scanned and lockable; declarations escaping the plugin root are ignored.
