# GAP Report — Round 58 (v0.13.1 release verification + FN found in it)

## v0.13.1 clean-environment regression (real runs, /tmp/clean0131)

- `npx -y mcp-agentgate@0.13.1` installs and runs (no `workspace:*` deps).
- `GITHUB_ACTIONS=true` scan emits annotations (`::error file=cfg.json,line=1,…`
  for AG-CL-001; `::notice` for low AG-SK-001), JSON output stays clean and
  parseable; `deps --offline` emits `::error … AG-DP-002` for `lodahs`.
- AG-SK-001 code-block downgrade works: fenced example reports `low`.

## FN found during that regression

A skill file containing *both* a fenced-code example of an injection string
*and* a real injection in prose reported only one `low` finding. Cause:
AG-SK-001 used `content.match(re)` — first match per pattern only — so an
early code-block example masked the later prose injection entirely. A
malicious skill could hide behind a "guardrails example" block placed above
its payload.

## Fix

Inspect **all** matches per pattern (`matchAll`); a match outside fenced code
(`critical`) is preferred over a quoted example (`low`). Still one finding
per pattern. Regression test: example block at line 4 + prose injection at
line 7 → single `critical` finding at line 7.

## Verified

- New core test green; full checks green (build, lint, typecheck,
  156 core + 36 cli + 12 convert).
- Real marketplace FPs from round 55 re-checked: still `low` (no prose match
  in those files).
