# GAP Report — Round 37 (automate doc integration pins; routine sweeps)

## Gap

Round 36 fixed the doc pins by hand and predicted they'd go stale again with
each release — which happened immediately: v0.8.0 shipped and every snippet
said `@v0.7.2` again. A manual "bump pins after tag" checklist item is exactly
the kind of step that gets forgotten.

## Fixed

- `scripts/bump-doc-pins.mjs`: rewrites `wookat/agentgate/packages/action@vX.Y.Z`
  and `rev: vX.Y.Z` across both READMEs, the action README,
  `.pre-commit-hooks.yaml`, and the website deps doc to the current
  `packages/cli` version.
- The changesets version PR now runs it: `release.yml` passes
  `version: pnpm version-packages`, a new root script
  (`changeset version && node scripts/bump-doc-pins.mjs`) — so every future
  version PR carries the matching doc-pin bump for the tag it will create.
- One-time catch-up in this PR: pins v0.7.2 → v0.8.0 (script output).

## Routine sweeps (this round)

- Advisory watch (authenticated, 8-day window): no uncovered MCP advisories.
- Competitors: socket 1.1.154 / mcp-scan 0.4.3 / osv-scanner v2.4.0 —
  unchanged since round 34.
- v0.8.0 clean-env regression passed (see round report): advisory check
  affected/fixed/pypi paths, list, offline bundled fallback.

## Honest limits

- The pin automation is only exercised for real on the next version PR; until
  then it's verified by running the script locally (idempotent, exact-match
  regexes only).
