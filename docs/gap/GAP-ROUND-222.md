# GAP-ROUND-222 — Goose recipe-library discovery (close the round-214/221 boundary)

Date: 2026-08-04
Round type: coverage (close a recorded boundary)

## Motivation

Rounds 214/221 recorded a boundary: only the project-root `recipe.yaml`/`recipe.json`
got extension discovery, so recipe-library layouts (`<dir>/recipe.yaml`, e.g. a repo
hosting many recipes, one per directory) had their `extensions` rule-scanned as text
(round-219 shape gate) but never entered the discovered MCP server inventory — missing
AG-SC-001 pinning checks, AG-SC-002/003 advisory correlation on the normalized server,
AG-AM-001, and lockfile participation. The same applied to their subrecipes.

## Change

`gooseRecipeLocations` walks the project for files literally named
`recipe.yaml`/`recipe.json` (depth ≤ 4, skipping `node_modules`/dot-dirs/build dirs —
same skip set as the plugin walker), adds each as a `goose-recipe-yaml` location, and
follows each recipe's `sub_recipes[].path` resolved relative to that recipe's own
directory (goose's documented resolution, `resolve_recipe_sub_recipe_paths`). The
generic-filename false-positive risk (conda-style `recipe.yaml` etc.) stays handled by
`parseGooseRecipeYaml`'s shape gate — non-recipe-shaped files produce no servers.
Root behavior is unchanged; locations are deduped.

## Verification

- Real corpus: block/goose's nested `workflow_recipes/release_risk_check/recipe.yaml`
  is now discovered (platform-only extensions → correctly 0 servers). goose (3),
  soleur (70), OpenHands (6), n8n-mcp (19) finding totals and server counts all
  unchanged from the round-221 baseline — 0 new false positives.
- Unit test: nested `recipes/analyzer/recipe.yaml` with a `./subrecipes/security.yaml`
  reference yields both locations and both servers (`main-tool`, `sub-tool`);
  `node_modules` recipe not walked.
- Self-scan 19 unchanged. Full suite green: core 325, cli 47, config-convert 24.

## Boundaries (honest)

- Only files literally named `recipe.yaml`/`recipe.json` seed the walk; a main recipe
  under an arbitrary name is content-scanned (round-219) and reached for discovery only
  via a `sub_recipes` reference from a named recipe.
- Walk depth capped at 4 (same as the plugin walker); deeper libraries are not seeded.
- Subrecipe references outside the project or missing remain skipped, not reported.
