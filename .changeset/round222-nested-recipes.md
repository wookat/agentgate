---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Goose recipe-library discovery: nested `recipe.yaml`/`recipe.json` files (any directory up to depth 4, skipping node_modules/dot-dirs) now get extension discovery like the project-root recipe, and each recipe's `sub_recipes[].path` references resolve relative to that recipe's own directory (goose's documented resolution) into subrecipe extension discovery.
