# GAP-ROUND-273 — CI gate for docs client-list drift

Date: 2026-08-08. Closes the round-272 GAP candidate. The staleness class is
real, not speculative: hand-maintained client lists drifted twice — the
comparison advisory count (caught round 252) and the homepage list missing
Kilo Code (caught round 272, nine rounds after the client shipped).

## What was built

`scripts/check-client-lists.mjs`, wired into the dogfood CI job after the
advisory-count gate (round 255):

- The canonical client set is **derived from code**, not hand-listed twice:
  client ids are parsed out of `packages/core/src/discovery.ts` (`push('id'`
  and `client: 'id'` sites), so the gate cannot itself go stale silently.
- Pseudo-clients that ride on another client's config (`claude-plugin`,
  `gemini-extension`, `qwen-extension`, `copilot-agent`, `factory-plugin`,
  the generic `agents` convention, and the `unknown` fallback) are explicitly
  excluded with per-id rationale.
- Each real client maps to accepted prose substrings (long form + the
  homepage's abbreviated forms, e.g. `Amazon Q` covers
  "Amazon Q Developer").
- Watched files: `README.md`, `packages/cli/README.md`, the quick-start and
  `scan` docs pages, and the homepage (`index.astro`) — the five locations
  audited in round 272.
- Failure modes covered: a docs list missing a client; a new discovery id
  with no display-name mapping (forces the gate and docs to be updated in
  the same PR as the new client); a mapping whose id has been removed from
  discovery.

## Verification (negative tests, real runs)

- Removing "Kilo Code" from `index.astro` → exit 1 naming the file and
  client (exactly the round-272 drift, now impossible to merge).
- Clean tree → `client lists in 5 file(s) cover all 27 discovery clients`,
  exit 0.
- Full suite/lint/typecheck/build green; CI workflow change is one added
  step.

## Boundaries

- The gate checks *presence*, not ordering or phrasing — lists remain
  human-written prose.
- config-convert's separate client registry (26 convert ids) is not gated
  here; its round-264 "convert/discovery gap zero" property is tracked by
  convert tests, not docs prose.
