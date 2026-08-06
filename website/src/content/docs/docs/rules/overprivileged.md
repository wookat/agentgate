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

**Configuration** (`--live`, `AG-TF-001`): the agent sees every configured server's tools in one namespace, so the same analysis runs *across* servers. A tool that reads private data (files, notes, email, repos) on one server plus a tool that sends data out (email, Slack, webhooks) on another is an exfiltration flow (`medium`); if a third tool ingests untrusted external content (web pages, issues, feeds) the toxic flow is complete — poisoned content can drive the other two — and severity is `high`.

## Agent skill grants (AG-SK-002)

Repo scans also check agent skill files (`SKILL.md`) and slash-command /
agent markdown (under `skills/`, `commands/`, or `agents/` of `.claude`-style
config trees and Claude Code plugins) for frontmatter that pre-approves
dangerous tool access via `allowed-tools` (inline, YAML list, or flow-list
form). An unscoped `Bash`
grant lets the skill run any shell command without a permission prompt
(`high`); unscoped `Write`/`Edit` (`medium`) and `WebFetch`/`WebSearch`
(`medium`, an exfiltration channel) are also flagged. Scoped grants such as
`Bash(git add *)` and read-only tools are fine.

## Why it matters

Individually harmless tools compose into an exfiltration pipeline the moment a poisoned description (see [AG-TP-001](/docs/rules/tool-poisoning/)) chains them. Least privilege at the server level is the mitigation that still works when prompt-level defenses fail.

## Fixing findings

- Scope filesystem servers to the specific project directories the agent needs.
- Split multi-purpose servers, or disable tools you don't use.
- Never launch agent tooling with permission-bypass flags in shared configs.
