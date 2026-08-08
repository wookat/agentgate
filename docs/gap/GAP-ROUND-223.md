# GAP-ROUND-223 — advisory sweep (routine, last: round 217)

Date: 2026-08-04
Round type: advisory intake

## Sweep

`node api/scripts/watch.mjs` (GHSA + OSV, 30-day window) against the 34-entry MCPA
database surfaced exactly one uncovered public advisory:

- **PYSEC-2026-3580 / GHSA-434r-7c99-hwf3 / CVE-2026-49138** — HKUDS nanobot
  (PyPI `nanobot-ai`) < 0.2.1: SSRF in the `web_fetch` tool. Initial URL validation
  is bypassed via a 3xx redirect to a loopback/private address that httpx follows
  automatically. Verified against the GHSA record, upstream fix PR
  (HKUDS/nanobot#3928) and the v0.2.1 release tag. GHSA CVSS 3.1 5.0 (medium).

Entered as **MCPA-2026-0021** (`type: ssrf`, range `introduced 0 / fixed 0.2.1`).

## Verification

- `node api/scripts/validate.mjs`: 35/35 schema-valid.
- Core bundled DB and API data rebuilt (35 entries each; repo/API/feed stay consistent
  once main deploys).
- End-to-end (real CLI): `advisory check nanobot-ai@0.2.0 -e pypi --offline` matches
  MCPA-2026-0021 (medium) + MCPA-2026-0020 (low), both version-confirmed;
  `nanobot-ai@0.2.1` clears 0021 (still in 0020's < 0.3.0 range as expected).

## Boundaries (honest)

- The SSRF is exploitable through agents that expose nanobot's `web_fetch`; agentgate
  flags the dependency wherever a config/manifest references `nanobot-ai`, but cannot
  judge whether `web_fetch` is enabled in a given deployment.
- No other new MCP/agent-ecosystem advisories surfaced in this window; watch-ignore
  list unchanged.
