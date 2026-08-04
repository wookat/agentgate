---
title: agentgate lock
description: Pin the approved MCP tool surface into agentgate.lock.
---

Connect to your configured MCP servers and pin the tool surface they expose into [`agentgate.lock`](/docs/spec/lockfile/).

```bash
agentgate lock [options]
```

For every tool, AgentGate records SHA-256 hashes of its **name, description, and input schema** — the three fields an upstream rug-pull would mutate. The lockfile is deterministic (tools sorted by name, canonical JSON hashing) so diffs stay minimal and reviewable.

## Options

| Flag | Default | Description |
|---|---|---|
| `-c, --config <file>` | auto-discover | Explicit MCP client config file. |
| `-s, --server <names...>` | all | Restrict to specific server names. |
| `-o, --out <file>` | `agentgate.lock` | Lockfile path. |
| `-t, --timeout <ms>` | `15000` | Per-server connect timeout. |

## Workflow

```bash
agentgate scan --live     # review findings first
agentgate lock            # approve the current surface
git add agentgate.lock
git commit -m "Lock MCP tool surface"
```

When [`agentgate diff`](/docs/cli/diff/) later reports drift you intended (e.g. a server upgrade adds a tool), re-run `agentgate lock` to re-approve, and review the lockfile diff in the PR like you would a `package-lock.json` change.
