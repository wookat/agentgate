# GAP-ROUND-369 — comment-only curl|sh grading (+ clean windows)

Date: 2026-08-04

## Routine windows

- Advisory watch (authenticated): zero uncovered. OSV npm ETag unchanged
  (e31fe9a2…); PyPI ETag changed (de189c70…) but the full MAL id diff vs the
  r365 snapshot is additions-only with zero MCP-related new ids.
- Nine-client version window: unchanged (Claude Code v2.1.226, Gemini CLI
  v0.54.4, Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code
  v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52).

## r368 residual-medium sweep → one message/severity defect

r368 medium classes: AG-SK-002 (287, rule-semantics true), AG-SC-003 (advisory
matches, correct), AG-AM-001 (remote servers without auth, correct), AG-SC-001
(unpinned specs, correct). The AG-RC-001 mediums (37) were dominated by one
class: after the r368 heredoc/inline-program masking, the only remaining match
in many installer scripts is the script's own `#   curl … | sh` usage comment —
reported medium with the wording "in a non-executable file", which is both
inflated (a commented line never executes; live matches already take
precedence since r199) and wrong about the file type.

Fix: a comment-only match in an executable-type file now grades **low** with
comment-specific wording. The r199 regression test encoded the old medium and
was updated to the new deliberate semantics (evil.sh live match stays critical,
quoted-heredoc usage.sh stays silent).

## Head-to-head (six corpora vs r368 outputs)

Zero removed, zero added; exactly 83 monotone changes, all AG-RC-001
comment-only lines (severity medium→low and/or message text), sampled and
hand-verified (installer usage headers, hook-guard doc comments, commented-out
install lines in ansible tasks). No other rule affected.
