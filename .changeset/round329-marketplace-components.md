---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Marketplace catalog entries with a local `source` now gate plugin component scanning: the entry's declared `skills`/`commands`/`agents`/`outputStyles` paths are followed (same resolver as plugin.json declarations) and the source root's conventional component dirs and `bin/` are scanned even when the plugin has no `plugin.json` at all (`strict: false` curated plugins).
