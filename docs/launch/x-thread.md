# X (Twitter) thread draft

> ⚠️ DO NOT POST — content package only; the total lead posts per SOP-03.
> Re-verify the "19 still installable" number on posting day (see
> docs/launch/disclosure/npm-security-report.md §Verification method) and replace
> `<DATE>`. Numbers that go stale in public are worse than no numbers.

## Thread A — the finding (recommended, post first)

**1/**
We unpacked the tarballs of 30+ npm packages flagged as malicious in public feeds
(OSV/GHSA) while building an MCP/AI-agent advisory database.

19 verified-malicious packages targeting Claude Code, Cursor and OpenCode users are
still installable from npm as of <DATE>.

Here's what they actually do 🧵

**2/**
The most common shape: a "remote access" or "leaderboard" helper opens a WebSocket
to a hardcoded server, then runs

`claude -p "<whatever the server sends>" --dangerously-skip-permissions`

Whoever operates that relay has your agent's full tool suite on your machine.

**3/**
`anthropic-setup` — a single base64-concealed eval. It writes ~/.claude/settings.json
with ANTHROPIC_BASE_URL pointed at an attacker domain and stores your API key.

Every Claude Code call afterwards goes through them. Key + prompts + code.

**4/**
`claude-cup` poses as a usage leaderboard, auto-registers itself into Claude Code and
Cursor, then drives your *own authenticated* CLI with a codeword prompt
(striker→github, midfielder→npm, goalkeeper→aws) to harvest credentials.

Your agent robs you on request.

**5/**
`@atom8n/inspector` republishes the official MCP Inspector under a squatted scope,
spoofs Anthropic as the author — and reverts the CVE-2025-49596 auth fix so the proxy
is unauthenticated by default.

Malice disguised as a version bump.

**6/**
`opencode-optimised-toolings` / `opencode-engos-ai` don't bother with MCP at all:
they build (or download) a replacement `opencode` binary from a non-publisher repo and
swap it onto your PATH at install time.

**7/**
Credit where due: all 19 were first flagged upstream (OSV MAL- IDs). Many have sat
live for weeks anyway. Our tarball-level evidence, per-package behavior analysis and
npm disclosure:
github.com/wookat/agentgate/tree/main/docs/launch/disclosure

**8/**
So we built the gate we wanted:

• `agentgate scan` — static, zero execution, cross-checks 116 public advisories
• `agentgate lock` — pins the approved tool surface
• `agentgate ci` — fails the build on drift (GitHub Action + pre-commit)

`npx mcp-agentgate scan`

**9/**
Why "zero execution" matters: to list a stdio server's tools, most scanners *run* the
server command. If the package is the threat, that's the attack.

AgentGate reads configs and package code statically by default; live probing is
explicit opt-in.

**10/**
Apache-2.0, TypeScript, no account, no telemetry.

Repo: github.com/wookat/agentgate
Advisory DB + docs: agentgate.zalize.com

If you run MCP servers in a team repo, the 30-second version is:
`npx mcp-agentgate scan && npx mcp-agentgate lock`

## Thread B — the product angle (post ~1 week later, or by a second account)

**1/**
Your MCP server can change its tool descriptions tomorrow.

Your agent reads them live on the next connection. Nothing in your repo changes. No
client notifies you.

That's a rug pull, and it needs no release, no CVE, no npm publish. 🧵

**2/**
package-lock.json solved this for dependencies 15 years ago: pin the exact thing you
approved, fail loudly when it changes.

MCP has no equivalent. So: `agentgate lock` → agentgate.lock, pinning tool names,
descriptions and input schemas.

**3/**
`agentgate ci` (GitHub Action + pre-commit) fails the build on any drift, with a
human-readable diff. Review it like you review a lockfile bump — approve or reject,
not allow/deny lists.

**4/**
Plus the parts a lockfile can't do: static scanning for tool poisoning (hidden
Unicode, prompt injection in descriptions), credential leaks, SSRF/RCE vectors —
cross-checked against a database of 116 public advisories on MCP/agent threats.

**5/**
Apache-2.0, works offline, no account:
`npx mcp-agentgate scan`

github.com/wookat/agentgate · agentgate.zalize.com

Comparison against Snyk Agent Scan, Cisco MCP Scanner, MCTS, ToolPin, mcp-warden,
mcp-lock — each row verified against their code: docs/COMPARISON.md

## Assets

- Attach the terminal demo GIF (docs/assets/) to tweet 8 (thread A) / 3 (thread B).
- Screenshot of one advisory page from agentgate.zalize.com for tweet 7.

## Accounts worth @-ing (only where genuinely relevant, never spray)

None by default. If a specific maintainer's package is named, they are already
notified via the OSV/GHSA record — do not @ victims of squatting.
