# GAP Report — Round 33 (deterministic tests for the advisory-watch sweep)

## Gap

The round-31 sweep logic (keyword filter, alias dedupe, ignore-list, date
window, report rendering) had only been exercised against live GHSA/OSV data.
Live runs can't prove edge cases (dupe-by-CVE, package-level ignore with mixed
package sets, alias-covered OSV mirrors) and would silently regress.

## Fixed

- Extracted the pure logic into `api/scripts/watch-lib.mjs` (`buildContext`,
  `isIgnored`, `filterGhsa`, `collectOsvCandidates`, `filterOsvDetail`,
  `renderReport`); `watch.mjs` keeps only I/O (fs + fetch) and delegates.
- `api/test/watch.test.mjs`: 7 deterministic fixture tests covering
  alias/tracked-package collection, id- and package-level ignores, MCP keyword
  gating, dedupe across packages, date-window + alias-covered OSV filtering,
  and report rendering (sections, warnings, empty case). `api/` suite 10 → 17.

## Verified

- `npm test` in `api/`: 17 pass, 0 fail.
- Live authenticated sweep after the round-32 data merge now reports
  "No uncovered MCP-related advisories found." — zero noise, matching the
  triage state (NanoClaw + Flowise platform CVEs ignored with rationale,
  flyto-core batch ingested).

## Honest limits

- The network layer (GHSA pagination beyond 100, OSV querybatch paging) is
  untested; both sources are currently well under those limits.
