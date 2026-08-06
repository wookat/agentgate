# GAP Report — Round 29 (advisory API strict query validation)

Follow-up to round 28's honest-limits note.

## Fixed

- **`/v1/advisories` silently ignored unknown query parameters.**
  `?package=mcp-remote` looked like it worked but returned the unfiltered (or
  ecosystem-only-filtered) list — a misuse trap I hit myself in round 28's
  verification. Unknown parameters now return
  `400 unknown query parameter(s): … — supported: severity, type, ecosystem; to
  match a package use GET /v1/query?name={pkg}`.
- Worker gained handler-level tests (`api/test/index.test.mjs`); `data.json`
  import now uses an explicit `with { type: "json" }` attribute so the module
  loads under plain Node (`node --test`) as well as wrangler/esbuild
  (`wrangler deploy --dry-run` verified).

## v0.7.1 release regression (same round, clean environment)

- `npx -y mcp-agentgate@0.7.1 --version` → 0.7.1; registry deps concrete.
- SARIF: driver.version 0.7.1, AG-SC-002/003 declared in rules, result
  `partialFingerprints.agentgateFindingKey/v1` present, relative URI `cfg.json`.
- Zero-config scan warns `nothing was scanned…`.
- Offline (`unshare -rn`): AG-SC-003 / MCPA-2026-0011 still hit from bundled data.

## Honest limits

- 400-on-unknown applies to `/v1/advisories` only; `/v1/query` keeps ignoring
  extras (its `name` requirement already fails closed).
