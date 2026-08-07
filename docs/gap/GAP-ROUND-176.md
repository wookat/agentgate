# GAP-ROUND-176 — Flagship FP sweep of rounds 171-175 surfaces

Date: 2026-08-08 · Round type: precision (false-positive sweep)

## Corpus

5 flagship repos with real .codex/.kiro layers: openai/codex (6,079
files), Khan/perseus (5,672, incl. .codex/config.toml + hooks.json),
dlt-hub/dlt (2,173, .codex/hooks.json), rsyslog/rsyslog (4,844),
wordpress-mobile/WordPress-iOS (6,356).

## Results

- Rounds 171-175 surfaces: 0 findings across all 5 repos — Kiro hooks,
  Codex config sandbox keys, hooks.json, inline [hooks] all correctly
  clean (perseus ships a safe workspace-write/on-request config with a
  scoped network-domain allowlist — exactly the shape we must not flag).
- Two real FPs caught in other rules and fixed:
  1. AG-RC-001 critical on dlt `tests/load/dremio/bootstrap/bootstrap_dremio.sh`:
     the curl|sh regex's `[^|;&]*` spanned plain newlines, attributing a
     later `echo "$output" | python` to an earlier unrelated curl. Fixed:
     span may cross newlines only via backslash continuations. Same bug
     class as the round-159 multi-line exfiltration fix.
  2. AG-SK-001 critical on openai/codex `plugin-creator/SKILL.md`:
     "Do not tell the user to run `codex plugin marketplace add` ..." is
     phrasing guidance, not concealment. Fixed with a `(?!\s+to\s)`
     lookahead; "do not tell the user (about this/that ...)" still reports.

## Remaining hits verified as correct

- dlt `requirements.py` medium: real curl|sh string inside a help
  message in a non-executable file — the informational "confirm it is
  never executed" finding is the intended semantics.
- perseus AG-AM-001/AG-TP-001 hits: unpinned MCP server + test-data
  low-severity markers, per existing rule semantics.

## Boundaries

- A genuinely malicious multi-line pipe without backslash continuations
  (e.g. command substitution split across statements) is not attributed;
  single-line and continuation forms still report.
- "do not tell the user to reveal/read ..." now unflagged as concealment;
  exfiltration-shaped instructions remain covered by the exfiltration
  pattern.

## Evidence

- Full suite green: core 252, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
