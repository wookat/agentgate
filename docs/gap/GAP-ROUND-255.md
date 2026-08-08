# GAP-ROUND-255 — CI gate for hardcoded advisory counts in docs

Date: 2026-08-08.

## Gap

Round 252 found the comparison page claiming "41 public advisories" while the
database had 73 — the count had been stale through five advisory batches
(rounds 234–244). Nothing prevented the same drift from recurring: the count
is prose inside a content markdown file, invisible to the schema/bundle sync
checks.

## Fix

`scripts/check-advisory-count.mjs` — counts `advisories/MCPA-*.json` entries
and fails when any `git grep`-discovered "N public advisories" claim
disagrees. Wired into the CI dogfood job right after the bundled-data sync
check. Verified: passes at 73, fails with a precise message when the doc is
edited to a wrong count (negative test), and picks up any future file that
adds such a claim without needing a list to maintain.

## Boundary (recorded)

- Only the "N public advisories" phrasing is gated; free-form prose counts
  elsewhere (none exist today) would need the same phrasing to be covered.
- Live API/feed counts are already covered by release verification, not CI.
