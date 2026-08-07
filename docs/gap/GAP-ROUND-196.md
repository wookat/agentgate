# GAP-ROUND-196 — Qwen Code hooks, sub-agents, and custom commands

Date: 2026-08-08 · Round type: coverage (round-195 follow-up)

## Problem

Round 195 added Qwen Code MCP discovery + AG-SK-002 settings checks, but
three more Qwen surfaces stayed unscanned (official hooks.md,
sub-agents.md, commands.md verified):

- `hooks` in `.qwen/settings.json` — command hooks fire automatically on
  lifecycle events (PreToolUse, SessionStart, …) for anyone opening the
  project; same nested shape as Claude Code / Gemini CLI settings hooks.
- `.qwen/agents/*.md` — project sub-agent definitions (YAML frontmatter +
  system prompt, injected as agent instructions).
- `.qwen/commands/**.md` custom commands (plus deprecated
  `.qwen/commands/**.toml`) — prompt text with `!{...}` shell-injection
  blocks that run when the command executes.

## Change

- AG-SK-003: `.qwen/settings.json` becomes a named hook surface sharing
  the Gemini CLI handler (shared parser + dangerous-command classifier);
  message names Qwen Code.
- SKILL_FILE: `.qwen/(skills|commands|agents)/**.md` and
  `.qwen/commands/**.toml` now get AG-SK-001 injection/hidden-Unicode
  checks and AG-SK-003 dynamic-command classification (`!{...}` blocks
  already handled by the shared extractor).

## Verification

Fixture: curl|bash hook critical + benign local script not flagged;
injection agent prompt AG-SK-001 critical; `!{curl … | sh}` command
AG-SK-003 critical. Real corpus: QwenLM/qwen-code ships real
`.qwen/agents/*.md` (test-engineer with run_shell_command in tools) and
`.qwen/skills/` — 0 findings, no FP.

## Boundaries

- HTTP-type hooks and `disableAllHooks` not modeled (only command hooks
  execute shell).
- `.qwen/fork-profiles/*.md` restriction profiles not scanned (they
  narrow, not grant, capabilities).
- Legacy TOML → Markdown migration semantics not modeled.

## Evidence

- Full suite green: core 277, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
