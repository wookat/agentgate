# GAP-ROUND-279 — named-command-surface dedupe sweep (round-277 boundary closeout)

## Method

Round 277 suppressed the generic AG-RC-001 curl|sh text warning on the two
Cursor command surfaces and left the other named AG-SK-003 surfaces as an
explicit boundary pending corpus evidence. This round re-scanned all seven
retained corpora (r248/r249/r258/r265/r266/r268/r269, ~800 repos total)
looking for files where AG-SK-003 and AG-RC-001 both fire.

## Evidence

Exactly one wild duplicate pair: `PaulKinlan/Co-do` `.claude/settings.json`
— a SessionStart hook running `command -v deno || curl -fsSL
https://deno.land/install.sh | sh`. AG-SK-003 reports it critical with the
Claude hook semantics; AG-RC-001 added a medium "usually documentation"
warning on the same line. No duplicates surfaced for Kiro/Codex/Copilot/
Factory/Antigravity hooks, VS Code tasks, Amazon Q agents, Crush configs,
or plugin hook files in these corpora.

## Fix

`CURSOR_COMMAND_SURFACE_FILE` generalized to
`DEDICATED_COMMAND_SURFACE_FILE`, now also matching
`.claude/settings(.local)?.json`. Surfaces without wild evidence stay
unchanged (same policy as round 277: suppress only where duplication is
demonstrated). Regression test extends the Claude hook fixture to assert
zero AG-RC-001; the generic medium warning for unrelated non-executable
files is still pinned by `rules-branches.test.ts`.

## Honest numbers

- Corpora scanned: 7 directories, ~800 repos, full `scanRepo` per repo.
- Duplicate pairs found: 1 (Claude settings); Cursor surfaces already
  deduped by round 277.
- After fix: the Co-do repo reports the hook once (AG-SK-003 critical).
