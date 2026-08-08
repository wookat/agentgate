# GAP-ROUND-220 — data checkpoint (rounds 211–219)

Periodic honest-data checkpoint. No code changes; numbers measured on
2026-08-04 against `main` (post-#335) and npm/production.

## Shipped since round 210

| Round | PR | Face |
| --- | --- | --- |
| 211 | #326 | OpenHands repository customization (`.openhands/skills`/`microagents` + `setup.sh`) |
| 212 | #327 | Docs catch-up — Qwen Code / Copilot CLI / Junie in discovery client lists |
| 213 | #328 | Goose (Block) — `config.yaml` MCP extension discovery + `.goosehints` skill scanning |
| 214 | #329 | Goose recipes — `recipe.yaml`/`json` extension discovery + recipe-text scanning (AG-SK-001) |
| 215 | #330 | Dangerous Goose `inline_python` classification (AG-SK-003, shell + Python idioms) |
| 216 | #332 | Goose recipe `inline_python` PyPI dependency advisory checks (AG-SC-002/003) |
| 217 | #333 | Advisories MCPA-2026-0018/0019/0020 — n8n-mcp backup exposure + nanobot scope bypass |
| 218 | #334 | Real-corpus FP sweep — echoed curl\|sh, SSRF context window, underscore placeholders, test-path bidi |
| 219 | #335 | Goose subrecipes — recipe scanning gates on shape, not filename |

Theme: the Goose surface went from uncovered to end-to-end (config →
goosehints → recipes → inline_python code → PyPI deps → subrecipes), plus
OpenHands repo customization, three fresh advisories, and a precision sweep
that fixed four legacy-rule false positives found in the wild.

## Releases

- npm remains at **0.51.0** (core + cli; config-convert unchanged at 0.9.0).
- Rounds 211/213–216/219 minors and 217/218 patches are accumulating toward
  **0.52.0** in the changesets version PR; no release cut in this window.

## Data (measured, not estimated)

- Tests: 372 → **394** (core 323, cli 47, config-convert 24).
- Self-scan: 158 files, **19 findings** (15 medium, 4 low), ~0.7 s cold /
  ~0.2 s of that in the walk — the +1 vs round 210 is our own round-215 test
  fixture (`exec(urlopen)` string), an honest dogfood signal below the CI
  gate (high).
- Advisories: **34** — repo (`advisories/*.json`), live API
  (`/v1/advisories`), and the JSON feed all agree.
- npm downloads (last month): **3,124** — seventh consecutive flat
  checkpoint. Distribution remains the biggest gap; coverage keeps
  compounding while adoption is static. Owner decision still pending on
  distribution investment (launch posts, integrations, registry listings).

## Known open boundaries (carried forward)

- Goose: `sub_recipes[].path` references are not resolved/validated;
  subrecipe `stdio`/remote extensions are rule-scanned but not added to the
  discovered server inventory; user-machine state (`~/.config/goose/`
  permissions, `GOOSE_MODE`) not modeled.
- OpenHands: microagent `triggers` frontmatter not modeled (everything is
  scanned, conservatively correct).
- Referenced hook/launch script files are never content-followed (uniform
  boundary across all hook faces).
- Data-directory files with real, copy-pasteable `curl|sh` install commands
  (e.g. awesome-copilot `tools.yml`) still report critical — real commands,
  not maskable by semantics.
- n8n-mcp multi-tenant advisories (MCPA-2026-0018/0019) fire on any config
  referencing the npm package; server-side deployment mode cannot be
  determined from client config.
