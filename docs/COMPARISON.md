# Competitive Comparison

> Last verified: 2026-08-03. Every claim below was checked against the competitor's
> public README / docs / repository on that date (links in each section). Star counts
> and activity are from the GitHub API on the same date and will drift over time.
> AgentGate is under active development — the AgentGate column reflects the scope
> committed in [PROPOSAL.md](PROPOSAL.md) / [ROUTES.md](ROUTES.md); rows not yet
> shipped are marked "planned".

## TL;DR

The MCP security tool landscape splits into two camps that don't overlap:

1. **Scanners** (Snyk Agent Scan, Cisco MCP Scanner, MCTS) — find known-bad patterns
   at scan time, but have **no lockfile and no CI drift gate**: an approved server that
   quietly changes its tool descriptions next week is invisible to them.
2. **Lockfile/drift gates** (ToolPin, mcp-warden, the two mcp-locks) — pin the tool
   surface and fail CI on drift, but have **no real security scanning** (at most an
   advisory description scan) and **no public advisory database**.

AgentGate's bet: one tool that closes the whole loop — **scan → lock → gate → advise**
— with a public structured advisory DB cross-checked at scan time. No competitor
covers more than two of the four.

## Feature matrix

| Capability | AgentGate | [Snyk Agent Scan](https://github.com/snyk/agent-scan) (ex mcp-scan) | [Cisco MCP Scanner](https://github.com/cisco-ai-defense/mcp-scanner) | [MCTS](https://github.com/MCP-Audit/MCTS) | [ToolPin](https://github.com/proofofwork-agency/toolpin) | [mcp-warden](https://github.com/DataScience-EngineeringExperts/mcp-warden) | [mcp-lock (blestlabs)](https://github.com/blestlabs/mcp-lock) | [mcp-lock (mcpguards)](https://github.com/mcpguards/mcp-lock) |
|---|---|---|---|---|---|---|---|---|
| Static security scan (config/repo) | ✅ (planned, route A) | ✅ | ✅ (YARA + code behavioral) | ✅ (SAST, Python/TS/Go/Rust) | ⚠️ advisory description scan only | ❌ | ⚠️ basic `scan` command | ❌ |
| Live scan (connect to server, `tools/list`) | ✅ opt-in `--live` (planned) | ✅ (executes server cmds; consent prompt) | ✅ (stdio/SSE/HTTP, OAuth) | ✅ opt-in `--live` | ✅ (`test`/`verify`) | ✅ (stdio + streamable HTTP) | ✅ (spawns servers on `pin`) | ❌ (package-level only) |
| Lockfile of tool surface (names/descriptions/schemas) | ✅ `agentgate.lock` (planned) | ❌ | ❌ | ❌ | ✅ `mcp-lock.json` (+ artifact digests, ed25519 sigs) | ✅ `warden.lock` (signed, incl. resources/prompts) | ✅ SHA-256 of descriptions+schemas | ⚠️ npm version + tarball hash only, not tool surface |
| CI drift gate (non-zero exit) | ✅ `agentgate ci` (planned) | ❌ | ❌ | ⚠️ score threshold gate, not drift | ✅ `toolpin ci` + `init ci` scaffold | ✅ `check` + GitHub Action | ✅ `ci` command | ✅ `verify` |
| Human-readable drift diff | ✅ `agentgate diff` (planned) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ `diff` | ⚠️ change report |
| Public advisory database + auto cross-check | ✅ structured JSON + Workers API (route B) | ⚠️ proprietary Snyk platform (token required) | ⚠️ pip-audit for Python deps, VirusTotal for binaries | ❌ | ❌ | ❌ | ❌ | ❌ |
| Multi-client config discovery | ✅ Claude/Cursor/VS Code/Codex/OpenCode (planned) | ✅ broad (Claude, Cursor, Windsurf, Gemini CLI, VS Code, …) | ⚠️ config file input | ✅ `--machine-wide` | ✅ broad (12+ clients) | ❌ (server cmd/URL input) | ✅ | ✅ |
| Config format conversion between clients | ✅ `agentgate config convert` (route C) | ❌ | ❌ | ❌ | ⚠️ generates config per client on install (no convert of existing configs) | ❌ | ❌ | ❌ |
| Output formats | JSON / SARIF / terminal table (planned) | terminal, experimental CLI output | JSON, CLI, REST API | JSON / SARIF / HTML | terminal, SARIF (scan), JSON | terminal, SARIF | terminal, JSON | terminal |
| GitHub Action | ✅ `packages/action` (route C) | ❌ (none in repo) | ❌ | ❌ (CI via CLI only) | ✅ (via `init ci` scaffold) | ✅ published Action | ❌ | ❌ |
| pre-commit hook | ✅ (route C) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Runtime result inspection (proxy) | ❌ out of scope | ❌ | ❌ | ❌ | ❌ | ✅ `guard` proxy (stdio, ANSI/secret-echo/exfil) | ❌ | ❌ |
| Works offline / no cloud account | ✅ (advisory DB optional) | ❌ requires `SNYK_TOKEN` | ⚠️ YARA engine offline; AI engines need API keys | ✅ local-first | ✅ | ✅ | ✅ | ✅ |
| Docs site | ✅ (route B) | ⚠️ docs in repo | ⚠️ docs in repo | ⚠️ docs in repo | ✅ GitHub Pages | ⚠️ docs in repo | ❌ | ❌ |
| Language / runtime | TypeScript / Node 22 | Python (uvx / binary) | Python 3.11+ | Python 3.11+ | TypeScript / Node 24+ | Python 3.11+ | TypeScript / Node 18+ | TypeScript |
| License | Apache-2.0 | Apache-2.0 | Apache-2.0 | Apache-2.0 | Apache-2.0 | MIT | Apache-2.0 | MIT |
| GitHub stars (2026-08-03) | — (pre-launch) | 2,857 | 1,003 | 28 | 0 | 2 | 0 | 0 |
| Maturity | in development | production (Snyk-backed) | active (Cisco-backed) | alpha | pre-1.0 beta | v0.x | early | early |

Legend: ✅ shipped/confirmed in their README or code · ⚠️ partial (see notes) · ❌ absent from README/docs/code as of the verification date.

## Per-competitor notes (what we actually verified)

### Snyk Agent Scan — formerly `invariantlabs-ai/mcp-scan`

- The original `mcp-scan` (Invariant Labs) now redirects to [snyk/agent-scan](https://github.com/snyk/agent-scan); it was absorbed into Snyk's platform.
- Strengths: broadest agent auto-discovery (Claude Desktop/Code, Cursor, Windsurf, VS Code, Gemini CLI, Amp, Kiro, OpenCode, Antigravity, …), 15+ issue codes including tool poisoning, tool shadowing, toxic flows, and agent **skills** scanning (SKILL.md malware/prompt-injection) — a surface nobody else covers.
- Weaknesses vs AgentGate: **requires a Snyk account + `SNYK_TOKEN`** for every scan; CLI output explicitly labeled "experimental and subject to change"; scanning stdio configs **executes the server commands** (sandbox recommended); no lockfile, no drift gate, no CI story in the OSS repo. It is an inventory+scanner front-end for a commercial platform.

### Cisco MCP Scanner (`cisco-ai-defense/mcp-scanner`)

- Three engines: YARA rules, LLM-as-a-judge, and the Cisco AI Defense inspect API; plus pip-audit dependency scanning, VirusTotal binary lookups, PyPI package sandbox scanning, and a REST API mode.
- Offline/static scanning of pre-generated JSON is supported (good for air-gapped CI).
- Weaknesses vs AgentGate: two of three engines need external API keys (LLM provider / Cisco AI Defense); scanner only — no lockfile, no drift gate, no advisory DB, no client-config management.

### MCTS — Model Context Threat Scanner (`MCP-Audit/MCTS`)

- The most capable pure open-source scanner: static discovery for Python+TS repos, live stdio probing (explicit `--i-understand-live-risk`), remote HTTP/SSE, offline snapshots, machine-wide client-config scan, source-aware SAST (secrets, command exec, path validation), behavioral description-vs-implementation taint analysis (Python, TS, Go, Rust), opt-in Semgrep, JSON/SARIF/HTML reports, risk scoring with CI thresholds.
- Weaknesses vs AgentGate: self-described **alpha**; scanner only — no lockfile/pinning, no drift detection, no advisory DB, no config management; CI gate is a score threshold, not a baseline diff.

### ToolPin (`proofofwork-agency/toolpin`)

- The most complete lockfile play and closest in spirit to AgentGate's lock/gate half: `mcp-lock.json` covers artifact digests (npm SRI/OCI/MCPB), the live tool-surface hash **including input schemas**, and generated client config; optional ed25519 signatures; a vendor-neutral draft lockfile spec with JSON Schemas and test vectors; policy engine; registry integration (Official MCP Registry, Docker MCP Catalog); interactive CLI + full TUI; `toolpin init ci` scaffolds a GitHub workflow.
- Weaknesses vs AgentGate: security scanning is explicitly **advisory-only** ("findings never silently block") and limited to tool descriptions — no static/SAST rules, no SSRF/RCE/credential analysis; no advisory database; requires Node 24+; zero stars / pre-1.0 beta with no community yet.

### mcp-warden (`DataScience-EngineeringExperts/mcp-warden`)

- Deterministic pin/check of the declared surface (`tools/list`, `resources/list`, `prompts/list`) into a signed `warden.lock`, stdio + streamable HTTP, SARIF upload to GitHub code scanning, a published GitHub Action, and a v0.3 `guard` runtime proxy inspecting tool **results** (ANSI escapes, secret echo, exfil domains) — the only runtime-result angle in this list.
- Notably honest threat model docs ("not a full agent firewall", behavioral attacks out of scope).
- Weaknesses vs AgentGate: no security scanning of code/configs at all; no advisory DB; no client-config discovery or generation (you pass the server argv/URL yourself); PyPI naming collision (`mcp-warden` on PyPI is an unrelated package — install is `mcp-warden-cli`); tiny community (2 stars).

### mcp-lock — blestlabs (`blestlabs/mcp-lock`)

- `pin` / `diff` / `scan` / `ci` over SHA-256 hashes of tool descriptions and schemas; `--no-connect` mode for auditing untrusted configs without spawning processes.
- Weaknesses vs AgentGate: minimal scanner; no advisory DB; no Action/pre-commit; no spec for the lockfile; no visible community (0 stars); default `pin` executes server commands.

### mcp-lock — mcpguards (`mcpguards/mcp-lock`)

- Different layer than the name suggests: pins the **npm package** (exact version + tarball integrity hash) of each MCP server, like `npm ci` — it does **not** hash the live tool surface, so a rug-pull that changes tool descriptions server-side without a package release passes.
- Weaknesses vs AgentGate: npm-only; no tool-surface lock, no scanning, no advisory DB, no Action.

### mcp-scan — thynkQ (npm `mcp-scan`, unrelated to Invariant/Snyk)

- A separate product that took over the `mcp-scan` npm name (thynkq.com, first
  published 2026-03; v2.0.2 verified by real run 2026-08-06). Wide command
  surface: scan/diff/watch/ci, SBOM, compliance mapping (SOC2/GDPR/HIPAA…),
  privacy assessments, a TUI dashboard, a runtime proxy, and a marketplace
  submission flow. Scans configs of "16+ AI tools", offline, no account —
  the closest UX overlap with AgentGate's static scan.
- Real-run findings on our shared fixture (2026-08-06): flagged the exposed
  env secret and unpinned packages, fast (≤30 ms). But it **did not scan
  skill/instruction files at all** (a poisoned `SKILL.md` in the same project
  produced zero findings), has **no advisory database** (`ludus-mcp@1.0.24`
  with three public CVEs reported only generic "unverified source"), and
  showed accuracy issues: our fake `sk-proj-…` OpenAI-style key was labeled
  a "Cloudflare API Token", a version spec `ludus-mcp@1.0.24` was flagged as
  a network "exfiltration-vector", and one env secret triggered four
  boilerplate PII-compliance findings.
- `diff` compares two scan reports (finding drift), not the tool surface:
  no lockfile, no schema/description pinning, so a rug-pull that changes
  tool descriptions between scans without changing findings passes.

## Honest gaps (where competitors beat AgentGate today)

Per CHARTER §7 the comparison must be honest, so, as of this writing:

- **Shipped vs planned**: Snyk/Cisco/MCTS/ToolPin/mcp-warden all have working releases today; AgentGate's CLI is under construction. This document must be re-verified against our shipped feature set before final acceptance.
- **Skills scanning**: Snyk Agent Scan covers agent skills (SKILL.md); AgentGate does not (out of scope for v1).
- **Runtime result inspection**: mcp-warden's `guard` proxy is out of AgentGate's v1 scope by design.
- **AI-powered judging**: Cisco's LLM-as-a-judge engine has no AgentGate equivalent (we are deterministic-first by design).
- **Registry integration & TUI**: ToolPin's registry browsing/install UX is beyond AgentGate v1.

## What "winning" requires (acceptance bar)

To meet the CHARTER §7 bar ("match or beat comparable competitors"), AgentGate v1 must ship, at minimum: scan (static + opt-in live) with rule categories ≥ MCTS's core set, lock+diff+ci at parity with ToolPin/mcp-warden's declared-surface coverage, the advisory DB (unique — nobody has one), the config converter (unique), GitHub Action + pre-commit (only mcp-warden/ToolPin have an Action; nobody has pre-commit), and a real docs site — all offline-capable with no account requirement.
