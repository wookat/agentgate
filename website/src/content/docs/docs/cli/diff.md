---
title: agentgate diff
description: Compare the current MCP tool surface against agentgate.lock.
---

Show what changed between the current tool surface and the locked baseline — without failing.

```bash
agentgate diff [options]
```

Use `diff` interactively to understand drift; use [`agentgate ci`](/docs/cli/ci/) in pipelines to enforce it.

## Options

| Flag | Default | Description |
|---|---|---|
| `--lockfile <file>` | `agentgate.lock` | Lockfile path. |
| `--live` | off | Diff against the live tool surface. |
| `--format <fmt>` | `text` | `text` (human-readable) or `json`. |

## Output

The human-readable diff highlights, per server and per tool:

- **added** — tools not present when the lock was taken.
- **removed** — locked tools that disappeared.
- **changed** — hash mismatch on name/description/input schema, with a field-level breakdown when static definitions are available.

A changed *description* is highlighted specially: it is the most common prompt-injection vector (see [threat model](/docs/threat-model/)).
