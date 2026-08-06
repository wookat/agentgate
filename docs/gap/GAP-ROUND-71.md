# GAP-ROUND-71 — advisory watch: two more LudusMCP CVEs published today, uncovered

Date: 2026-08-06

## How the gap was found (real evidence)

Manual run of the weekly watch sweep (`WATCH_DAYS=3 node api/scripts/watch.mjs`)
flagged two GHSA advisories published 2026-08-06T18:30Z, same package as
round-64's MCPA-2026-0015 (npm `ludus-mcp`, all ≤ 1.0.24, no fixed release):

- `GHSA-grhp-mc55-jxg8` / CVE-2026-19047 — command injection in
  `executeArbitraryCommand/executeCommand` (`src/ludusMCP/cliWrapper.ts`,
  component `ludus_cli_execute`). CVSS 3.1: 5.3.
- `GHSA-6j8j-xrrf-px36` / CVE-2026-19046 — path traversal via `guide_name`
  in `src/tools/ludusEnvironmentGuidesSearch.ts` (component
  `ludus_environment_guides_search`). CVSS 3.1: 3.3.

## Ingestion (this round)

- `MCPA-2026-0016` (rce-vectors, medium — CVSS 5.3, consistent with 0015
  which shares the same vector/score even though GHSA labels this one "low").
- `MCPA-2026-0017` (path-traversal, low — CVSS 3.3).
- Bundled DB regenerated (29 → 31); `api npm run validate` + api tests
  (17 pass) + core 164 + cli 38 green.
- Real check: `agentgate advisory check ludus-mcp@1.0.24` now reports
  3 matches (0015/0016/0017), exit 1.

## Notes

- Both CVEs are "local access required" per NVD; severity kept at
  CVSS-aligned medium/low, not inflated.
- After merge: deploy the advisory Worker and website so the live API and
  pages serve 31 records.

## Remaining gaps (unchanged)

- GitHub Actions outage still queuing all workflows; 0.15.0 version PR
  pending Release workflow.
