# GAP Report — Round 53 (config convert parity with round-52 discovery)

## Gap

Round 52 taught *discovery* about Windsurf, Cline, and Gemini CLI, but
`config convert` still refused them as `--from`/`--to` targets — an
asymmetric UX ("scan sees my Windsurf config but can't convert it").

## Added

Three adapters in `mcp-agentgate-config-convert` (semantics from official
docs/source, same references as GAP-ROUND-52):

- `windsurf`: `mcpServers` shape but remote servers use `serverUrl`;
  parsed from either field, always rendered as `serverUrl`.
- `cline`: `disabled: true` maps to canonical `enabled: false` and back;
  `autoApprove` lists are warned as lossy (no cross-client equivalent).
- `gemini-cli`: `url` (SSE) vs `httpUrl` (streamable HTTP) distinction
  preserved in both directions.

CLI `--from` default-path auto-discovery (round 15) picks the new clients up
automatically since it filters core `knownConfigLocations`.

## Routine checks this round

- advisory watch (authenticated GHSA/OSV run): no uncovered advisories.
- Competitors: socket 1.1.154, osv-scanner v2.4.0 — no movement since the
  comparison page's 2026-08-06 verification.

## Verified

- 3 new contract tests + the existing all-clients stdio round-trip test now
  covers 9 clients (12 convert tests total).
- Full suite green: build, lint, typecheck, core/cli/config-convert tests.
