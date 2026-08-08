# GAP-ROUND-216 — Goose recipe `inline_python` dependencies → advisory checks

## Surface (official docs, verified)

- `recipe-reference.md`: `inline_python` extensions take an optional `dependencies` list of
  PyPI packages; uvx installs them and the code imports them automatically when the recipe
  runs — for everyone the recipe is shared with. A poisoned or typosquatted dependency name
  is executed with the user's privileges.

Closes the round-215 GAP boundary: inline_python `code` was classified but its
`dependencies` were not advisory-checked.

## Implementation

- `gooseRecipeDependencyRefs(file, content)` (supply-chain module): shape-gated recipe parse
  (same title+description+instructions|prompt gate as rounds 214/215); each `inline_python`
  extension's string `dependencies` become `pypi` refs via the shared PEP 508 `splitSpec`
  (`name==1.2.3` pins carry a version; range specs yield the bare name).
- CLI scan wires these refs into the existing advisory pipeline (same loop as OpenCode npm
  plugins / marketplace npm plugins, rounds 167/192): OSV known-malware (AG-SC-002) + MCPA
  bundled/live database (AG-SC-003), version-confirmed matches carry advisory severity.
- Works at any depth: refs are collected from every shape-gated `recipe.yaml|yml|json` the
  repo walk visits, not only the project root.

## Validation (real runs, no fabricated data)

- End-to-end true positive: a recipe pinning `msmcp-azure==2.0.0b15` (inside the
  MCPA-2026-0001 affected range) reports AG-SC-003 high, version-confirmed; the benign
  `pandas` dependency reports nothing.
- FP sweep: all 46 real Goose recipes (44 official cookbook + 2 workflow_recipes) → 0
  findings (none uses `inline_python` today — noted honestly, true positives fixture-covered).

## Honest boundaries

- `sub_recipes` path references are still not traversed.
- Obfuscated dependency delivery (pip install inside the code block) is only caught if it
  matches the round-215 code classifiers.

## Validation commands

- `pnpm build` / `pnpm lint` / `pnpm typecheck` green.
- Tests: core 317, cli 47, config-convert 24 — all green.
- Self-scan: 19 findings — unchanged from round-215.
