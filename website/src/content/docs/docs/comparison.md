---
title: How AgentGate compares
description: An honest, dated comparison of AgentGate with other MCP and supply-chain scanners, based on real runs.
---

All claims below come from real runs we performed and re-check every few
iterations; each cell is dated so you can judge freshness. Competitors move —
when a claim is stale or we can't verify something, we say so.

*Last verified: 2026-08-06 against snyk-agent-scan 0.5.16 (formerly
mcp-scan), socket CLI 1.1.154, osv-scanner v2.4.0.*

## Where AgentGate is different

| Capability | AgentGate | snyk-agent-scan | socket / osv-scanner |
|---|---|---|---|
| MCP config scanning (static, no server started) | yes | yes | no (package-focused) |
| Live tool-surface scanning (MCP handshake) | yes, opt-in `--live` | yes | no |
| Agent skill / slash-command scanning | yes, offline, no account | gated behind `SNYK_TOKEN` — refuses to run without an account (verified 2026-08-06) | no |
| `allowed-tools` overprivilege analysis | yes (AG-SK-002) | unknown — unverifiable without a token | no |
| Load-time dynamic-context command analysis | yes (AG-SK-003) | unknown — unverifiable without a token | no |
| Tool-surface lockfile + drift gate (rug-pull defense) | yes (`lock` / `diff` / `ci`) | no equivalent found | no |
| Curated MCP advisory database | yes — [28 public advisories](/advisories/), bundled for offline use + live API | no public equivalent found | OSV covers registry malware, not MCP-server CVEs as a category |
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

## Our position

AgentGate is the `npm audit + package-lock + Dependabot` combination for the
MCP era: scan (poisoning/credentials/SSRF/RCE/skills) → lock (tool-surface
hash) → gate (drift = red CI) → advise (public advisory DB, checked on every
scan). It runs anonymously, offline, in about a second, and every detection
claim on this page is reproducible from a clean environment.
