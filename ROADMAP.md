# Roadmap

Public, direction-level roadmap. Concrete work is tracked in
[issues](https://github.com/wookat/agentgate/issues) and
[docs/spec/](docs/spec/); this file states priorities, not promises.
Last updated: 2026-08.

## Now (v0.1 line — shipping)

- `agentgate scan` / `lock` / `diff` / `ci` stable across the six supported
  clients (Claude Desktop, Claude Code, Cursor, VS Code, Codex, OpenCode)
- Lockfile schema v1 frozen ([docs/spec/agentgate.lock.schema.json](docs/spec/agentgate.lock.schema.json))
- npm publish with provenance; GitHub Action + pre-commit hooks wired to the
  published CLI
- Public advisory database with community submission flow
- Docs site at https://agentgate.zalize.com (guides, rule reference, report viewer)

## Next (v0.2)

- `agentgate config convert` merged into the CLI (from `packages/config-convert`)
- Deeper live scanning: resources/prompts surface pinning, not just tools
- More rule coverage driven by real advisories; per-rule docs with incident links
- Watch mode / `agentgate diff --baseline` for non-CI review workflows
- SARIF polish and GitHub code-scanning recipes for GitLab/Buildkite/CircleCI

## Later (exploring)

- Signed lockfiles and advisory feed (sigstore)
- Registry integrations: check servers against MCP registries at install time
- Policy packs: org-level allow/deny/severity policies shared across repos
- Runtime complement: recommendations for pairing AgentGate with MCP gateways
  (runtime enforcement is explicitly out of scope for AgentGate itself)

## Non-goals

- Being a runtime proxy/gateway (we gate before the agent runs, not during)
- Closed-source or paid-only features: the scanner, lockfile, and advisory DB
  stay open source

Suggest changes by opening an issue with the `roadmap` label.
