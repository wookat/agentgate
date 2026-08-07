# GAP-ROUND-177 — Codex Windows-only hook command overrides

Date: 2026-08-08 · Round type: coverage completion (auto-executing hooks)

## Surface

Rounds 174/175 boundary. Official Codex hooks docs: "`commandWindows` is
an optional Windows-only command override. In TOML, use `command_windows`
or `commandWindows`." A hook could ship a benign `command` plus a
dangerous Windows override and evade classification on the platform where
it actually fires.

## Change

`extractHookCommands` (shared by Codex hooks.json, inline [hooks], and
Claude Code settings hooks) now also collects `commandWindows` /
`command_windows` strings from `type: "command"` handlers; the shared
RISKY_COMMANDS classification applies unchanged.

## Real corpus

10 repo scans (r174 + r176 corpora): AG-SK-003 still 0 everywhere — no
in-the-wild Windows overrides with risky commands observed. True positive
covered by unit fixture (benign command + curl|bash commandWindows →
critical).

## Boundaries

- PowerShell-specific download-and-execute idioms (`irm … | iex`,
  `Invoke-WebRequest`) are not yet modeled by RISKY_COMMANDS — the fixture
  triggers via curl|bash; a pure-PowerShell payload would be missed.
  Recorded as the follow-up candidate.

## Evidence

- Full suite green: core 250, cli 47, config-convert 24 (branch off main
  before round-176 merges; its 3 tests land separately).
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
