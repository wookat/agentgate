# GAP-ROUND-224 — precision sweep of nested recipe discovery (rounds 221–222)

Date: 2026-08-04
Round type: real-corpus FP/perf verification (no code change needed)

## Why

Rounds 221–222 made `recipe.yaml`/`recipe.json` traversal seeds at any depth (≤4) and
follow `sub_recipes[].path`. `recipe.yaml` is a generic filename used heavily by
non-Goose ecosystems (rattler-build/conda v1 recipes, conda-build docs). This round
verifies at scale that the recipe-shape gate (`title`+`description`+`instructions|prompt`)
holds and traversal cost stays flat.

## Corpus (real clones, real CLI runs)

| repo | nested recipe.yaml/json | servers | findings | time |
|---|---|---|---|---|
| prefix-dev/rattler-build | 152 (164 recipe-named files scanned) | 0 | 0 | 0.51s |
| conda/conda-build | 2 | 0 | 0 | 0.90s |
| block/goose | 1 nested + root fixtures | baseline | 3 (= round-222 baseline) | 4.3s |
| All-Hands-AI/OpenHands | 0 | baseline | 6 (= round-222 baseline) | 0.93s |
| openstack/rally | 0 | — | 0 | 0.16s |

- rattler-build is the worst-case wild corpus for this surface: 152 nested
  `recipe.yaml` under `test-data/recipes/**`. All were visited by the new walk and
  every one was rejected by the shape gate — 0 servers, 0 findings, no perf impact.
- goose/OpenHands finding counts unchanged vs the round-222 baselines (no drift).

## Conclusion

No false positives and no regressions found; no code change required this round.
Self-scan stays at 19 findings.

## Boundaries (unchanged, honest)

- Only literal `recipe.yaml`/`recipe.json` seed the walk (depth ≤ 4); arbitrary-named
  recipes are reached via content shape scanning or `sub_recipes` references.
- bioconda-style `meta.yaml` recipes are out of scope (different filename, never seeded).
