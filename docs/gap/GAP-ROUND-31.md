# GAP Report — Round 31 (automated advisory-watch sweep)

## Gap

Advisory intel sweeps (GHSA/OSV) have been manual, once per round. Freshness of
the MCPA database depended entirely on someone remembering to look — the exact
failure mode competitors solve with automation (Dependabot-style feeds).

## Fixed

- `api/scripts/watch.mjs`: dependency-free sweep that reports
  1. GHSA advisories from the last `WATCH_DAYS` (default 8) days whose text
     mentions MCP / Model Context Protocol and whose GHSA/CVE ids are not yet
     MCPA aliases;
  2. new OSV advisories (published inside the window) affecting packages
     already tracked in `advisories/*.json`, deduped across packages.
- `.github/workflows/advisory-watch.yml`: Monday cron + manual dispatch; opens
  a labelled issue with the report when the sweep finds anything (default
  `GITHUB_TOKEN`, `issues: write` only, actions pinned by SHA).

## Live run (2026-08-06, real data)

- GHSA: `GHSA-q94p-g4rh-r9rf` (NanoClaw, CVE-2026-18991) — known, deliberately
  not ingested (not a registry package; rationale in GAP-ROUND-27).
- OSV: 2026-08-04 batch of Flowise/flowise-components GHSA entries (platform
  CVEs, delegated to osv-scanner per GAP-ROUND-22 rationale), PYSEC mirror ids
  for already-covered gemini-bridge / flyto-core / openai-mcp campaign CVEs.
  Mirror ids will be added as aliases in a follow-up data round to quiet the
  sweep.

## Honest limits

- Keyword matching ("mcp") can miss advisories that never mention MCP and can
  false-positive on unrelated uses of the string; the issue is a triage queue,
  not auto-ingestion.
- OSV sweep only covers packages already in the database — it detects new
  advisories for known packages, not brand-new campaigns (GHSA sweep and manual
  rounds cover those).
