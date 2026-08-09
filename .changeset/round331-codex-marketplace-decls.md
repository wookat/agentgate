---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Marketplace component-declaration parsing now covers Codex catalogs (`.agents/plugins/marketplace.json` and `api_marketplace.json`) and the Codex object-form local source (`{"source":"local","path":"./..."}`): entry-declared `skills`/`commands`/`agents`/`outputStyles` gate the source root even without a plugin manifest (Codex fallback-manifest semantics), and multiple catalogs in one repo are merged.
