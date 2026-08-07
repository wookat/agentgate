---
title: agentgate scan
description: Static and live analysis of MCP servers with twelve built-in rules across seven categories.
---

Scan MCP servers for security issues.

```bash
agentgate scan [target] [options]
```

Without a target, AgentGate auto-discovers MCP client configs (Claude Desktop, Claude Code, Cursor, VS Code, Codex, OpenCode, Windsurf, Cline, Gemini CLI, Kiro, Roo Code, Zed, Continue.dev, Amp, Warp). Pass a directory to also run a repo/source scan over it, or a config file to scan just that config.

## Modes

| Mode | What it does |
|---|---|
| static (default) | Analyzes client configs and (for a directory target) source files. Never executes server code. |
| `--live` | Additionally connects to each server — stdio (spawned locally) or remote `url` (Streamable HTTP, with SSE fallback for legacy servers) — performs the MCP handshake, and analyzes the tool surface the server *actually* exposes. Explicit opt-in because it runs server code / contacts remote endpoints. |

Scanning a config means *starting the commands it names*, so `--live` first
prints every command it is about to run and asks for confirmation. In a
non-interactive session (CI, piped output) nothing is started unless you pass
`--yes`. Remote `url` servers are not spawned locally, so they don't need
spawn consent; configured `headers` are sent with each request. A static scan
that skips servers says so — it warns that their live tool surface was not
inspected rather than reporting a clean bill.

## Options

| Flag | Default | Description |
|---|---|---|
| `--live` | off | Connect to stdio and remote servers and analyze their live tool surface. |
| `-y, --yes` | off | With `--live`, start the configured stdio servers without asking for confirmation (required in CI). |
| `-c, --config <file>` | auto-discover | Explicit MCP client config file (skips auto-discovery). Codex `config.toml` and OpenCode `opencode.json` are also understood. |
| `-s, --server <names...>` | all | Restrict to specific server names. |
| `-f, --format <format>` | `table` | Output format: `table`, `json`, `sarif`. JSON follows the [scan output spec](/docs/spec/scan-output/). |
| `-o, --output <file>` | stdout | Write the report to a file. |
| `--fail-on <severity>` | off | Exit non-zero when findings reach this severity: `info`, `low`, `medium`, `high`, `critical` (`never` = report only). |
| `-t, --timeout <ms>` | `15000` | Per-server connect timeout for `--live`. |

## Examples

```bash
agentgate scan                                  # audit everything your clients are configured to run
agentgate scan --live                           # also audit the live tool surface (asks before starting servers)
agentgate scan --live --yes                     # same, unattended (CI)
agentgate scan --format json -o report.json     # machine-readable report (open it in the report viewer)
agentgate scan --format sarif -o report.sarif   # for GitHub code scanning
agentgate scan path/to/repo                     # source-level scan of an MCP server repo
agentgate scan -c ~/.cursor/mcp.json --fail-on high
```

## Rules

Findings come from twelve rules across seven categories — see the [rule reference](/docs/rules/) for what each detects: `tool-poisoning` (including agent skill files), `credential-leak`, `overprivileged` (including skill `allowed-tools` grants), `auth-missing`, `ssrf`, `rce-vectors` (including skill dynamic-context commands), `supply-chain`.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | No findings at or above the `--fail-on` threshold (or no `--fail-on` given). |
| 1 | Findings at or above the threshold. |
| 2 | Execution error (bad target, unreadable config). |
