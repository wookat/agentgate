# GAP-ROUND-84 — advisory watch: `--draft` prefills an MCPA skeleton

Date: 2026-08-07

## Gap (real evidence)

Every triaged watch hit so far (rounds 64, 71) was turned into an MCPA JSON
by hand: copying aliases, CVSS vector, CWE, ranges, and reference URLs from
the GHSA page — mechanical, error-prone work (the round-71 entries took
noticeably longer than the analysis itself). GAP-ROUND-82 recorded
"auto-drafting an advisory JSON from a triaged hit" as the open item.

## Fix

`node api/scripts/watch.mjs --draft GHSA-xxxx-xxxx-xxxx` fetches the GHSA
detail and prints a prefilled MCPA skeleton: next free MCPA id, aliases,
severity (GHSA `moderate` → `medium`), CVSS vector/score, CWE ids,
references (advisory/NVD/source), published date, package ranges
(`last_patched_version` → `fixed`, else `<=` bound → `last_affected`), and
a keyword-guessed `type`. Anything not derivable is emitted as a loud
`FIXME` — the human still reviews every field, and `validate.mjs` remains
the schema gate. Pure logic lives in `watch-lib.mjs` (unit-tested).

## Verification

- Real run against GHSA-6j8j-xrrf-px36 (the round-71 LudusMCP traversal):
  id MCPA-2026-0018, type path-traversal, aliases/CVSS/CWE/published all
  correct; the GHSA record carries no package metadata (unreviewed), so
  packages emit FIXME — exactly the honest behavior wanted.
- Unit tests: full-payload prefill + FIXME/moderate-mapping edge case.
  api suite 20/20 green.

## Still open (honest)

- GHSA `--draft` requires a GITHUB_TOKEN for the details endpoint (403
  anonymous); the watch workflow already has one.
- No OSV-based drafting; OSV hits are rarer and shaped differently.
