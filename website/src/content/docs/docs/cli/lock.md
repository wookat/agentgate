---
title: agentgate lock
description: Pin the approved MCP tool surface into agentgate.lock.
---

Record the current, reviewed tool surface of your MCP servers into [`agentgate.lock`](/docs/spec/lockfile/).

```bash
agentgate lock [options]
```

For every configured server, AgentGate captures a SHA-256 hash over each tool's **name, description, and input schema** — the three fields an upstream rug-pull would mutate. The lockfile is deterministic (sorted keys, canonical JSON) so diffs stay minimal and reviewable.

## Options

| Flag | Default | Description |
|---|---|---|
| `--lockfile <file>` | `agentgate.lock` | Lockfile path. |
| `--live` | off | Hash the live tool surface (stdio handshake) instead of static definitions. |
| `--server <name>` | all | Re-lock only the named server (repeatable). Other entries are preserved. |

## Workflow

```bash
agentgate scan            # review findings first
agentgate lock            # approve the current surface
git add agentgate.lock
git commit -m "Lock MCP tool surface"
```

When `agentgate ci` later reports drift you intended (e.g. a server upgrade adds a tool), re-run `agentgate lock` to re-approve, and review the lockfile diff in the PR like you would a `package-lock.json` change.
