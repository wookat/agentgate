# GAP-ROUND-230 — data checkpoint (rounds 221–229)

Periodic honest-data checkpoint. No code changes; numbers measured on
2026-08-08 against `main` (post-#347) and npm/production.

## Shipped since round 220

| Round | PR | Face |
| --- | --- | --- |
| 221 | #338 | Goose `sub_recipes[].path` tracked into subrecipe extension discovery |
| 222 | #339 | Nested recipe-library layouts (`<dir>/recipe.yaml\|json`) discovered, per-recipe-relative subrecipe resolution |
| 223 | #340 | Advisory MCPA-2026-0021 — nanobot web_fetch SSRF (CVE-2026-49138) |
| 224 | #341 | Precision sweep of nested recipe discovery (docs — 152-recipe rattler-build corpus, 0 FP) |
| 225 | #342 | Crush (Charm) client — `crush.json` MCP discovery, hooks (AG-SK-003), allowed_tools (AG-SK-002) |
| 226 | #343 | Crush `crushrc` (auto-executed Bash) — source scanning, executable RCE severity, `permissions allow` lines |
| 227 | #345 | Crush-surface precision sweep — docker CLI plugin subcommand FP fix (AG-SC-001) |
| 228 | #346 | Advisories MCPA-2026-0022..0027 — Dynatrace MCP Server batch + Flowise RCE/SSRF batch |
| 229 | #347 | Crush allowed_tools — scoped `tool:action` keys + dangerous `mcp_<server>_<tool>` names |

Theme: the Goose recipe surface closed out (subrecipes + nested libraries,
precision-verified on the worst wild corpus), the Crush surface went from
uncovered to end-to-end (JSON config → hooks → allowed_tools → crushrc →
scoped/MCP tool keys) with two precision sweeps, and two advisory sweeps added
seven entries.

## Releases

- npm remains at **0.51.0** (core + cli; config-convert unchanged at 0.9.0).
- Rounds 221/222/225/226/229 minors and 223/227/228 patches are accumulating
  toward **0.52.0**; no release cut in this window.

## Data (measured, not estimated)

- Tests: 394 → **406** (core 335, cli 47, config-convert 24).
- Self-scan: 165 files, **20 findings** (15 medium, 5 low), ~0.69 s cold —
  the +1 vs round 220 is our own MCPA-2026-0027 advisory JSON mentioning the
  metadata endpoint in a defensive context (low, below the CI gate).
- Advisories: **41** — repo (`advisories/*.json`), live API
  (`/v1/advisories`), and the JSON feed (41 items) all agree.
- npm downloads (last month): **3,124** — eighth consecutive flat
  checkpoint. Distribution remains the largest gap and stays a
  CEO-level decision (marketing/launch), not something more scanning
  surface fixes.

## Known gaps carried forward

- Crush MCP tool-name classification is name-heuristic only (GAP-229).
- VulDB no-mapping low CVEs from the round-228 sweep await upstream
  verification before ingestion (GAP-228).
- README client list spot-checked: Crush, Goose, and Junie are present
  (no drift found this checkpoint).
