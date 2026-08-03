---
title: Scan output (JSON)
description: The agentgate scan --format json report format consumed by the report viewer.
---

:::caution[Draft]
Cross-route interface (route A emits, route B's [report viewer](/report-viewer/) consumes). Canonical copy in [`docs/spec/`](https://github.com/wookat/agentgate/tree/main/docs/spec); changes are coordinated in PRs per `docs/ROUTES.md`.
:::

`agentgate scan --format json` emits a single JSON document:

```json
{
  "$schema": "https://agentgate-1ep.pages.dev/schemas/scan-report.v1.json",
  "reportVersion": 1,
  "agentgateVersion": "0.1.0",
  "generatedAt": "2026-08-03T12:00:00Z",
  "target": { "kind": "auto-discovery", "paths": ["~/.claude.json"] },
  "summary": { "critical": 1, "high": 2, "medium": 0, "low": 1, "total": 4 },
  "findings": [
    {
      "id": "F-0001",
      "rule": "advisory-match",
      "category": "supply-chain",
      "severity": "critical",
      "title": "mcp-remote 0.1.10 matches advisory MCPA-2025-0001 (CVE-2025-6514)",
      "description": "OS command injection when connecting to untrusted MCP servers…",
      "server": {
        "name": "remote-proxy",
        "package": "mcp-remote",
        "version": "0.1.10",
        "ecosystem": "npm",
        "transport": "stdio"
      },
      "evidence": { "configPath": "~/.claude.json", "snippet": "…" },
      "advisoryIds": ["MCPA-2025-0001"],
      "remediation": "Upgrade to mcp-remote >= 0.1.16."
    }
  ]
}
```

## Fields

| Field | Required | Description |
|---|---|---|
| `reportVersion` | yes | Integer format version (this page: `1`). |
| `agentgateVersion` | yes | CLI version. |
| `generatedAt` | yes | ISO-8601 UTC. |
| `target` | yes | What was scanned: `kind` (`auto-discovery` \| `config` \| `package`), `paths`. |
| `summary` | yes | Finding counts by severity plus `total`. Must equal the aggregate of `findings`. |
| `findings[]` | yes | May be empty. |

### Finding

| Field | Required | Description |
|---|---|---|
| `id` | yes | Stable within a report (`F-nnnn`). |
| `rule` | yes | Machine ID of the rule that fired (e.g. `advisory-match`, `hidden-unicode`). |
| `category` | yes | One of the shared categories: `tool-poisoning`, `credential-leak`, `overprivileged`, `auth-missing`, `ssrf`, `rce-vectors`, `supply-chain`. |
| `severity` | yes | `critical` \| `high` \| `medium` \| `low`. |
| `title` | yes | One line, human-readable. |
| `description` | yes | Full explanation (Markdown allowed). |
| `server` | yes | `name` required; `package`, `version`, `ecosystem`, `transport` when known. |
| `evidence` | no | Rule-specific: `configPath`, `toolName`, `snippet`, … |
| `advisoryIds` | no | Matching [advisory database](/advisories/) IDs. |
| `remediation` | no | Actionable fix. |

## Consumers

- The [report viewer](/report-viewer/) renders any conforming document client-side (nothing is uploaded).
- SARIF output (`--format sarif`) is a lossy projection of the same findings for GitHub code scanning.
