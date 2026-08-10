# GAP-ROUND-416 — routine windows + r415 fix verification

Date: 2026-08-10. Scanner at main@bf65a52 (post-#624). Honest no-defect round;
no code change, no changeset.

## Advisory windows

- **Authenticated GHSA/OSV watch** (`api/scripts/watch.mjs` with token):
  "No uncovered MCP-related advisories found."
- **OSV npm**: ETag `0f1e3bf0…` — identical to r414; MAL set unchanged.
- **OSV PyPI**: ETag `93f7c32e…` — identical to r414; MAL set unchanged.
- **Client version window**: claude-code v2.1.227 (bug-fix release per
  changelog — feature flags, TUI, slash-menu, MCP OAuth keychain fixes; no
  new config/skill/hook surface). All others unchanged from r414: codex
  0.147.0, gemini-cli v0.54.4, qwen-code v0.21.9, crush v0.88.1,
  copilot-cli v1.0.79, zed v1.14.2 (opencode/goose: no new release).

## Production consistency

Website 200; advisory API 109; JSON feed items 109; repo `advisories/`
MCPA files 109 — all consistent.

## r415 fix verification on main

Rebuilt at main@bf65a52 and rescanned the two r415 target repos:

- `MCPJam/inspector` — `shared/local-only-mcp.ts:30` now low (was high).
- `AnalystTom/Agent_panel` — `apps/server/src/siteFaviconCache.ts:70`
  now low (was high).

Matches the pre-merge 83-repo head-to-head (2 downgrades, zero upgrades).

## Release state

npm latest remains 0.67.54; two unconsumed patch changesets accrued on
main (`round413-ssrf-validator-context`, `round415-ssrf-host-classifier`).
Versioning awaits owner instruction (no auto-version PR while Actions is
down — a manual version PR is needed when the owner approves).

## Residual (unchanged)

- GitHub Actions outage continues — degraded merge gate in effect
  (GitGuardian + local checks, disclosed per PR).
- r415 singletons still deferred: `vehiclesdb/vehicles` `sk.yml`
  license-plate ids vs AG-CL-001; `MCPJam/inspector` `conformance.ts:100`
  attack-description comment beside guarded-fetch wiring.
