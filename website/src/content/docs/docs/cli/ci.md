---
title: agentgate ci
description: Fail CI on drift from the approved MCP baseline or on severe findings.
---

The gate: fail on tool-surface drift from [`agentgate.lock`](/docs/spec/lockfile/) **or** on static findings at/above a severity threshold.

```bash
agentgate ci [options]
```

`ci` = `diff` + `scan --fail-on`, designed for pipelines: concise output and deterministic exit codes.

## Options

| Flag | Default | Description |
|---|---|---|
| `-c, --config <file>` | auto-discover | Explicit MCP client config file. |
| `-s, --server <names...>` | all | Restrict to specific server names. |
| `-l, --lockfile <file>` | `agentgate.lock` | Lockfile path. |
| `--skills [dir]` | `.` | Directory to re-hash locked skill files from (only used when the lockfile pinned skills). |
| `--fail-on <severity>` | `high` | Severity gate for static findings: `info`, `low`, `medium`, `high`, `critical`. |
| `-t, --timeout <ms>` | `15000` | Per-server connect timeout. |

## Exit codes

| Code | Meaning |
|---|---|
| 0 | No drift and no findings at/above the threshold. |
| 1 | Drift detected, or findings at/above the threshold. |
| 2 | Execution error (missing lockfile, unreachable server). |

## GitHub Actions annotations

When running under GitHub Actions (`GITHUB_ACTIONS=true`), `ci`, `scan`, and
`deps` (table format) additionally emit one [workflow-command annotation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#setting-an-error-message)
per finding — `critical`/`high` as errors, `medium` as warnings, `low`/`info`
as notices — so findings with a file and line surface inline on the PR diff.
`ci` also emits one error annotation per lockfile drift entry; skill drift
entries carry the changed file's path, landing directly on the PR diff.
JSON and SARIF output is never mixed with annotations.

## CI integration

```yaml
- run: npx mcp-agentgate ci --fail-on high
```

Full per-platform recipes (GitHub Actions, GitLab CI, CircleCI, Jenkins, Azure Pipelines): [CI integration guide](/docs/guides/ci/).
