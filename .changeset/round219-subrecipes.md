---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Goose subrecipe coverage: recipe scanning (AG-SK-001 injection/hidden Unicode, AG-SK-003 inline_python classification, AG-SC-002/003 inline_python dependency advisory checks) now gates on the documented recipe shape (title + description + instructions|prompt) for any YAML/JSON file, not just files named `recipe.yaml`/`recipe.json` — covering subrecipes referenced from a main recipe's `sub_recipes[].path` under arbitrary names (e.g. `subrecipes/security-analysis.yaml`).
