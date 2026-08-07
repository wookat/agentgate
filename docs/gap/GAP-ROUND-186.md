# GAP-ROUND-186 — Plugin monitor commands classified

Date: 2026-08-08 · Round type: coverage completion (round-185 boundary)

## Surface

Official plugins reference: plugins can declare background monitors in
`monitors/monitors.json` (JSON array of `{ name, command, description }`)
or inline in the manifest (`experimental.monitors`, with the top-level
`monitors` key still loading during the schema migration). Claude Code
starts each monitor command automatically when the plugin is active and
keeps it running for the whole session, unsandboxed at the same trust
level as hooks — a persistent auto-exec surface.

## Change

AG-SK-003 classifies plugin monitor commands through the shared
dangerous-command classifier (remote-script pipes critical, credential
reads / exfiltration high). Covered: `monitors/monitors.json` files and
both inline manifest keys. Benign watchers (`tail -F ./logs/error.log`,
`${CLAUDE_PLUGIN_ROOT}` scripts) stay clean.

## Real corpus (10 repos, unmodified)

0 monitor findings across the round-181 corpus and round-176 flagship set
(monitors are new and experimental; no in-the-wild dangerous usage found).
True positives covered by unit fixtures (monitors.json exfiltration high +
inline manifest dropper critical).

## Boundaries

- `experimental.monitors` as a relative config path string
  (`"./config/monitors.json"`) is not resolved; only the conventional
  `monitors/monitors.json` location and inline arrays are checked.
- `when: "on-skill-invoke:<skill>"` gating is not modeled (severity is the
  same regardless of start trigger).

## Evidence

- Full suite green: core 265, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
