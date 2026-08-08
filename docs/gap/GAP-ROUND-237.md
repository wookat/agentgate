# GAP-ROUND-237 — Factory plugin surface precision sweep (2026-08-08)

Round type: precision sweep of the round-236 surface on the full wild
`.factory-plugin` corpus, plus a duplicate-discovery fix it surfaced.

## Corpus

GitHub code search (`path:.factory-plugin` `marketplace.json`/`plugin.json`):
46 unique repos, 27 cloneable + the 5 round-236 repos re-scanned (32 total).

## True positives (spot-verified)

- Chuzom/Chuzom, SaravanaKrishnan16/RouteProject: `.factory-plugin/marketplace.json`
  plugin served from a mutable GitHub source (no sha/release ref) — AG-SC-001 medium.
- adjacentresearchxyz/adjacent-plugin: `.factory/mcp.json` + plugin `mcp.json`
  remote servers without auth (AG-AM-001), Bash-preapproving `.factory/skills/*`
  (AG-SK-002 high ×6).
- SummerEngine/summer-engine-agent: unpinned npx package in `.mcp.json` +
  `gemini-extension.json` (AG-SC-001).

## False-positive class found and fixed

SummerEngine's root `.claude-plugin/plugin.json` declares `"mcpServers": "./.mcp.json"`
— the same file `discoverConfigFiles` already returns as the claude-code project
location. Both locations were parsed, so the server and its AG-SC-001 finding were
reported twice. The same overlap exists between the generic project-root `mcp.json`
location and the round-236 Factory plugin sibling.

Fix: `discoverConfigFiles` now dedupes discovered locations by path (first hit wins,
so the more specific static client label is kept). Regression test covers both
overlaps; the Open Plugin Spec bare-manifest test now asserts each server appears
exactly once.

Remaining corpus findings (oh-my-droid AG-RC-001 mediums, plannotator/claude-octopus
findings) are unchanged from pre-236 rule behavior — no new-surface FPs.

## Checks

- tests 347/47/24 green; lint/typecheck green; self-scan 21 (unchanged);
  32-repo sweep re-scan after fix: only duplicate findings removed, no TP lost.

## Boundaries (honest)

- 19 of 46 corpus repos were not cloneable (deleted/private/renamed) — not scanned.
- Dedupe is by exact path; the same server declared in two different files
  (e.g. `.mcp.json` + `gemini-extension.json`) still reports per file, by design.
