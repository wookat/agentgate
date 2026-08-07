# GAP-ROUND-148 — Zed agent tool permissions

Date: 2026-08-07 · Round type: overprivilege coverage (Zed) + routine sweep

## Source (official)

zed.dev docs `ai/tool-permissions.md`: "In Zed v0.224.0 and above, tool
approval is controlled by `agent.tool_permissions.default`. In earlier
versions, it was controlled by the `agent.always_allow_tool_actions`
boolean (default false)." `default: "allow"` auto-runs any tool action
without a matching deny/confirm rule; per-tool `default` overrides it.
Project `.zed/settings.json` is checked into repos, so these settings
apply to anyone opening the project.

## Gap

Zed MCP config discovery landed in round-73, but its agent permission
surface was never scanned. GitHub code search: 16 checked-in
`.zed/settings.json` files with `always_allow_tool_actions`, 40 with
`tool_permissions`.

## What shipped

- `.zed` walked for `settings.json` only (round-146 settings-only
  pattern; debug/task configs are not MCP source).
- `agent.always_allow_tool_actions: true` → high.
- `agent.tool_permissions.default: "allow"` → high.
- Per-tool `default: "allow"` → high for `terminal`, medium for
  `edit_file`/`write_file`/`delete_path`/`move_path`/`fetch`.
- `always_allow` regex rules under a `confirm` default are not flagged
  (scoped approvals are the recommended safe pattern).

## Corpus verification (3 repos with real .zed/settings.json)

- madeindigio/remembrances-mcp: `always_allow_tool_actions: true` →
  1 high (true positive).
- monerium/js-monorepo, fadiatamny/rice-config: explicit `false` →
  0 findings (no FP).

## Routine sweep

- Advisory watch (local run): no uncovered MCP-related advisories;
  feed/API/local all consistent at 31.
- Competitors: mcp-scan npm 2.0.2 unchanged, socket 1.1.155 (patch),
  invariant mcp-scan PyPI 0.4.3 — no capability movement.

## Honest boundaries

- `always_deny`/`always_confirm` interplay is not simulated; we judge
  defaults only, not rule chains.
- MCP tool ids (`mcp:<server>:<tool>`) in per-tool configs are not
  risk-classified (no static signal beyond the name; candidate).

## Evidence

- Full suite green: core 223, cli 47, config-convert 24.
- Self-scan unchanged (17 findings).
