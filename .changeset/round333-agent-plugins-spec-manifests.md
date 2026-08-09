---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Agent Plugins spec manifests (a root-level `plugin.json` whose `$schema` points at agent-plugins.org) now gate plugin component scanning: their `skills/` and other component trees are text-scanned and lockable, the implicit bundled `./mcp.json` is discovered for pin/advisory checks, and inline hooks under `extensions["com.openai"].hooks` are classified by AG-SK-003. Generic bare `plugin.json` files (e.g. Jenkins plugins) never gate — the manifest is parsed and matched on its schema, not its filename.
