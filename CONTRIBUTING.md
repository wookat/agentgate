# Contributing to AgentGate

Thanks for your interest in making MCP usage safer. All contributions — bug reports,
advisories, docs, code — are welcome.

## Ground rules

- Be respectful; we follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- **Security vulnerabilities in AgentGate itself:** do NOT open a public issue — see
  [SECURITY.md](SECURITY.md) (or GitHub private vulnerability reporting).
- **New MCP advisories** (a malicious/vulnerable MCP server you found): open a PR
  against `advisories/` following the schema there, with public sources.

## Development setup

Requires Node.js >= 22 and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/wookat/agentgate.git
cd agentgate
pnpm install
pnpm build
pnpm test        # all workspace tests
pnpm lint        # eslint
pnpm typecheck
```

The repo is a pnpm workspace:

| Package | What it is |
|---|---|
| `packages/core` | rule engine + lockfile implementation |
| `packages/cli` | the `agentgate` CLI |
| `packages/action` | GitHub Action wrapper |
| `packages/config-convert` | MCP client config converter |
| `advisories/` | public advisory database |
| `website/` | docs site + report viewer |

## Making changes

1. Fork and create a topic branch from `main`.
2. Keep PRs small and focused; one logical change per PR.
3. Add or update tests for any behavior change. CI must be green
   (`pnpm build && pnpm lint && pnpm typecheck && pnpm test` locally reproduces it).
4. **Cross-cutting interfaces** (CLI JSON output, lockfile schema, advisory schema,
   config-convert contract) are specified in [docs/spec/](docs/spec/) — update the spec
   in the same PR as the code.
5. Follow the existing code style (enforced by ESLint); no new runtime dependencies
   without discussion in an issue first.
6. Write commit messages in imperative mood; reference issues (`Fixes #123`).

## Adding or changing scan rules

Scan rules live in `packages/core`. A rule PR should include:

- the rule implementation + unit tests with true-positive and false-positive fixtures;
- a severity rationale (link to a real incident or advisory if possible);
- docs for the rule ID in the rules reference.

## Release process

Releases are cut by maintainers from `main` (see [GOVERNANCE.md](GOVERNANCE.md)).
Every PR should note user-visible changes in its description so release notes can be
generated from merged PR titles.
