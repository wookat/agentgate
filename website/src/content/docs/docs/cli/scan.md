---
title: agentgate scan
description: Static and live analysis of MCP servers with advisory cross-checking.
---

Analyze MCP servers for security issues and cross-check them against the [advisory database](/advisories/).

```bash
agentgate scan [paths...] [options]
```

Without arguments, AgentGate auto-discovers MCP server configurations from common client config locations (Claude Desktop, Claude Code, Cursor, VS Code, Codex, OpenCode). Pass explicit config paths or package directories to scan those instead.

## Modes

| Mode | What it does |
|---|---|
| static (default) | Inspects client configs and server packages on disk: manifest, tool definitions, source heuristics. Never executes server code. |
| `--live` | Additionally launches each stdio server in an isolated process, performs the MCP handshake, and inspects the tool surface the server *actually* exposes. Explicit opt-in because it runs server code. |

## Options

| Flag | Default | Description |
|---|---|---|
| `--live` | off | Enable connection-based scanning (stdio handshake). |
| `--format <fmt>` | `table` | Output format: `table`, `json`, `sarif`. JSON follows the [scan output spec](/docs/spec/scan-output/). |
| `--output <file>` | stdout | Write the report to a file. |
| `--no-advisories` | — | Skip the advisory database cross-check (offline mode). |
| `--advisory-api <url>` | public API | Override the [advisory API](/docs/spec/advisory-api/) endpoint. |
| `--severity <level>` | `low` | Minimum severity to report: `low`, `medium`, `high`, `critical`. |
| `--fail-on <level>` | `high` | Exit non-zero if any finding is at or above this severity. Use `never` to always exit 0. |

## Rule categories

Findings are classified into categories shared with the advisory schema:

- `tool-poisoning` — hidden Unicode, prompt injection in tool names/descriptions.
- `credential-leak` — tokens or secrets exposed in configs, env blocks, or tool output paths.
- `overprivileged` — dangerous tool combinations (e.g. file write + network egress).
- `auth-missing` — servers or proxies reachable without authentication.
- `ssrf` — server-side request forgery vectors.
- `rce-vectors` — inputs that reach shell/exec sinks.
- `supply-chain` — advisory matches, typosquats, unpinned or withdrawn packages.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | No findings at or above the `--fail-on` threshold. |
| 1 | Findings at or above the threshold. |
| 2 | Scan error (bad config, unreachable server in `--live` mode). |
