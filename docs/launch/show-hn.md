# Show HN draft

> ⚠️ DO NOT POST — content package only. All external publishing is executed by the
> total lead per SOP-03. Fill `<placeholders>` at launch time; re-verify all claims
> against the shipped v0.1 before posting.

## Title (80 char max — pick one)

1. `Show HN: AgentGate – npm audit + lockfile + CI drift gate for MCP servers`
2. `Show HN: AgentGate – scan, lock, and CI-gate the MCP servers your agent uses`
3. `Show HN: A lockfile and security scanner for MCP servers (rug-pull defense)`

Recommended: #1 (leads with a mental model every HN reader already has).

## URL

`https://github.com/wookat/agentgate`

## First comment (post immediately after submitting)

Hi HN — I built AgentGate because adding an MCP server to Claude/Cursor today is
"paste JSON, hope for the best."

Three things convinced me this needs real tooling:

- postmark-mcp shipped an email BCC backdoor in a patch release.
- mcp-remote had a CVSS 9.6 RCE (CVE-2025-6514).
- The quietest one — the rug pull — needs no release at all: a server you approved
  changes its tool descriptions or input schemas upstream, your agent reads them live
  at the next connection, and nothing in your repo changed. No client notifies you.

Existing tools each cover one corner: scanners (Snyk Agent Scan, Cisco MCP Scanner,
MCTS) have no lockfile or drift gate; lockfile tools (ToolPin, mcp-warden, mcp-lock)
have no real scanning and no advisory database. Detailed source-verified comparison:
https://github.com/wookat/agentgate/blob/main/docs/COMPARISON.md

AgentGate closes the loop in one CLI:

- `agentgate scan` — static + opt-in live analysis: tool poisoning (hidden Unicode,
  prompt injection), credential leaks, SSRF/RCE vectors, over-privileged combos
- `agentgate lock` — pins the exact tool surface (names, descriptions, input schemas)
  into `agentgate.lock`
- `agentgate ci` — fails the build on any drift; diff-based review, not allow/deny
- advisory cross-check against a public, structured MCP advisory DB (Workers API)

Also ships a GitHub Action, pre-commit hooks, and a config converter between
Claude/Cursor/VS Code/Codex/OpenCode formats (config portability is a named gap in the
official MCP 2026 roadmap).

Docs, rule reference, and a shareable report viewer: https://agentgate.zalize.com

TypeScript, Node 22, Apache-2.0. Happy to answer anything — especially skeptical
questions about what a lockfile can and cannot defend against (runtime behavior is
explicitly out of scope; that's a gateway's job).

## Prepared answers for likely questions

**"Isn't this just <competitor>?"** — Point to COMPARISON.md; each row was verified
against their README/code. Closest is ToolPin (lock+gate, no scanning/advisories) and
mcp-warden (lock+gate+runtime result proxy, no scanning/advisories).

**"A lockfile can't stop a malicious-from-day-one server."** — Correct; that's what
`scan` + the advisory DB are for. Lock defends the day-7 change, scan defends day 0.

**"Scanning executes server commands?"** — Static by default; live connection is
explicit opt-in (`--live`), same consent posture as Snyk's scanner.

**"Why not wait for the official spec?"** — The MCP 2026 roadmap punts these to
extensions; we implement now, and the lockfile schema is a documented JSON Schema in
docs/spec/ so it can converge with any future standard.

## Timing notes

- Post Tue–Thu, 14:00–16:00 UTC (peak US morning).
- Have the repo README, the docs site (https://agentgate.zalize.com), and the demo GIF
  live before posting. README hero GIF: done. Docs site: live (route B).
- <maintainer> must be available for the first 3 hours to answer comments.
