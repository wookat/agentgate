---
title: Introduction
description: What AgentGate is, the problems it solves, and how its scan / lock / gate / advise loop works.
---

AgentGate is an open-source trust and supply-chain gate for [Model Context Protocol](https://modelcontextprotocol.io) (MCP) servers. Think of it as **`npm audit` + `package-lock.json` + Dependabot — for the MCP era**, in one tool:

- **Scan** — static and live analysis of MCP servers: tool poisoning (hidden Unicode, prompt injection in descriptions), credential leaks, SSRF/RCE vectors, over-privileged tool combinations.
- **Lock** — pin the exact tool surface (names, descriptions, input schemas) your agent sees into `agentgate.lock`, defending against upstream rug-pulls.
- **Gate** — fail CI on any drift from the approved baseline. Diff-based review, not binary allow/deny.
- **Advise** — cross-check servers against a public, structured [MCP advisory database](/advisories/).

## Why this exists

MCP adoption exploded, and real incidents followed:

- **postmark-mcp** ([MCPA-2025-0002](/advisories/mcpa-2025-0002/)): a clean npm package turned malicious in a patch release, silently BCC'ing every email to an attacker domain — the textbook *rug-pull*.
- **mcp-remote RCE** ([MCPA-2025-0001](/advisories/mcpa-2025-0001/), CVE-2025-6514, CVSS 9.6): a malicious MCP server could execute arbitrary commands on any client that connected to it.
- **Azure MCP SSRF** ([MCPA-2026-0001](/advisories/mcpa-2026-0001/), CVE-2026-26118): privilege elevation in an official vendor MCP server.

MCP servers run with high trust inside agent toolchains, but the ecosystem has no equivalent of the package-manager security stack: no audit, no lockfile for the *tool surface*, no advisory feed. AgentGate fills that gap. See the [threat model](/docs/threat-model/) for a systematic treatment.

## How the loop fits together

```text
┌──────────┐   findings    ┌──────────────┐
│  scan     │ ────────────▶ │ report (JSON │──▶ report viewer / SARIF
│  +advise  │               │  /terminal)  │
└──────────┘               └──────────────┘
      │ approve
      ▼
┌──────────┐    baseline   ┌──────────────┐
│  lock     │ ────────────▶ │ agentgate    │
└──────────┘               │  .lock       │
      ▲                    └──────────────┘
      │ re-approve                │ compare on every CI run
      └────────── drift ◀── ┌──────────────┐
                            │ diff / ci    │──▶ non-zero exit on drift
                            └──────────────┘
```

1. `agentgate scan` finds your MCP servers (Claude, Cursor, VS Code, Codex, OpenCode config auto-discovery), analyzes them, and cross-checks the advisory database.
2. `agentgate lock` records the approved tool surface into `agentgate.lock` (SHA-256 over tool names, descriptions, and input schemas).
3. `agentgate ci` runs in CI: any drift between the live tool surface and the lockfile fails the build with a human-readable diff.

## Next steps

- [Quick start](/docs/quick-start/) — scanning and locking in five minutes.
- [CLI reference](/docs/cli/scan/) — every command and flag.
- [Lockfile specification](/docs/spec/lockfile/) — the `agentgate.lock` format.
