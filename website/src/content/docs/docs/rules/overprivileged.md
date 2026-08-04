---
title: "AG-OP-001 · overprivileged"
description: Dangerous capability combinations and overly broad filesystem grants.
---

Detects servers whose combined tool surface enables exfiltration-class behavior, and filesystem servers granted far more than they need.

## What it checks

**Config** (static):

- Filesystem servers rooted at `/`, `/home`, `/Users`, `~`, or `C:\` (`high`) — the agent can read everything you own.
- Permission-bypass launch flags such as `--dangerously-skip-permissions` / `--yolo` (`high`).

**Toolset** (`--live`): tool names/descriptions/schemas are classified into capabilities (`read-files`, `write-files`, `exec`, `network`, `send-messages`). Dangerous combinations on one server are flagged at `medium`:

| Combination | Risk |
|---|---|
| read-files + network | read local files and exfiltrate them over the network |
| read-files + send-messages | read local files and exfiltrate them via messages/email |
| exec + network | download-and-run |

## Why it matters

Individually harmless tools compose into an exfiltration pipeline the moment a poisoned description (see [AG-TP-001](/docs/rules/tool-poisoning/)) chains them. Least privilege at the server level is the mitigation that still works when prompt-level defenses fail.

## Fixing findings

- Scope filesystem servers to the specific project directories the agent needs.
- Split multi-purpose servers, or disable tools you don't use.
- Never launch agent tooling with permission-bypass flags in shared configs.
