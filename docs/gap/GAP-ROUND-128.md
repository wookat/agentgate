# GAP-ROUND-128 — config convert supports Amazon Q

Date: 2026-08-07 · Round type: coverage completion + routine sweep

## Gap

Rounds 126/127 added Amazon Q discovery + rules scanning, but
`config convert` (the migration path onto/off a newly covered client)
still didn't list `amazonq` — same follow-up shape as Trae (round 117
added both together; Amazon Q's landed split across rounds).

## What shipped

- `amazonq` adapter: standard `mcpServers` notation, default path
  project `.amazonq/mcp.json` (AWS docs; `~/.aws/amazonq/mcp.json`
  global). Because the CLI resolves the source default via discovery,
  `--from amazonq` picks up project or home config automatically.
- Round-trip test (cursor → amazonq → parse) + docs client lists.

## Deliberately NOT added

- `default.json` / `cli-agents/*.json` as convert *targets*: those are
  full agent configs (tools, resources, permissions) — writing one from
  a bare server list would emit an incomplete agent. Convert targets the
  plain mcp.json only.

## Routine sweep (this round)

- advisory watch: no uncovered MCP-related advisories.
- Competitors: thynkQ mcp-scan still 2.0.2, socket 1.1.154 — no movement.

## Evidence

- Full suite green: core 207, cli 47, config-convert 24.
