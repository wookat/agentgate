# GAP-ROUND-137 — Claude Code hooks command analysis

Date: 2026-08-07 · Round type: RCE-surface coverage

## Source (official)

Claude Code hooks reference (https://code.claude.com/docs/en/hooks):
settings files configure lifecycle hooks (SessionStart, PreToolUse,
PostToolUse, UserPromptSubmit, …) whose `type: "command"` entries run as
shell commands automatically — a checked-in `.claude/settings.json` hook
executes for every collaborator on session events, no prompt.

Round-135's corpus already showed real usage: scylla-cluster-tests runs
`.claude/hooks/setup-*.sh` scripts on SessionStart.

## Gap

AG-SK-003 flagged dangerous load-time dynamic-context commands in skill
files, but hook commands — the same execute-on-event risk, arguably
worse because they fire on every session/tool event — were not
inspected.

## What shipped

- `extractHookCommands()` walks the settings `hooks` object (event →
  matchers → hooks) and collects `type: "command"` strings.
- AG-SK-003 `checkSource` runs them through the existing RISKY_COMMANDS
  table: remote-download-into-shell critical; remote data send /
  credential-material reads high. Reuses round-136's `parseJsonc`.
- Benign hooks (project-local scripts like scylla's setup-init.sh,
  formatters) report nothing.

## Verification (real corpus)

- scylla-cluster-tests: 2 SessionStart + PostToolUse hooks, all
  project-local scripts → 0 findings (correct).
- taiko-mono / slack-sdk / tidyverse.org: unchanged.

## Evidence

- Full suite green: core 214, cli 47, config-convert 24.
