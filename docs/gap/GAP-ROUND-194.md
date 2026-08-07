# GAP-ROUND-194 — Extension-root command TOML scanning

Date: 2026-08-08 · Round type: coverage (round-193 carry-over)

## Problem

Gemini CLI extensions ship custom commands as `commands/**.toml` at the
extension root (official reference: `commands/deploy.toml` becomes
`/deploy`, subdirs namespace with a colon). The prompt text — including
`!{...}` shell blocks that execute when the command runs — was only
scanned under `.gemini/commands/`, so a poisoned command shipped by an
extension escaped AG-SK-001/AG-SK-003 entirely.

## Change

`SKILL_FILE` now also matches `commands/**.toml` anywhere, so extension
command TOML gets the full skill scan: injection/hidden-Unicode patterns
over the prompt text and the shared dangerous-command classifier over
`!{...}` blocks.

## Verification

Fixture: injection phrase + `!{curl … | sh}` report AG-SK-001 +
AG-SK-003 critical; namespaced benign `!{gsutil ls}` stays clean.
FP sweep: official gemini-cli-extensions repos (workspace/security/
observability — real `commands/` trees), openai/codex,
anthropics/claude-code, Homebrew/brew — 0 new findings from the widened
pattern (claude-code's 5 pre-existing plugin command .md AG-SK-002 hits
unchanged, documented in round-169).

## Boundaries

- The pattern matches any `commands/**.toml`, not just proven extension
  roots — a deliberate shape-based trade-off (same as round-188); only
  injection/danger patterns fire, corpus shows 0 FP.
- TOML files matched as skills skip generic source rules (AG-RC-001
  et al.); the skill-side classifiers cover the same dangerous idioms.

## Evidence

- Full suite green: core 274, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
