# AgentGate

> Scan, lock, and gate your MCP servers — `npm audit` + lockfile + CI drift gate for the MCP era.

AgentGate is an open-source trust & supply-chain gate for [Model Context Protocol](https://modelcontextprotocol.io) servers. One tool that covers the full loop:

- **Scan** — static + live analysis of MCP servers: tool poisoning (hidden Unicode, prompt injection), credential leaks, SSRF/RCE vectors, over-privileged tool combos.
- **Lock** — pin the exact tool surface (names, descriptions, input schemas) your agent sees into `agentgate.lock`, defending against upstream rug-pulls.
- **Gate** — fail CI on any drift from the approved baseline; diff-based review, not binary allow/deny.
- **Advise** — cross-check servers against a public, structured MCP advisory database.

## Status

Under active development. See [docs/PROPOSAL.md](docs/PROPOSAL.md) and [docs/ROUTES.md](docs/ROUTES.md) for the plan.

## Repository layout (planned)

```
packages/cli/        # agentgate CLI (scan / lock / diff / ci)
packages/core/       # rule engine, lockfile spec implementation
packages/action/     # GitHub Action
advisories/          # public MCP advisory database (structured JSON)
website/             # docs site + report viewer (Cloudflare Pages)
docs/                # specs and project docs
```

## License

Apache-2.0
