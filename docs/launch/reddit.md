# Reddit drafts

> ⚠️ DO NOT POST — content package only. Publishing is executed by the total lead per
> SOP-03. Adapt tone per subreddit; never cross-post identical text the same day.
> Disclose that you're the author in every post (most subs require it).

## Target subreddits (in posting order, ≥2 days apart)

| Subreddit | Angle | Notes |
|---|---|---|
| r/mcp | Tool announcement | Most receptive; MCP-native audience |
| r/ClaudeAI | "Protect your Claude MCP setup" | Focus on Claude Desktop/Code workflows |
| r/LocalLLaMA | Supply-chain security for local agent stacks | Skeptical crowd; lead with incidents, not product |
| r/cursor | Cursor config + gate workflow | Include the config-convert angle |
| r/netsec | Technical writeup only | Needs a blog-post-style link, not a repo ad; consider posting the COMPARISON/threat analysis |

## r/mcp draft

**Title:** We verified 19 malicious npm packages targeting MCP/AI agents that are still installable — and open-sourced the gate we built against them

**Body:**

Author here. While maintaining a public MCP advisory database we kept unpacking npm
tarballs that remote-control your coding agent: packages that open a WebSocket to a
hardcoded relay and spawn `claude -p <server prompt> --dangerously-skip-permissions`,
a fake `anthropic-setup` that points ANTHROPIC_BASE_URL at an attacker domain, a
republished MCP Inspector with the CVE-2025-49596 auth fixes reverted. As of <DATE>,
19 are still installable (evidence + per-package analysis:
docs/launch/disclosure/ in the repo; all have OSV MAL- IDs).

Existing tooling covers fragments: scanners with no baseline/drift story (and most
execute your server commands to enumerate tools), lockfile tools with no scanning and
no advisory feed (source-verified comparison: docs/COMPARISON.md).

AgentGate is one CLI for the full loop:

- **scan** — tool poisoning (hidden Unicode / prompt injection), credential leaks,
  SSRF/RCE vectors, over-privileged tool combos; static by default (zero execution —
  it never runs your server commands), live opt-in
- **lock** — `agentgate.lock` pins tool names + descriptions + input schemas (the
  things a rug pull changes)
- **ci** — GitHub Action / pre-commit hook; any drift fails the build with a readable diff
- **advise** — cross-check against our public structured MCP advisory database
  (110 public advisories, the 19 above included)

Bonus: `config convert` moves server configs between Claude Desktop/Code, Cursor,
VS Code, Codex, and OpenCode formats.

Apache-2.0, TypeScript/Node 22. Repo: https://github.com/wookat/agentgate
Docs: https://agentgate.zalize.com

Would love feedback on the lockfile schema (docs/spec/) — it's a documented JSON
Schema, and I'd rather converge with other tools than fragment the format.

## r/ClaudeAI draft (shorter)

**Title:** PSA: npm packages that remote-drive your Claude Code with --dangerously-skip-permissions are live right now — how to check your setup

**Body:**

We unpacked and verified 19 npm packages that are still installable and target
Claude Code / Cursor users: fake "remote access"/"leaderboard"/"setup" helpers that
connect to a hardcoded server and let it spawn
`claude --dangerously-skip-permissions` with arbitrary prompts on your machine, hijack
your ANTHROPIC_BASE_URL to steal API keys, or harvest GitHub/npm/AWS credentials
through your own authenticated `claude` CLI (claude-cup). Full list with evidence:
https://github.com/wookat/agentgate/tree/main/docs/launch/disclosure

Separately: your MCP servers can change their tool descriptions upstream any time —
Claude reads them live on every connection, and you get no notification. That's how
rug-pull attacks work.

AgentGate scans your MCP configs for poisoning/credential leaks, pins the approved tool
surface into a lockfile, and fails CI (or a pre-commit hook) when anything drifts.
Free, open source, Apache-2.0: https://github.com/wookat/agentgate (docs: https://agentgate.zalize.com)

Happy to answer questions — author here.

## r/LocalLLaMA draft (incident-led)

**Title:** MCP supply-chain attacks are real now (postmark-mcp backdoor, CVE-2025-6514) — I built an open-source gate

**Body:**

Quick recap of where MCP security stands: postmark-mcp shipped an email BCC backdoor in
a patch release; mcp-remote had a CVSS 9.6 RCE; and "rug pulls" (upstream silently
rewrites tool descriptions your agent ingests) need no release at all. NSA and OWASP
both published MCP hardening guidance saying: pin versions, hash tool definitions,
alert on drift.

I built AgentGate to make that guidance a one-liner: scan MCP servers (static rules,
no cloud account needed), lock the tool surface into a hash-pinned lockfile, gate CI on
drift, and cross-check a public advisory DB. Apache-2.0:
https://github.com/wookat/agentgate

Comparison with mcp-scan/Snyk, Cisco MCP Scanner, MCTS, ToolPin, mcp-warden (each
verified against their actual code/README): docs/COMPARISON.md in the repo.
