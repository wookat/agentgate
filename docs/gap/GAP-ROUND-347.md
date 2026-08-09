# GAP-ROUND-347 — advisory window + AG-SS-001 blocklist-identifier precision

## Advisory window (honest zero)

- Authenticated GHSA/malware watch re-run: `No uncovered MCP-related advisories found.`
- OSV export ETags unchanged vs prior snapshot (npm `e31fe9a2…`, PyPI `c18a1fdc…`) — no diff to review.

## False-positive class (r343 corpus, 150 repos)

Manual triage of the remaining AG-SS-001 `high` findings: 4 of 21 are SSRF *guards*
whose defensive context the rule missed:

- `BLOCKED_METADATA_HOSTS = new Set(['169.254.169.254', …])` (2 repos): the word
  "BLOCKED" sits inside an identifier, and the `\b` word-boundary check fails at
  the underscore.
- `_BLOCKED_SAFE_MODE_NETWORKS` (Python `ip_network` blocklist): same identifier issue.
- `BLOCKED_V4_RANGES` header comment 6 lines above the IP literal: outside the
  previous ±3-line context window.

## Fix

A dedicated `blocklistNearby` check: unambiguous blocklist markers
(`block/blocked/blocklist/denylist/blacklist`) match at underscore boundaries and
look up to 7 lines above the hit. The broader defensive keyword set (SSRF, validate,
reject, …) intentionally keeps the original word boundaries and ±3-line window — a
first draft that widened everything wrongly downgraded `SSRF_PAYLOADS` attack lists
and an IMDS credential-fetching shell script (caught in corpus head-to-head and
reverted).

## Corpus head-to-head (150 repos, main vs fix)

- Exactly the 4 manually verified blocklist guards downgraded high → low; zero
  removed, zero added elsewhere; all other rules byte-identical.
- Stay high (verified true positives): SSRF/XXE exploitation skill payload scripts,
  `db2-driver.sh` fetching IMDS credentials, CTF-advisor methodology instructing
  metadata-API secret harvesting, GCP attestation-token fetch.

## Validation

`pnpm build` / `pnpm test` / `pnpm lint` / `pnpm typecheck` / `git diff --check` /
`node api/scripts/validate.mjs` / `node scripts/check-advisory-count.mjs` /
`node scripts/check-client-lists.mjs` all green.
