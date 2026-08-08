# GAP-ROUND-215 — Goose recipe `inline_python` extension classification (AG-SK-003)

## Surface (official docs + source, verified)

- `recipe-reference.md`: "`inline_python`: Inline Python code executed using uvx. Requires
  `code` field; optional `dependencies` for packages." The code runs automatically when the
  recipe starts — for everyone the recipe is shared with.
- `crates/goose/src/agents/extension.rs`: `ExtensionConfig::InlinePython { name, code, … }`
  confirms the schema.

Closes the round-214 GAP boundary: recipe `extensions` discovery covered stdio/remote types
but `inline_python` code blocks were unclassified.

## Implementation

`AG-SK-003` (`skillDynamicContextRule.checkSource`): for shape-gated `recipe.{yaml,yml,json}`
files (same title+description+instructions|prompt gate as round-214), each `inline_python`
extension's `code` is classified via `classifyRiskyPythonCode`:

1. Shared shell classifier first (`classifyRiskyCommand`) — catches `curl|sh`, `irm|iex`,
   data-upload and credential-read shell strings embedded in the Python (e.g. inside
   `os.system(...)`).
2. Python-specific patterns (`RISKY_PYTHON`):
   - `exec`/`eval` of downloaded or decoded content (`urlopen`/`requests.get|post`/`b64decode`)
     — critical.
   - `requests.post|put` carrying `os.environ`/ssh/aws/.env material — high.
   - `open()` on credential files (id_rsa/id_ed25519/.aws/credentials/.ssh/.env) — high.

Deliberately NOT flagged: bare `subprocess`/`os.system` calls (ordinary automation in real
recipes) and ordinary data-processing code — only the dangerous idioms fire.

## Corpus validation (real repositories)

- All 46 real Goose recipes (44 official cookbook recipes in
  `documentation/src/pages/recipes/data/recipes/` + 2 `workflow_recipes/*/recipe.yaml`):
  0 findings (AG-SK-001 and AG-SK-003). No cookbook recipe uses `inline_python` today —
  noted honestly; true positives are covered by fixtures (exec-of-urlopen critical,
  os.environ exfil high).

## Honest boundaries

- `dependencies` of `inline_python` extensions are not advisory-checked (PyPI names,
  candidate for a later round via the existing deps/advisory pipeline).
- Obfuscation beyond base64 (e.g. string-concatenated URLs, marshal/pickle) is not modeled.
- Nested recipe layouts: classification applies at any depth (source scan), matching
  round-214's AG-SK-001 behavior; extension discovery remains project-root only.

## Validation

- `pnpm build` / `pnpm lint` / `pnpm typecheck` green.
- Tests: core 316, cli 47, config-convert 24 — all green.
- Self-scan: 19 findings (15 medium, 4 low) — +1 vs round-214: AG-RC-001 medium on our own new test fixture (the `exec(urlopen(…))` true-positive string in `scanner.test.ts`), an honest dogfood signal, below the CI gate (high).
