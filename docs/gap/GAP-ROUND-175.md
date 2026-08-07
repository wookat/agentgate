# GAP-ROUND-175 — Codex inline [hooks] tables in config.toml

Date: 2026-08-08 · Round type: coverage completion (auto-executing hooks)

## Surface

Round-174 boundary. Official hooks docs: hook sources include "inline
`[hooks]` tables inside `config.toml`" with the same event schema as
hooks.json; if a layer has both, hooks.json wins for that layer. A repo
could therefore hide a dangerous lifecycle hook in `.codex/config.toml`
and evade the round-174 hooks.json check.

## Change

AG-SK-003 checkSource for `.codex/config.toml`: parse TOML (smol-toml,
`[[hooks.Event]]` / `[[hooks.Event.hooks]]` arrays parse to the exact
nested shape of hooks.json), reuse `extractHookCommands` +
`RISKY_COMMANDS`. AG-SK-002's round-173 sandbox-key check on the same
file is unaffected (different rule, both run).

## Real corpus

10 repo scans (r173 + r174 corpora, all with checked-in .codex config or
hooks): 0 inline-hook findings — none of them declare inline [hooks]
with risky commands (rulesync/gf configs have no [hooks] at all).
True positive covered by unit fixture (inline curl|bash → critical,
local policy script clean).

## Boundaries

- `command_windows`/`commandWindows` overrides still not separately
  classified (carried from round 174).
- Named profile tables (`profiles.<name>.*`) not walked (carried from
  round 173).

## Evidence

- Full suite green: core 249, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
