# GAP-ROUND-219 — Goose subrecipe coverage (close the round-214/216 boundary)

Date: 2026-08-04
Round type: coverage (close a recorded boundary)

## Motivation

Rounds 214–216 gated all Goose recipe scanning (AG-SK-001 text injection, AG-SK-003
inline_python classification, AG-SC-002/003 inline_python dependency advisory checks)
on the filename `recipe.yaml`/`recipe.json`. The official subrecipes documentation
(goose `documentation/docs/guides/recipes/subrecipes.md`) registers subrecipes via the
main recipe's `sub_recipes[].path` under arbitrary names (the official example is
`./subrecipes/security-analysis.yaml`). A subrecipe runs in its own session when the
main recipe delegates to it: its `instructions`/`prompt` become agent instructions, its
`extensions` (including `inline_python` code and PyPI `dependencies`) start automatically
— the same threat surface as the main recipe, previously invisible to the scanner.

## Change

Instead of following `sub_recipes[].path` references (rule checks are content-based and
have no filesystem access), the recipe gate is now shape-based: any `.yaml`/`.yml`/`.json`
file whose parsed document matches the documented recipe shape (`title: string` +
`description: string` + `instructions|prompt: string`) is treated as a Goose recipe.
This covers referenced subrecipes at any path and name, and recipe libraries that a main
recipe elsewhere may reference. Shared helper `parseGooseRecipeDoc` (exported, with
`GOOSE_RECIPE_CANDIDATE`); consumers: AG-SK-001 recipe-text scan, AG-SK-003
inline_python classification, `gooseRecipeDependencyRefs`, and the CLI's dependency
collection loop.

The precise checks stay unchanged — a benign recipe-shaped file still yields zero
findings, so the widened gate only adds exposure where injection patterns, hidden
Unicode, risky inline_python code, or advisory-matching dependencies actually appear.

## Verification

- Official corpus: block/goose has real subrecipe fixtures (`scripts/test-subrecipes-examples/*.yaml`)
  and cookbook recipes with `sub_recipes` (`documentation/src/pages/recipes/data/recipes/*.yaml`);
  full repo re-scan: 3 findings — unchanged from the round-218 baseline, 0 new false positives.
- FP sweep on the yaml-heavy real corpus (n8n-mcp 19, OpenHands 6, soleur 70, online-go 2,
  frp 1, nanobot 13): all totals unchanged from the round-218 baseline — no file was newly
  misclassified as a recipe with findings.
- Shape-gate negatives covered by tests: docker-compose.yaml, GitHub issue-form yaml,
  conda-style packaging recipe.yaml — all not treated as recipes.
- End-to-end true positive: a subrecipe at `subrecipes/azure-helper.yaml` with
  `dependencies: [msmcp-azure==2.0.0b15]` reports AG-SC-003 high (MCPA-2026-0001,
  CVE-2026-26118) via the real CLI.
- Full suite green: core 323, cli 47, config-convert 24. Self-scan 19 findings (unchanged).

## Boundaries (honest)

- `sub_recipes[].path` references are still not resolved/validated (a reference pointing
  outside the repo or at a missing file is not reported); the shape gate covers in-repo
  content instead.
- Extension *discovery* (MCP server inventory + config rules) still only reads the project
  root `recipe.yaml`/`recipe.json` — subrecipe `stdio`/remote extensions are scanned by
  the rules above but not added to the discovered server inventory.
- A non-Goose YAML that happens to have top-level string `title` + `description` +
  `instructions`/`prompt` would be scanned as a recipe; the checks themselves gate on
  actual risk content, and the real-corpus sweep surfaced no such false positives.
