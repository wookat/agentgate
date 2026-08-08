# GAP-ROUND-213 — new client: Goose (Block)

## Surface (officially verified)

Goose (block/goose, the Block AI agent) — docs `documentation/docs/guides/config-files.md`
and `context-engineering/using-goosehints.md` in the official repo:

1. **User config** `~/.config/goose/config.yaml` (Windows
   `%APPDATA%\Block\goose\config\config.yaml`): the `extensions:` map is
   goose's MCP server registry. `type: stdio` entries carry `cmd`/`args`/`envs`;
   remote `streamable_http` (and legacy `sse`) entries carry `uri`/`headers`.
   `builtin`/`platform`/`frontend`/`inline_python` types are goose-internal,
   not MCP servers.
2. **Local hints** `.goosehints` — project root or any directory; goose adds
   them to the system prompt for every request in that tree (Developer
   extension). Same trust model as AGENTS.md/QWEN.md (round 123/198 faces).
   Corpus evidence: ~267 `.goosehints` files on GitHub.

## What changed

- New `goose-yaml` discovery format + `parseGooseYaml`: only stdio/remote
  extension types are normalized into servers (full config rules + OSV/MCPA
  advisory checks); internal types produce nothing.
- `.goosehints` added to `SKILL_FILE` → AG-SK-001 injection/hidden-Unicode
  scanning (dot-files are already walked, so nested hints are covered).

## Corpus validation (real repos, /tmp/r213)

- `block/goose` (official): 3 real `.goosehints` (root, ui/desktop,
  documentation) — 0 false positives; the repo's 3 pre-existing AG-RC-001
  findings are generic source hits unrelated to this round.
- `dagger/container-use`: real root `.goosehints` — 0 findings.
- True positives covered by fixtures (exfiltration + concealment phrasing,
  nested directory hint).

## Boundaries (honest)

- Project-level `.goose/config.yaml` is not modeled: not officially
  documented as a config location (only ~6 GitHub hits); user-level config is
  the documented registry.
- The global hints file `~/.config/goose/.goosehints` is user-local state,
  not repository-carried — out of scope like other user-level context files.
- `GOOSE_MODE: auto` and permission.yaml tool-permission levels are not yet
  modeled as an AG-SK-002 face (candidate for a follow-up round).
- Goose "recipes" (`GOOSE_RECIPE_GITHUB_REPO`, recipe yaml with prompts) are
  a separate execution face, not covered this round.

## Validation

`pnpm build/lint/typecheck/test` green (core 309, cli 47, config-convert 24);
self-scan unchanged at 18 findings.
