# GAP-ROUND-221 — Goose subrecipe extension discovery (close the round-219 boundary)

Date: 2026-08-04
Round type: coverage (close a recorded boundary)

## Motivation

Round 219 made subrecipe *content* visible to the rules (AG-SK-001/003, dependency
advisory refs) via the shape gate, but left a recorded boundary: a subrecipe's
`stdio`/remote `extensions` were rule-scanned as text yet never entered the
discovered MCP server inventory, so they missed the full config rule set
(AG-SC-001 pinning, AG-SC-002/003 advisory correlation on the normalized server,
AG-AM-001, lockfile participation).

## Change

`discoverConfigFiles` now follows the project-root recipe's `sub_recipes[].path`
references: each path resolves relative to the recipe's directory — matching
goose's own resolution (`resolve_recipe_sub_recipe_paths` in
`crates/goose/src/recipe/manifest.rs` resolves against the recipe file's parent) —
and, when the file exists inside the project, is added as a `goose-recipe-yaml`
location. The existing shape-gated `parseGooseRecipeYaml` then extracts its
`stdio`/`streamable_http`/`sse` extensions into the server inventory. Missing
files and references escaping the project directory are skipped; no recursion
(subrecipes cannot declare nested `sub_recipes`, per the official docs).

## Verification

- End-to-end (real CLI): a root recipe referencing `./subrecipes/security-analysis.yaml`
  whose subrecipe launches unpinned `npx -y @modelcontextprotocol/server-filesystem`
  now reports AG-SC-001 (unpinned + `-y`) and AG-SC-003 (MCPA-2025-0005 /
  CVE-2025-53109) on the subrecipe's server — previously invisible.
- Unit test covers: referenced subrecipe discovered and parsed, missing reference
  skipped, `../outside.yaml` escape skipped.
- Corpus: block/goose (3) and soleur (70) totals unchanged; self-scan 19 unchanged.
  The goose repo's own subrecipe examples live under non-root main recipes
  (`scripts/test-subrecipes-examples/project_analyzer.yaml`), which are outside
  root-recipe discovery — see boundaries.
- Full suite green: core 324, cli 47, config-convert 24.

## Boundaries (honest)

- Only the project-root `recipe.yaml`/`recipe.json`'s `sub_recipes` are followed
  for discovery; a main recipe under a subdirectory (recipe library layouts) is
  still content-scanned by the round-219 shape gate but its extensions stay out
  of the inventory (same boundary as round 214 for the main recipe itself).
- Absolute `sub_recipes[].path` values pointing outside the project are skipped
  (not reported) — they reference the runner's machine state, not repo content.
- `values`/parameter passing between recipe and subrecipe is not modeled.
