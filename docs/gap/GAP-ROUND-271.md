# GAP-ROUND-271 — Advisory sweep (window 2026-08-03..08-08)

Date: 2026-08-08. Routine advisory sweep (previous: round 267). Database
77 → 79.

## GHSA vulnerability sweep

`api/scripts/watch.mjs` (8-day window): no uncovered MCP-related advisories —
the round-267 rejections remain the only candidates and stay rejected.

## Malware namespace sweep

GitHub malware advisories published 2026-08-01..08-12 fetched with cursor
pagination (1,324 entries, ~26 MCP/agent-named candidates). Two ingested,
both verified against the GHSA description, the OSV MAL entry, and live npm
tarballs:

- **MCPA-2026-0064** `llm-interceptor` (GHSA-6wxr-274h-wx32, MAL-2026-13370):
  postinstall self-registers as an MCP server in `~/.cursor/mcp.json`, runs
  `claude mcp add`, installs a Claude Code SessionEnd hook, then tails
  `~/.claude/projects/**/*.jsonl` and `~/.codex/sessions/**/*.jsonl` and
  POSTs the transcripts to a hardcoded Cloudflare Quick Tunnel; a self-update
  poller gives the operator a live package-swap channel. The 0.1.0 tarball
  (first published version, below the GHSA-flagged range) was unpacked and
  already ships the tailer/egress pipeline → introduced:"0". Still live on
  npm (latest 0.4.1, itself GHSA-flagged).
- **MCPA-2026-0065** `agenttunnels` (GHSA-4cm6-97rm-ffqf, MAL-2026-13400):
  MCP bridge whose `tunnel_run_command`/`tunnel_apply_patch` tools execute
  remote-proposed shell commands and file writes, gated on a *server-side*
  `require_approval` flag controlled by the same author-owned `*.workers.dev`
  endpoint. The 0.1.17 tarball (above the GHSA-flagged 0.1.14) was unpacked
  and still ships the same endpoint and bypass → introduced:"0". Still live
  on npm.

Honest rejections (recorded, not ingested):

- `@servicetitan/anvil2-mcp`, `@or-sdk/mcp-tools`: scoped internal names —
  dependency-confusion placeholders with no public project to map (same bar
  as round 267's internal-name rejections; OSV live check covers installs).
- `remote-claude-daemon`, `claude-remote-agent`, `chatcc-agent`,
  `@guangnao/claude-cli`, `@cliphijack/santaclaude`, `zyr-agent`,
  `mangomind-agent`, `aclade-agent`, `agenthub-ai`, vanexa/or-sdk batch:
  generic remote-control daemons / agent-named trojans, not MCP servers or
  agent-client plugins that appear in AgentGate-scanned configs (round-267
  precedent; OSV real-time malware check covers them when referenced).

## Verification

- 79 advisory files pass schema validation; bundled data
  (`packages/core/src/advisories/data.ts`, `api/src/data.json`) rebuilt.
- End-to-end: a config launching `llm-interceptor@0.4.1` and
  `agenttunnels@0.1.17` reports both as AG-SC-003 critical.
- comparison.md advisory count 77 → 79 (round-255 CI gate passes).
- Full suite/lint/typecheck/build green.

## Boundaries

- npm-security notification for the still-live packages (llm-interceptor,
  agenttunnels, and round-267's opencode-optimised-toolings) remains a
  recommended owner action.
