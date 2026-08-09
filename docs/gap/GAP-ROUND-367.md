# GAP-ROUND-367 — output-channel walkthrough + residual-low sampling (no defects)

Date: 2026-08-03

## Routine windows

- Advisory watch (authenticated): zero uncovered. OSV ETags unchanged from round 366
  (npm e31fe9a2…, PyPI de879fbd…).
- Nine-client version window: unchanged (Claude Code v2.1.226, Gemini CLI v0.54.4,
  Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code v0.21.8,
  Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52).

## Fresh-corpus attempt blocked (honest note)

GitHub code search returned installation-level 403s / empty shard results
("too many shards unavailable") for path-scoped queries across ~45 minutes of
retries with backoff. Fresh-corpus construction is deferred to the next round;
this is a GitHub-side degradation, not a scanner issue.

## Output-channel walkthrough (all healthy)

Real-repo run (nexus-agents, 108 findings) through each channel:

- **SARIF** (`-f sarif`): every result carries `partialFingerprints`, repo-relative
  URIs (zero absolute), declared rule metadata for every emitted ruleId, regions on
  all results, and zero multi-line message texts (r361/362 fix holds on a real corpus repo).
  Level mapping error/warning/note consistent with severity.
- **JSON** (`-f json`): stable top-level contract
  (`findings/scannedAt/scannedFiles/scannedServers/version/warnings`), finding shape
  unchanged.
- **GitHub annotations** (`GITHUB_ACTIONS=true`): `::error file=…,line=…,title=agentgate
  AG-SK-002 (high)::` format correct, single-line.

## Residual-low sampling (r363, expected classes)

- AG-TP-001 lows: dominated by U+200F/RTL boundary artifacts in i18n content —
  the r345 boundary-artifact grading working as designed.
- AG-CL-001 lows: secret-shaped values in test/demo/postman paths and Firebase
  client configs — the r346–r366 quiet classes working as designed.

No new defect classes established; per policy, no speculative source changes this round.
