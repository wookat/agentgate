---
title: How AgentGate compares
description: An honest, dated comparison of AgentGate with other MCP and supply-chain scanners, based on real runs.
---

All claims below come from real runs we performed and re-check every few
iterations; each cell is dated so you can judge freshness. Competitors move —
when a claim is stale or we can't verify something, we say so.

*Last verified: 2026-08-08 against snyk-agent-scan 0.5.16 (formerly
mcp-scan), thynkQ mcp-scan 2.0.2 (npm), socket CLI 1.1.155, osv-scanner
v2.5.0, mcp-observatory 1.36.4.*

## Where AgentGate is different

| Capability | AgentGate | snyk-agent-scan | socket / osv-scanner |
|---|---|---|---|
| MCP config scanning (static, no server started) | yes | yes | no (package-focused) |
| Live tool-surface scanning (MCP handshake) | yes, opt-in `--live` | yes | no |
| Remote (`url`) server live scanning + lockfile pinning | yes since 0.21.0 — Streamable HTTP with SSE fallback, `lock`/`ci` gate remote drift | unknown — unverifiable without a token | no |
| OAuth login for hosted servers ([`auth login`](/docs/guides/remote-oauth/)) | yes since 0.23.0 — OAuth 2.1 + PKCE, tokens cached outside the repo, picked up by live scans | unknown — unverifiable without a token | no (thynkQ mcp-scan 2.0.2 never connects to remote servers — re-verified 2026-08-07) |
| Agent skill / slash-command scanning | yes, offline, no account | gated behind `SNYK_TOKEN` — refuses to run without an account (verified 2026-08-06) | no |
| `allowed-tools` overprivilege analysis | yes (AG-SK-002) | unknown — unverifiable without a token | no |
| Load-time dynamic-context command analysis | yes (AG-SK-003) | unknown — unverifiable without a token | no |
| Tool-surface lockfile + drift gate (rug-pull defense) | yes (`lock` / `diff` / `ci`) | no equivalent found | no |
| Curated MCP advisory database | yes — [87 public advisories](/advisories/), bundled for offline use + live API | no public equivalent found | OSV covers registry malware, not MCP-server CVEs as a category |
| Known-malware package checks | yes (OSV + MCPA) | requires account | yes (their core strength) |
| Hallucinated-dependency / typosquat checks | yes (`deps`) | no | socket: partial (different focus) |
| SARIF for GitHub code scanning | yes, per-rule severity + fingerprints | unknown | osv-scanner: yes |
| Works fully offline / air-gapped | yes (bundled advisories, degraded warnings) | no (token check) | osv-scanner: with offline DB |

## Where competitors are stronger

Honesty cuts both ways:

- **socket** analyzes package *behavior* (install scripts, capability
  detection) across millions of packages — far beyond our registry-metadata
  checks. For general npm supply-chain depth, use socket alongside AgentGate.
- **osv-scanner** covers every language ecosystem OSV supports, with mature
  lockfile parsing for a dozen formats. AgentGate's `deps` only handles
  npm/PyPI manifests.
- **snyk-agent-scan** ships runtime guardrails (`guard` hooks) that
  intercept agent traffic live; AgentGate is scan-time only.
- **mcp-observatory** does live server health monitoring — scoring, trend
  history, cassette replay, `watch` alerts — that AgentGate has no
  equivalent for. If you operate MCP servers, it is a useful ops companion.

## A note on @kryptosai/mcp-observatory

`@kryptosai/mcp-observatory` (v1.36.4, verified by real run 2026-08-08) is
the closest npm-native overlap we have found: it discovers agent configs
across ten clients, records tool-schema lock files, and diffs runs for
schema drift. The differences we measured on our shared fixture:

- Its `scan` **starts every configured server by default** (a live stdio
  session per server); AgentGate is static by default and `--live` is
  opt-in with consent. On our fixture it launched `mcp-echarts@0.8.1` — a
  version publicly known to be compromised (Mini Shai-Hulud,
  [MCPA-2026-0066](/advisories/mcpa-2026-0066/)) — with **no malware or
  advisory warning**; its checks are runtime-profile and schema-quality
  focused. AgentGate flags that exact version critical offline.
- No skill/instruction-file scanning: a poisoned `SKILL.md` next to the
  config is never read.
- Its lock/drift covers live tool schemas only; config files themselves are
  not pinned, and its `audit` requires a proprietary
  `mcp-observatory.target.json` rather than reading agent configs.

## A note on the npm `mcp-scan` (thynkQ)

The npm package `mcp-scan` (v2.0.2, verified by real run 2026-08-06) is an
unrelated product by thynkQ that took over the name after Invariant Labs'
tool moved to Snyk. It scans many AI-tool configs offline with no account
and adds SBOM/compliance/TUI features. On our shared fixture it flagged the
exposed secret and unpinned packages, but it did not scan skill/instruction
files at all (a poisoned `SKILL.md` produced zero findings — re-verified
2026-08-08), has no MCP
advisory database (`ludus-mcp@1.0.24` with three public CVEs reported only a
generic "unverified source"), and its `diff` compares scan reports rather
than pinning the tool surface — no lockfile, so description rug-pulls pass.
Re-tested 2026-08-07 against a remote `url` server (`mcp.deepwiki.com`): it
never connects — a 3 ms static pass flagged only "contacts unknown external
endpoint", so poisoned descriptions or rug-pulls on hosted servers are
invisible to it; AgentGate's `--live` fetches and locks the remote surface.

## Our position

AgentGate is the `npm audit + package-lock + Dependabot` combination for the
MCP era: scan (poisoning/credentials/SSRF/RCE/skills) → lock (tool-surface
hash) → gate (drift = red CI) → advise (public advisory DB, checked on every
scan). It runs anonymously, offline, in about a second, and every detection
claim on this page is reproducible from a clean environment.
