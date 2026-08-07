# GAP-ROUND-164 — Cursor project hooks command actions (AG-SK-003)

Date: 2026-08-08 · Round type: coverage gap (official-docs-verified)

## Gap

Cursor hooks (official docs, cursor.com/docs/agent/hooks): "Define
hooks in `hooks.json` files at the project or user level … They run
before or after defined stages of the agent loop" — sessionStart,
beforeShellExecution, beforeMCPExecution, afterFileEdit, stop, ….
Project hooks (`.cursor/hooks.json`) are checked in, run from the
project root, and cloud agents "pick them up and run them during
their work". Same auto-execution family as Claude/Kiro/Amazon Q hooks
(rounds 137/161/162), but the file's commands were not analyzed.

## Change

`AG-SK-003.checkSource` handles `.cursor/hooks.json`: the flat
`{ event: [{ command }] }` shape (same as Amazon Q agent hooks) is
extracted and classified with the shared RISKY_COMMANDS classifier —
remote-script pipes critical; exfiltration/credential/.env reads
high. Prompt-based hooks (`prompt` key) are not commands and are not
flagged.

## Real corpus (4 flagship repos with checked-in .cursor/hooks.json)

- Homebrew/brew — style/typecheck/tests hooks: clean (correct).
- actualbudget/actual — guard-shell/before-mcp guard scripts: clean
  (correct — protective hooks).
- Khan/perseus — token-init/install/filter scripts via /bin/sh: clean
  (correct).
- BasedHardware/omi — clean.
- GitHub code search: 1,460 `.cursor/hooks.json` files; 878 files
  mention beforeShellExecution — the surface is widespread.

## Honest boundaries

- No public malicious `.cursor/hooks.json` found in this sweep; true
  positives covered by fixtures on the shared classifier (rounds
  137/161 have corpus true positives, and round-163's PureEvilRepo
  demonstrates the same family).
- Hook commands that invoke project-local scripts (`./x.sh`) are not
  followed into the script body here — script contents are already
  source-scanned by the generic rules when checked in.
- User-level `~/.cursor/hooks.json` is outside the repo and
  intentionally not scanned.

## Routine checks

- Advisory watch: no uncovered public MCP advisories in this sweep.
- Competitors: no relevant capability movement observed.

## Evidence

- Full suite green: core 238, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
