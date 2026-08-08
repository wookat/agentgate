# GAP-ROUND-214 — Goose recipes: MCP extension discovery + instruction-text scanning

## Surface (official docs, verified)

Sources (block/goose `documentation/docs/guides/recipes/`, verified in the checked-out repo):

- `recipe-reference.md` — core schema: `title` + `description` required; at least one of
  `instructions` / `prompt`; optional `activities` (Desktop clickable prompts), `extensions`
  (array of the same `{ type, name, cmd, args, envs, uri, headers }` entries as config.yaml),
  `parameters`, `sub_recipes`. Extension types: `stdio`, `builtin`, `platform`,
  `streamable_http`, `frontend`, `inline_python`.
- `session-recipes.md` / `storing-recipes.md` — recipes are shared as files: `/recipe` generates
  `recipe.yaml` in the current directory; Desktop exports `.yaml`; recipe repos
  (`GOOSE_RECIPE_GITHUB_REPO`) store one recipe per directory. Running a recipe starts every
  listed extension and injects `instructions`/`prompt` as the agent's instructions.

Threat: a shared recipe is a one-file bundle of "prompt + auto-started MCP servers" — both a
supply-chain surface (unpinned/malicious `cmd` packages) and an instruction-poisoning surface.

## Implementation

1. Discovery — new `goose-recipe-yaml` format: project-root `recipe.yaml`/`recipe.json`
   (`parseGooseRecipeYaml`, YAML parses both). Gated on the documented recipe shape
   (`title` + `description` + `instructions`|`prompt`) because the filename is generic.
   `stdio`/`streamable_http`/`sse` entries normalize to servers (full config rules + OSV/MCPA
   advisory checks); `builtin`/`platform`/`frontend`/`inline_python` produce nothing.
2. AG-SK-001 — `recipe.{yaml,yml,json}` at any depth: `instructions`, `prompt`, and
   `activities` strings scanned for injection patterns + hidden Unicode (critical), same
   gating as discovery.

## Corpus validation (real repositories)

- `block/goose` `workflow_recipes/release_risk_check/recipe.yaml` (real, platform-only
  extensions): correctly parsed, 0 servers, 0 findings — including its long risk-assessment
  instructions (no injection FP).
- Official recipe cookbook `documentation/src/pages/recipes/data/recipes/csv-file-merger.yaml`
  (real stdio recipe, run as `recipe.yaml`): true positives — unpinned
  `npx @modelcontextprotocol/server-filesystem` (AG-SC-001 medium + `-y` low) and advisory hits
  MCPA-2025-0005/CVE-2025-53109 (AG-SC-003 medium ×2). End-to-end incl. advisory correlation.
- Non-goose `recipe.yaml` shapes (conda/rattler-style `package:` files): shape gate rejects.

## Honest boundaries

- Discovery only picks up project-root `recipe.yaml`/`recipe.json`; nested recipe-repo layouts
  (`<name>/recipe.yaml`) are covered by AG-SK-001 (any depth) but their extensions are not
  discovered as servers. Candidate for a later round if wild corpus justifies the walk.
- `sub_recipes` path references are not followed; each subrecipe file is scanned on its own
  only if it is named `recipe.yaml`/`recipe.json`.
- `inline_python` `code` blocks (uvx-executed) are not classified — candidate: AG-SK-003-style
  dangerous-code classification.
- Goose user-level `GOOSE_MODE: auto` / `permission.yaml` `always_allow` are user machine state
  (`~/.config/goose/`), not repository-carried; out of scope for repo scanning.

## Validation

- `pnpm build` / `pnpm lint` / `pnpm typecheck` green.
- Tests: core 314, cli 47, config-convert 24 — all green.
- Self-scan: 18 findings (14 medium, 4 low) — unchanged.
