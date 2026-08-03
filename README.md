# AgentGate

> Scan, lock, and gate your MCP servers — `npm audit` + lockfile + CI drift gate for the MCP era.

AgentGate is an open-source trust & supply-chain gate for [Model Context Protocol](https://modelcontextprotocol.io) servers. One tool that covers the full loop:

- **Scan** — static + live analysis of MCP servers: tool poisoning (hidden Unicode, prompt injection), credential leaks, SSRF/RCE vectors, over-privileged tool combos.
- **Lock** — pin the exact tool surface (names, descriptions, input schemas) your agent sees into `agentgate.lock`, defending against upstream rug-pulls.
- **Gate** — fail CI on any drift from the approved baseline; diff-based review, not binary allow/deny.
- **Advise** — cross-check servers against a public, structured MCP advisory database.

## Quick start

Requires Node.js >= 22 and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/wookat/agentgate.git
cd agentgate
pnpm install
pnpm build

alias agentgate="node $PWD/packages/cli/dist/index.js"
```

Scan every MCP server your clients (Claude Desktop / Claude Code / Cursor / VS Code / Codex / OpenCode) are configured to use — config paths are discovered automatically:

```bash
agentgate scan                 # static config analysis, terminal table
agentgate scan --live          # also connect to stdio servers and audit their live tool surface
agentgate scan --format json   # machine-readable report
agentgate scan --format sarif -o report.sarif   # for GitHub code scanning
agentgate scan path/to/repo    # scan an MCP server repo for source-level issues
```

Pin the tool surface your agent sees, then gate on drift:

```bash
agentgate lock                 # connect to configured servers, write agentgate.lock
agentgate diff                 # exit 1 + human-readable diff if any tool name/description/schema changed
agentgate ci --fail-on high    # CI gate: drift OR high-severity findings → non-zero exit
```

Point at a specific config instead of auto-discovery with `--config path/to/mcp.json` (Codex `config.toml` and OpenCode `opencode.json` are also understood).

### What `scan` checks

Seven rule categories, aligned with real-world MCP incidents: `tool-poisoning` (hidden Unicode, prompt injection), `credential-leak`, `overprivileged` (dangerous capability combos), `auth-missing`, `ssrf`, `rce-vectors`, `supply-chain` (unpinned `npx -y pkg@latest` rug-pull exposure).

The lockfile format is specified in [docs/spec/agentgate.lock.schema.json](docs/spec/agentgate.lock.schema.json).

## Status

Under active development. See [docs/PROPOSAL.md](docs/PROPOSAL.md) and [docs/ROUTES.md](docs/ROUTES.md) for the plan.

## Repository layout

```
packages/cli/        # agentgate CLI (scan / lock / diff / ci)
packages/core/       # rule engine, lockfile spec implementation
packages/action/     # GitHub Action (planned, route C)
advisories/          # public MCP advisory database (planned, route B)
website/             # docs site + report viewer (planned, route B)
docs/                # specs and project docs
```

## License

Apache-2.0
