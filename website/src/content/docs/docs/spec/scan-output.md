---
title: Scan output (JSON)
description: The agentgate scan --format json report format consumed by the report viewer.
---

`agentgate scan --format json` emits a single JSON document (a cross-route contract: route A emits it, the [report viewer](/report-viewer/) consumes it):

```json
{
  "version": 1,
  "scannedAt": "2026-08-03T12:00:00.000Z",
  "scannedServers": ["filesystem", "github", "remote-proxy"],
  "scannedFiles": ["~/.claude.json", "~/.cursor/mcp.json"],
  "findings": [
    {
      "ruleId": "AG-SC-001",
      "category": "supply-chain",
      "severity": "medium",
      "message": "Server \"docs-helper\" runs unpinned package \"docs-helper-mcp\" — every launch fetches whatever is latest…",
      "target": "docs-helper",
      "file": "~/.claude.json"
    }
  ],
  "warnings": ["live scan skipped for \"notes\": connect timeout"]
}
```

## Top-level fields

| Field | Required | Description |
|---|---|---|
| `version` | yes | Report format version (this page: `1`). |
| `scannedAt` | yes | ISO-8601 timestamp. |
| `scannedServers` | yes | Names of MCP servers that were analyzed. |
| `scannedFiles` | yes | Config/source files that were read. |
| `findings[]` | yes | Sorted by severity (critical first). May be empty. |
| `warnings[]` | yes | Non-fatal issues (e.g. a live connection that failed). May be empty. |

## Finding

| Field | Required | Description |
|---|---|---|
| `ruleId` | yes | Rule that fired, e.g. `AG-TP-001` — see the [rule reference](/docs/rules/). |
| `category` | yes | `tool-poisoning`, `credential-leak`, `overprivileged`, `auth-missing`, `ssrf`, `rce-vectors`, or `supply-chain`. |
| `severity` | yes | `critical`, `high`, `medium`, `low`, or `info`. |
| `message` | yes | Human-readable explanation, including remediation where applicable. |
| `target` | yes | Server name (optionally `server/tool`) or file the finding applies to. |
| `file` | no | File location, when the finding came from a config or source file. |
| `line` | no | Line number within `file`. |
| `detail` | no | Extra structured detail. |

## Consumers

- The [report viewer](/report-viewer/) renders any conforming document client-side (nothing is uploaded).
- SARIF output (`--format sarif`) is a projection of the same findings for GitHub code scanning.
