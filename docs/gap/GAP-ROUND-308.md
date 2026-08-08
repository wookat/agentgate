# GAP-ROUND-308 — Malware-sweep channel muting respects version-bounded records

## Why this round

New-surface check first: no new repo-carried scannable surface in the current
client window (Claude Code 2.1.226, Codex 0.147, Gemini CLI 0.54.4, Copilot
CLI 1.0.78, opencode 1.18.15 — all already covered or unchanged since rounds
299/305). So this round closes the boundary recorded in GAP-ROUND-307:

> The malware sweep excludes any package channel already tracked in the MCPA
> database. If a tracked channel ships a *new* malicious version under a new
> GHSA id, the alias check will not catch it and the channel exclusion hides
> it.

That muting is correct for full-line records (`introduced: "0"` with no
`fixed`/`last_affected` — any future version is already covered), but wrong
for version-bounded records: e.g. MCPA-2026-0081 covers claude-remote-agent
only at 0.1.0–0.2.0 because 0.3.0+ verifiably removed the hardcoded relay. If
that channel later ships a new malicious version under a fresh GHSA id, the
old behavior would silently hide it.

## What changed

- `buildContext()` now also derives `openEndedTracked`: the set of
  `ecosystem:name` channels where at least one MCPA range has neither `fixed`
  nor `last_affected`.
- `filterMalware()` mutes a candidate only when **every** affected package
  channel is open-ended-tracked; version-bounded channels stay visible for
  triage.
- Tests: fixture DB gains a version-bounded `bounded-agent` record; a fresh
  malware id on that channel must survive the filter, while `known-pkg`
  (open-ended) stays muted. `buildContext` assertions pin the new set. 24 API
  tests green.

## Real-window verification

`--dry-run` over the live window is still clean after the change: the
version-bounded records currently in the DB (claude-remote-agent,
code-analyzer-mcp, claude-token-tracker-mcp) have their existing GHSA ids
recorded as aliases, so id-level dedupe already mutes the *known* advisories —
only genuinely new ids on those channels would now surface, which is exactly
the intent.

## Boundaries

- GHSA/OSV sometimes bump the same campaign under a new id without a new
  version; those will now resurface for version-bounded channels and need a
  manual alias addition to the MCPA record — acceptable triage cost.
- No published-package behavior changed (watch script only), so no changeset.
