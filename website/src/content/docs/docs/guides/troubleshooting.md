---
title: Troubleshooting
description: Common AgentGate errors and how to fix them.
---

## `scan` finds no servers

Auto-discovery reads the standard config paths of Claude Desktop, Claude Code, Cursor, VS Code, Codex, OpenCode, Windsurf, Cline, Gemini CLI, Kiro, Roo Code, Zed, Continue.dev, Amp, Warp, and `.agents/.mcp.json` in your home directory.

- Running in CI, a container, or as another user? The home directory is different — pass `--config path/to/config` explicitly.
- Project-scoped configs (e.g. `.mcp.json`, `.cursor/mcp.json`) are picked up when you pass the project directory: `agentgate scan .`.

## `live scan skipped for "…": connect timeout`

The stdio server didn't complete the MCP handshake within the timeout (default 15 s).

- First launch often downloads the package (`npx`/`uvx`); warm the cache or raise `--timeout 60000`.
- Run the server's command from the config manually to see its real startup error.
- Missing runtime (`uvx`, `docker`, `node`) on the machine running the scan is the most common cause in CI.

These warnings don't fail the scan; they're listed in the report's `warnings` array.

## `live scan skipped for "…"` on a remote (`url`) server

Remote servers are contacted via Streamable HTTP, then SSE for legacy servers.

- **HTTP 401/403** — the endpoint requires credentials. For OAuth servers, run `agentgate auth login <server-name>` once (opens a browser; tokens are cached outside the project tree and picked up by live scans automatically). Alternatively add a static token under `headers` in the server config: `"headers": { "Authorization": "Bearer …" }` — configured headers take precedence over cached OAuth tokens. CI stays non-interactive: use static headers or pre-provisioned tokens there.
- **Network errors** — the machine running the scan needs egress to the endpoint; corporate proxies and CI egress rules are the usual culprits.
- The error always includes the server's own response text — read it first.

## `diff`/`ci` exits 2 with a lockfile error

- **Missing lockfile** — run [`agentgate lock`](/docs/cli/lock/) first and commit `agentgate.lock`; in CI pass `--lockfile` if it lives elsewhere.
- **Unknown `lockfileVersion`** — the lockfile was written by a newer AgentGate; upgrade the CLI.

## `diff` reports drift I expected

Intentional upgrade? Re-approve the new surface:

```bash
agentgate diff        # read what changed first
agentgate lock        # rewrite the baseline
```

Review the lockfile diff in the PR — that reviewability is the point.

## Gate passes locally but fails in CI

- CI auto-discovers the *runner's* configs, not yours — always pass `--config` in CI.
- Servers may expose different tools per environment (feature flags, credentials present/absent). Lock from an environment equivalent to the one you gate in, or restrict with `--server`.

## JSON report won't load in the report viewer

The viewer requires a `findings` array ([scan output spec](/docs/spec/scan-output/)). Make sure you exported with `--format json` (not the default table), and that the file isn't SARIF (`--format sarif` output is for GitHub code scanning).

## Advisory lookups and offline use

Scanning works fully offline; advisory cross-checks degrade gracefully when the [advisory API](/docs/spec/advisory-api/) is unreachable (a warning, not a failure).

Still stuck? [Open an issue](https://github.com/wookat/agentgate/issues) with the command, the full output, and your (redacted) config.
