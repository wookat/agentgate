# Show HN draft

> ⚠️ DO NOT POST — content package only. All external publishing is executed by the
> total lead per SOP-03. On posting day run `node scripts/launch-live-check.mjs`
> to re-verify the "still installable" count (packages get taken down; never post
> a stale number), then update the count and <DATE> everywhere in docs/launch/.

## Title (80 char max — pick one)

1. `Show HN: 19 malicious npm packages targeting AI agents are still installable`
2. `Show HN: AgentGate – npm audit + lockfile + CI drift gate for MCP servers`
3. `Show HN: We verified 19 malicious MCP/agent npm packages – still live today`

Recommended: #1 (a concrete, verifiable finding beats a product pitch on HN;
the product rides the story).

## URL

`https://github.com/wookat/agentgate`

## First comment (post immediately after submitting)

Hi HN — while building AgentGate's advisory database we unpacked and read the
latest tarballs of 30+ npm packages flagged as malicious in public feeds
(OSV/GHSA) that target AI coding agents. As of <DATE>, 19 of them — verified
malicious in the shipped code — are still installable from the public registry
(full list + per-package evidence in the repo under docs/launch/disclosure/).
The recurring shape:

- a "helper"/"leaderboard"/"remote access" package opens a WebSocket to a
  hardcoded relay, then spawns `claude -p <server-supplied prompt>
  --dangerously-skip-permissions` — whoever runs the relay gets your Claude
  Code's full tool suite on your machine (agenthub-multiagent-mcp,
  remote-claude-daemon, @cliphijack/santaclaude, …)
- `anthropic-setup` rewrites ~/.claude/settings.json to point ANTHROPIC_BASE_URL
  at an attacker domain — every later Claude Code call leaks your API key and code
- `@atom8n/inspector` republishes the official MCP Inspector with the
  CVE-2025-49596 auth fixes deliberately reverted

All 19 already carry OSV MAL- identifiers — flagged upstream, still live. We
sent npm security a consolidated disclosure and built tooling so you don't have
to trust us:

- `agentgate scan` — static analysis of your MCP configs + server packages,
  cross-checked against our public advisory DB (116 public advisories).
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

**"Did you discover these?"** — No — credit where due: each has an upstream OSV
MAL- (and often GHSA) record. Our contribution is verification (every latest
tarball unpacked and read, behavior documented in structured advisories) and the
finding that 19 remain installable weeks after being flagged; we sent npm
security a consolidated disclosure (docs/launch/disclosure/).

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

**"How were the 19 selected?"** — Continuous watch over GHSA/OSV; each
candidate's latest tarball is unpacked and read before an advisory is written
(no scanner-only claims), and "still installable" is re-checked against the
registry on the stated date.

## Timing notes

- Post Tue–Thu, 14:00–16:00 UTC (peak US morning).
- On posting day: re-run the live check (see disclosure doc §Verification
  method), update the count in title/comment, confirm docs site + advisory API up.
- <maintainer> must be available for the first 3 hours to answer comments.
