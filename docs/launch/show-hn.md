# Show HN draft

> ⚠️ DO NOT POST — content package only. All external publishing is executed by the
> total lead per SOP-03. Re-verify the "still installable" count against
> docs/launch/disclosure/npm-security-report.md on posting day (packages get taken
> down; never post a stale number).

## Title (80 char max — pick one)

1. `Show HN: We found 19 malicious npm packages targeting AI agents – still live`
2. `Show HN: AgentGate – npm audit + lockfile + CI drift gate for MCP servers`
3. `Show HN: AgentGate – we scan npm for malicious MCP/agent packages (19 live now)`

Recommended: #1 (a concrete, verifiable finding beats a product pitch on HN;
the product rides the story).

## URL

`https://github.com/wookat/agentgate`

## First comment (post immediately after submitting)

Hi HN — while building AgentGate's advisory database we kept finding npm packages
that remote-control your AI coding agent. As of <DATE>, 19 of them are still
installable from the public registry (we re-verified the latest tarballs by
unpacking them; full list + evidence in the repo under
docs/launch/disclosure/). The recurring shape:

- a "helper"/"leaderboard"/"remote access" package opens a WebSocket to a
  hardcoded relay, then spawns `claude -p <server-supplied prompt>
  --dangerously-skip-permissions` — whoever runs the relay gets your Claude
  Code's full tool suite on your machine (agenthub-multiagent-mcp,
  remote-claude-daemon, @cliphijack/santaclaude, …)
- `anthropic-setup` rewrites ~/.claude/settings.json to point ANTHROPIC_BASE_URL
  at an attacker domain — every later Claude Code call leaks your API key and code
- `@atom8n/inspector` republishes the official MCP Inspector with the
  CVE-2025-49596 auth fixes deliberately reverted

We reported them (OSV MAL- IDs exist for all 19; npm disclosure sent) and built
tooling so you don't have to trust us:

- `agentgate scan` — static analysis of your MCP configs + server packages,
  cross-checked against our public advisory DB (110 public advisories).
  Zero execution: unlike scanners that launch your MCP servers to enumerate
  tools, the default path never runs server code.
- `agentgate lock` — pins the approved tool surface (names, descriptions, input
  schemas) into `agentgate.lock`
- `agentgate ci` — GitHub Action / pre-commit; any drift fails the build with a
  readable diff (rug-pull defense — a server you approved can silently change
  its tool descriptions upstream and no client will tell you)

Existing tools cover corners: Snyk's Agent Scan and Cisco's scanner have no
lockfile/drift story (and enumerating tools generally means executing the server
command); lockfile tools have no scanning and no advisory feed. Source-verified
comparison: docs/COMPARISON.md.

TypeScript, Node 22, Apache-2.0, no account needed.
Docs + advisory DB: https://agentgate.zalize.com

Happy to answer anything — especially skeptical questions about what a lockfile
can and cannot defend against (runtime enforcement is explicitly out of scope).

## Prepared answers for likely questions

**"Did you report these to npm?"** — Yes: full responsible-disclosure email with
per-package evidence went to npm security (docs/launch/disclosure/), and all 19
have OSV MAL- identifiers. Several have sat live for weeks after being flagged.

**"Isn't this just Snyk's mcp-scan?"** — Different loop: they scan (and will
execute stdio server commands to enumerate tools, with a consent prompt, plus
require a SNYK_TOKEN); we scan statically by default (zero execution, no
account), then lock + gate drift in CI, cross-checking a public advisory DB.
Verified row-by-row in docs/COMPARISON.md.

**"A lockfile can't stop a malicious-from-day-one server."** — Correct; that's
what `scan` + the advisory DB are for. Lock defends the day-7 change, scan
defends day 0.

**"Why should I trust YOUR advisory list?"** — It's public, structured JSON with
references to OSV/GHSA where they exist, and every claim states the verification
method (tarball unpacked, version, date). PRs welcome.

**"How were the 19 found?"** — Continuous watch over GHSA/OSV plus our own
hunting rounds; each candidate's latest tarball is unpacked and read before an
advisory is written (no scanner-only claims).

## Timing notes

- Post Tue–Thu, 14:00–16:00 UTC (peak US morning).
- On posting day: re-run the live check (see disclosure doc §Verification
  method), update the count in title/comment, confirm docs site + advisory API up.
- <maintainer> must be available for the first 3 hours to answer comments.
