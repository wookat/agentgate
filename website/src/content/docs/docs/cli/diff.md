---
title: agentgate diff
description: Compare the current MCP tool surface against agentgate.lock.
---

Compare the live tool surface against the locked baseline; exit 1 on drift.

```bash
agentgate diff [options]
```

Use `diff` interactively to inspect drift; use [`agentgate ci`](/docs/cli/ci/) in pipelines to combine the drift gate with a findings gate.

## Options

| Flag | Default | Description |
|---|---|---|
| `-c, --config <file>` | auto-discover | Explicit MCP client config file. |
| `-s, --server <names...>` | all | Restrict to specific server names. |
| `-l, --lockfile <file>` | `agentgate.lock` | Lockfile path. |
| `--json` | off | Output the drift report as JSON. |
| `-t, --timeout <ms>` | `15000` | Per-server connect timeout. |

## Output

The drift report shows, per server and per tool:

- **added** — tools not present when the lock was taken.
- **removed** — locked tools that disappeared.
- **changed** — which of name / description / input schema drifted (hash mismatch).

A changed *description* deserves special suspicion: it is the most common prompt-injection vector (see [threat model](/docs/threat-model/)).

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Tool surface matches the lockfile. |
| 1 | Drift detected. |
| 2 | Execution error (missing lockfile, unreachable server). |
