---
title: agentgate ci
description: Fail CI on any drift from the approved MCP baseline.
---

The gate: compare the current tool surface against [`agentgate.lock`](/docs/spec/lockfile/) and exit non-zero on any drift.

```bash
agentgate ci [options]
```

`ci` is `diff` with teeth — same comparison, but designed for pipelines: concise output, deterministic exit codes, and an optional scan step.

## Options

| Flag | Default | Description |
|---|---|---|
| `--lockfile <file>` | `agentgate.lock` | Lockfile path. |
| `--live` | off | Verify the live tool surface (recommended in CI for stdio servers). |
| `--scan` | off | Also run a full `scan` and apply its `--fail-on` threshold. |
| `--format <fmt>` | `text` | `text` or `json` (for annotating PRs). |

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Tool surface matches the lockfile (and scan passed, if `--scan`). |
| 1 | Drift detected, or scan findings above threshold. |
| 2 | Execution error (missing lockfile, unreachable server). |

## GitHub Actions

```yaml
- run: npx agentgate ci --live --scan
```

A dedicated GitHub Action (route C) wraps this command with annotations and PR comments.
