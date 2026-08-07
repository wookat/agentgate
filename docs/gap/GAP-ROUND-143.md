# GAP-ROUND-143 — Gemini CLI project settings

Date: 2026-08-07 · Round type: overprivilege coverage (Gemini CLI)

## Source (official)

gemini-cli docs (docs/reference/configuration.md, docs/tools/shell.md):

- `tools.allowed` — "Tool names that bypass the confirmation dialog";
  scoping uses `run_shell_command(git)` syntax; "Including the generic
  `run_shell_command` acts as a wildcard, allowing any command not
  explicitly blocked."
- `general.defaultApprovalMode` — `auto_edit` auto-approves edit tools;
  YOLO mode is CLI-flag-only (cannot be set in settings).

## Gap

`.gemini/` was already walked (commands TOML since round-62, GEMINI.md
since round-123) but the project `settings.json` — the same checked-in
pre-approval surface covered for Claude (134–138), OpenCode (141–142) —
was not inspected.

## What shipped

- AG-SK-002 checks project `.gemini/settings.json`:
  - `tools.allowed` entries: bare `run_shell_command` → high;
    `write_file`/`replace`, `web_fetch`/`google_web_search` → medium;
    scoped `run_shell_command(...)` grants clean.
  - `general.defaultApprovalMode: "auto_edit"` → medium.

## Honest boundaries

- `tools.core` restricts what the model may request (still prompts) —
  not flagged; only the confirmation-bypassing `tools.allowed` is.
- YOLO mode can't be committed via settings — nothing to flag.
- User-level `~/.gemini/settings.json` is outside the project tree.
- Legacy flat settings names (pre-v1 `autoAccept`, `coreTools`) are not
  handled; current docs only define the nested schema.

## Evidence

- Full suite green: core 218, cli 47, config-convert 24.
- Self-scan unchanged (17 findings).
