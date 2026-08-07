# GAP-ROUND-116 — LM Studio real on-disk config path (`~/.cache/lm-studio`)

Date: 2026-08-07 · Round type: coverage correction (follow-up to round 115)

## Gap found (real user reports)

Round 115 implemented the officially documented LM Studio path
(`~/.lmstudio/mcp.json`). Two independent bug reports on
lmstudio-ai/lmstudio-bug-tracker show current builds actually persist the
file elsewhere:

- #1371 (macOS, LM Studio 0.3.33): `~/.lmstudio/` "does not even exist";
  the live file is `~/.cache/lm-studio/mcp.json`.
- #1813 (Windows, 0.4.1.1): user edits land in
  `C:\Users\<user>\.cache\lm-studio\mcp.json`.

So scanning only the documented path would miss most real LM Studio
installs.

## What shipped

- Discovery: second `lmstudio` location `~/.cache/lm-studio/mcp.json`
  (all platforms — Windows reports confirm the same `.cache` layout).
  The documented `~/.lmstudio` path is kept first; scannedFiles dedupe
  (round 87) means an install with both never double-counts servers
  from a single file.
- Test updated: both locations expected on linux and win32.

## Not claimed

- No LM Studio install was run locally; the `.cache` path is sourced
  from the two public bug reports above, not first-hand observation.
  If LM Studio fixes the bug and honors `~/.lmstudio`, both paths stay
  correct (nonexistent files are skipped silently).

## Routine sweep (this round)

- advisory watch: no uncovered MCP-related advisories (run in round 115,
  ~30 min ago).
- Version PR #196 (0.24.0) green and reported for merge/publish.
