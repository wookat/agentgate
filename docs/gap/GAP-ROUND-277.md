# GAP-ROUND-277 — large-scale precision sweep of the Cursor environment.json surface (round 275)

## Corpus

Round 275 shipped the `.cursor/environment.json` surface validated on 60 of
298 candidate repos. This round completed the corpus: all 298 repos cloned,
**296 real `.cursor/environment.json` files** scanned (2 repos had the path
only in nested fixtures).

## Results

- **18 repos flagged, 18/18 true positives** — every hit is an `install`
  command piping a remote installer script into a shell at Build creation
  (bun.sh, deno.land, volta.sh installers; incl. getsentry/sentry-javascript,
  AnswerOverflow). Same policy as rounds 257/275: unpinned mutable remote
  code executed automatically → critical (rug-pull vector).
- **278 benign files, 0 false positives** — ordinary `npm/pnpm/bun install`,
  dev servers in `terminals`, `sudo service docker start` etc. stay quiet.
  The round-275 `.env.example` scaffolding fix held across the corpus
  (multiple repos use the `cp .env.example .env.local` idiom).

## Fix shipped: duplicate finding noise

Every one of the 18 flagged repos produced **two findings for the same
line**: the dedicated AG-SK-003 critical (naming the config key) plus the
generic AG-RC-001 medium "Text contains a curl|sh pattern — … usually
documentation" from the text scanner. The same duplication existed on
`.cursor/hooks.json`. Round 275 left this coexistence as an open decision;
with 18/18 corpus evidence that the generic hit is always a strictly worse
duplicate, `checkSource` now skips the curl|sh text warning for the two
Cursor command surfaces (`CURSOR_COMMAND_SURFACE_FILE`). The dedicated
AG-SK-003 classifier covers the same remote-exec idioms, so no signal is
lost; a curl|sh string in a non-command field is exactly the documentation
case the medium finding hedged about.

Regression tests pin both surfaces: dangerous fixture → AG-SK-003 only,
zero AG-RC-001.

## Boundary (unchanged)

Other named AG-SK-003 surfaces (Claude settings, Kiro/Codex/Copilot hooks,
VS Code tasks…) show the same duplication pattern in principle but were not
changed this round — each needs its own corpus evidence before suppressing
the generic warning there.
