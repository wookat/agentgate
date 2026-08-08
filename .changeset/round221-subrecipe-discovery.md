---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Goose subrecipe extension discovery: `sub_recipes[].path` references in the project-root recipe are now followed (resolved relative to the recipe's directory, per goose's own resolution; references outside the project or missing files are skipped), and the referenced subrecipes' `stdio`/`streamable_http`/`sse` extensions join the discovered server inventory for the full config rule set and advisory checks.
