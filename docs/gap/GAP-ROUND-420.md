# GAP-ROUND-420 — routine windows + r419 fix verification

Date: 2026-08-03. Scanner at main@13474e9 (post-#629). Honest no-defect
round; no code change, no changeset added this round.

## Advisory windows

- **Authenticated GHSA/OSV watch** (`api/scripts/watch.mjs` with token):
  "No uncovered MCP-related advisories found."
- **OSV npm**: ETag `d9092619…` — changed from r418 (`0f1e3bf0…`). Full MAL
  set diff: 15 new entries (MAL-2026-13713..13727 — sqlite-labs/prime/table
  squats, eth-library toolkit/utils, commonjs-assertion, fsbrowse, godot-kit,
  kit-map-streak, spoint, svelte-kit-streak, tailwind-elements-ui). Each
  inspected: zero MCP/agent/LLM/client keywords — none enter the MCPA DB.
- **OSV PyPI**: ETag `93f7c32e…` — identical to r414/r416/r418; set unchanged.
- **Client version window**: unchanged from r416/r418 — claude-code v2.1.227,
  codex 0.147.0, gemini-cli v0.54.4, qwen-code v0.21.9, crush v0.88.1,
  copilot-cli v1.0.79, zed v1.14.2 (opencode/goose: no new release).

## Production consistency

Website 200; advisory API 109; JSON feed items 109; repo `advisories/`
MCPA files 109 — all consistent.

## r419 fix verification on main

Rebuilt at main@13474e9 and rescanned both benign-"sidenote" repos:
- `Sinity_sinnix`: 0 sidenote findings (was 1 critical at SKILL.md:159).
- `j0hanz_j0hanz-marketplace`: 0 sidenote findings (was 1 critical
  DESIGN.md:22 + 1 low VOICE.md:31); repo now reports 0 findings total.
Matches the pre-merge 23-repo head-to-head exactly; the id_rsa demo payload
regression test remains pinned in `packages/core/test/rules.test.ts`.

## Deferred singletons (unchanged, still 1 repo each)

Infrawrench defensive metadata prose/validator (AG-SS-001); medusa
rule-description installer prose (AG-RC-001); medusa bidi controls in
executable rule regex/YAML (AG-TP-001); benchmark-fixture credentials
(AG-CL-001).

## Release state

npm latest 0.67.55; one unconsumed patch changeset on main (r419,
`round419-sidenote-marker`) awaiting the next version cut. GitHub Actions
remains down (account-level outage); degraded gate in effect.
