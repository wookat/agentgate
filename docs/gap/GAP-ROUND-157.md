# GAP-ROUND-157 — Zed mcp:<server>:<tool> allow classification

Date: 2026-08-08 · Round type: overprivilege coverage (round-148 candidate)

## Source (official)

zed.dev/docs/ai/tool-permissions: MCP tools are keyed
`mcp:<server>:<tool_name>` inside `agent.tool_permissions.tools`, with
per-tool `default` of `confirm`/`allow`/`deny`. Round 148 covered the
built-in tools but recorded MCP tool ids as an unclassified candidate.

## What shipped

`mcp:*` keys with `default: "allow"` report medium when the tool-name
segment matches the destructive-name heuristic shared with the Roo
auto-approve check (round 145): exec/shell/command/terminal/run_/sql/
migrat/write/delete/remove/drop/deploy/fetch_url. Read-only-named MCP
allows are intentionally not flagged — the rug-pull vector (a benign
name whose behavior changes upstream) is what the tool-surface
lockfile gates.

## Corpus (4 real repos with .zed/settings.json tool_permissions)

- VMAFx/vmafx: `mcp:vmaf-mcp:vmaf_score` / `list_models` /
  `list_backends` allowed under a `confirm` default → 0 findings from
  the new path (read-only names; correct).
- bbplayer-app/BBPlayer, goldjunge91/fam, kessenma/PocketDev: global
  `default: "allow"` → already high since round 148; no new findings.
- No public corpus hit allows a destructive-named MCP tool; the check
  is a tripwire verified by fixtures (execute_sql → medium,
  list_models / create_issue-confirm → clean).

Setup note: research-only clones (no commits); hook configs noted but
not installed.

## Honest boundaries

- Same name-heuristic error bars as round 145: benign tools with
  destructive-sounding names can report medium, and a malicious tool
  with an innocuous name escapes — static names are the only signal.
- `always_allow` regex patterns on mcp: keys are not risk-classified
  (patterns match tool inputs, not names).

## Evidence

- Full suite green: core 230, cli 47, config-convert 24.
- Self-scan: 17 findings (13 medium, 4 low) unchanged.
