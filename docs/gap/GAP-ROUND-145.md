# GAP-ROUND-145 — Roo Code auto-approved MCP tools

Date: 2026-08-07 · Round type: overprivilege coverage (Roo Code)

## Source (official)

docs.roocode.com (Using MCP in Roo): per-server `alwaysAllow` — "an
array of tool names from this server to automatically approve". The
project-level `.roo/mcp.json` is checked in, so approvals apply to
everyone opening the project. Real files also use the `autoApprove`
spelling (Cline lineage); both are read.

## Gap

`.roo/mcp.json` was already discovered as an MCP config (round-73) and
`.roo/rules` scanned (round-122), but the auto-approval lists — the
same checked-in pre-approval class as Claude `permissions.allow`
(134), OpenCode `permission` (141–142), and Gemini `tools.allowed`/
`trust` (143–144) — were ignored.

## What shipped

- AG-SK-002 checks `.roo/mcp.json` per server:
  - wildcard `"*"` in `alwaysAllow`/`autoApprove` → high;
  - auto-approved tools with destructive-looking names
    (exec/shell/command/run_/sql/migration/write/delete/remove/drop/
    deploy/fetch_url) → medium, tools named in the message.

## Corpus verification (GitHub code search: ~327 `.roo/mcp.json` files mention alwaysAllow)

- ruvnet/dynamo-mcp: medium — auto-approves `execute_sql`,
  `apply_migration` on the supabase server (true positive).
- business-idea-multi-agent: medium — auto-approves `fetch_url`.
- BugenZhao/MNGA: 0 — read-only Apple-docs search tools (by design).
- flankerhqd/jebmcp: 0 — its long autoApprove list is all read-only
  decompiler getters (`get_*`, `ping`), none match the heuristic.
- dynamo-mcp additionally flags `remove_template` on its second server.

## Honest boundaries

- Name-based heuristic: a benign tool named like `run_report` can flag
  (severity capped at medium) and a destructive tool with an innocuous
  name escapes — tool-name text is the only static signal available.
- Read-only auto-approvals are deliberately not flagged; the rug-pull
  risk for those is mitigated by the tool-surface lockfile instead.
- Roo global settings (VS Code globalStorage) are outside the project
  tree.

## Evidence

- Full suite green: core 220, cli 47, config-convert 24.
- Self-scan unchanged (17 findings).
