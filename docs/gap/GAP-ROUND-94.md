# GAP-ROUND-94 — triage commands for GHSA-mirrored OSV hits + wild FP sweeps

Date: 2026-08-07

## Gap

Round-88 gave the weekly advisory-watch issue ready-to-run
`--draft GHSA-…` commands, but only for the GHSA sweep section. OSV hits
(new advisories on packages MCPA already tracks) got a bare link — even
though npm/PyPI OSV ids are usually GHSA mirrors, so the exact same
`--draft` flow applies. A triager landing on an OSV-only issue had to
hand-assemble the command.

## Fix

`renderReport` now collects draft-able ids from *both* sections: all GHSA
sweep hits plus any OSV hit whose id is GHSA-shaped. Non-GHSA ids
(e.g. `PYSEC-…`) still render without a triage command, and the Triage
section disappears only when no hit has a GHSA id.

## Evidence

- api tests 22/22 green, including the two new cases (GHSA-mirrored OSV
  hit → triage command present; PYSEC-only → no triage section).

## Real-world FP sweeps (this round)

- `modelcontextprotocol/servers` (official repo, 94 files, 0.16s):
  1 finding — AG-AM-001 medium on their own `.mcp.json` remote server
  without an auth header. Accurate, not an FP.
- `anthropics/skills` (official Anthropic skills, 18 SKILL.md, 91 files,
  0.16s): 0 findings. No FPs from AG-SK-001/002/003 or the round-92
  includeTools check (none of these skills declare MCP servers).

## Still open (honest)

- OSV hits that are genuinely new advisories for an already-tracked
  package may warrant a *range update* to the existing MCPA entry rather
  than a new entry; the draft flow always proposes a new entry and the
  human triager must decide.
- `includeTools` globs still not correlated against live tool surfaces.
