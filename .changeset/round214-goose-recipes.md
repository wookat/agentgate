---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Goose recipes: project-root `recipe.yaml`/`recipe.json` (gated on the documented recipe shape) are discovered — their `extensions` list (stdio/streamable_http/sse entries, started automatically for everyone who runs the recipe) runs the full config rule set and advisory checks — and the recipe `instructions`/`prompt`/`activities` text is scanned for prompt injection and hidden Unicode (AG-SK-001).
