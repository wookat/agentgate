<div align="center">

# AgentGate

**Scan, lock, and gate your MCP servers — `npm audit` + lockfile + CI drift gate for the MCP era.**

[![CI](https://github.com/wookat/agentgate/actions/workflows/route-c.yml/badge.svg)](https://github.com/wookat/agentgate/actions)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node >= 22](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](package.json)
[![MCP](https://img.shields.io/badge/Model%20Context%20Protocol-compatible-8A2BE2)](https://modelcontextprotocol.io)

English | [简体中文](README.zh-CN.md)

</div>

---

AgentGate is an open-source trust & supply-chain gate for
[Model Context Protocol](https://modelcontextprotocol.io) servers. Real incidents already
happened — the postmark-mcp BCC backdoor, mcp-remote RCE (CVE-2025-6514, CVSS 9.6),
and silent upstream "rug pulls" that change tool descriptions your agent reads live.
Existing tools cover one corner each ([comparison](docs/COMPARISON.md)); AgentGate closes
the whole loop in one tool:

| Step | What it does |
|---|---|
| **Scan** | Static + opt-in live analysis of MCP servers: tool poisoning (hidden Unicode, prompt injection), credential leaks, SSRF/RCE vectors, over-privileged tool combos |
| **Lock** | Pin the exact tool surface (names, descriptions, input schemas) your agent sees into `agentgate.lock` — rug-pull defense |
| **Gate** | Fail CI on any drift from the approved baseline; diff-based review, not binary allow/deny |
| **Advise** | Cross-check servers against a [public, structured MCP advisory database](advisories/) |

## Quick start

```bash
# Scan the MCP configs on this machine (Claude, Cursor, VS Code, Codex, OpenCode auto-discovered)
npx agentgate scan

# Pin the current tool surface into agentgate.lock
npx agentgate lock

# In CI: exit non-zero if anything drifted from the lock
npx agentgate ci
```

> **Status:** under active development toward v0.1 — the CLI above is the committed
> interface ([PROPOSAL](docs/PROPOSAL.md) / [ROUTES](docs/ROUTES.md)). Watch/star the
> repo to catch the release.

## CI gate in one step

```yaml
# .github/workflows/mcp-gate.yml
steps:
  - uses: actions/checkout@v4
  - uses: wookat/agentgate/packages/action@main
    with:
      command: ci
```

See [packages/action](packages/action/) for SARIF upload to GitHub code scanning and all inputs.

Or as a pre-commit hook:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/wookat/agentgate
    rev: v0.1.0
    hooks:
      - id: agentgate-ci
```

## Config portability

Move your MCP server config between clients without retyping JSON/TOML by hand
(the official MCP 2026 roadmap names config portability as an open gap):

```bash
npx agentgate-config-convert --from cursor --to vscode --in .cursor/mcp.json --out .vscode/mcp.json
```

Supports Claude Desktop, Claude Code, Cursor, VS Code, Codex, and OpenCode, with
explicit warnings on any lossy conversion. See
[packages/config-convert](packages/config-convert/) — merging into the CLI as
`agentgate config convert`.

## Why not just use a scanner (or just a lockfile)?

Scanners find known-bad patterns *at scan time* but can't see an approved server that
quietly changes next week. Lockfiles catch drift but don't judge whether what you locked
was safe to begin with. AgentGate does both, plus cross-checks a public advisory DB.
The full, source-verified feature matrix vs mcp-scan (now Snyk Agent Scan), Cisco MCP
Scanner, MCTS, ToolPin, mcp-warden, and both mcp-locks: **[docs/COMPARISON.md](docs/COMPARISON.md)**.

## Repository layout

```
packages/cli/            # agentgate CLI (scan / lock / diff / ci)        [route A]
packages/core/           # rule engine, lockfile spec implementation     [route A]
packages/action/         # GitHub Action                                 [route C]
packages/config-convert/ # MCP client config converter                   [route C]
advisories/              # public MCP advisory database (structured JSON)[route B]
website/                 # docs site + report viewer (Cloudflare Pages)  [route B]
docs/                    # specs and project docs
```

## Contributing

PRs welcome. Cross-cutting interfaces (CLI JSON output, advisory schema, lockfile
schema) live in [docs/spec/](docs/spec/) — update the spec in the same PR as the code.

## License

[Apache-2.0](LICENSE)
