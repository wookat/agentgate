# GAP-ROUND-372 — example-marked-key curl|sh text warnings (+ clean windows)

Date: 2026-08-04

## Routine windows

- Advisory watch (authenticated): zero uncovered. OSV npm/PyPI export ETags
  unchanged vs the r369 snapshot (e31fe9a2… / de189c70…).
- Nine-client version window: unchanged (Claude Code v2.1.226, Gemini CLI
  v0.54.4, Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code
  v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52).

## r371 residual-medium sweep → one narrow precision class

r371 medium classes re-verified on the post-#545 build: AG-SK-002 (905,
rule-semantic true positives — `allowed-tools: Bash` pre-approvals sampled),
AG-SC-001/SC-003/AM-001 (correct), AG-RC-001 dynamic-exec mediums (correct —
real `exec`/`execSync` in plugin servers). The AG-RC-001 curl|sh text mediums
were inspected one by one; most are correctly medium (installer fallback
strings, adapter `install_command` docs, security-guard docstrings and
pattern tables quoting the idiom — the "confirm it is never executed" wording
fits). One class is strictly documentation: the match sitting **in the value
of an example-marked key** — a linter KB's `"bad_example": "… curl … | sh …"`
payload (agnix ×2) and a glossary's `"examples": ["curl | bash", …]` array
(FISCFED9 ×4 skill-tree copies). Same compound-example-key marker the
AG-CL-001 side gained in r371, applied to the non-executable text-warning
tier: grades low with example-specific wording. Executable files are
untouched (an `# example:` comment can never downgrade a live pipeline —
regression pinned).

## Head-to-head (seven corpora vs post-#545 outputs)

Zero removed, zero added; exactly 6 monotone medium→low changes, all the two
hand-verified example-key sites above. r353/r356/r359/r363/r368 byte-identical.

## Validation

Full suite green (558 tests), lint/typecheck clean, `git diff --check` clean.
