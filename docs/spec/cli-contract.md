# AgentGate CLI contract (v1)

This document freezes the machine-readable behavior of the `agentgate` CLI.
Route B/C consumers should rely only on what is documented here.

## Exit codes

| Code | Meaning |
| ---- | ------- |
| `0` | Success — no drift, and no findings at/above the `--fail-on` gate |
| `1` | Gate failure — tool-surface drift detected, findings at/above `--fail-on`, or (for `lock`) some server surfaces could not be captured |
| `2` | Usage / environment error — unknown flags, missing or unparseable explicit `--config`, missing or invalid/unsupported lockfile, target not found |

Warnings (unreachable optional servers, unparseable *discovered* configs) go
to **stderr** and do not affect the exit code. An explicit `--config` file
that cannot be parsed is fatal (`2`).

## `scan --format json` report (schema version 1)

```jsonc
{
  "version": 1,               // report schema version (frozen)
  "scannedAt": "ISO-8601",    // timestamp, not stable across runs
  "scannedServers": ["name"],
  "scannedFiles": ["path"],
  "findings": [
    {
      "ruleId": "AG-XX-000",
      "category": "tool-poisoning | credential-leak | overprivileged | auth-missing | ssrf | rce-vectors | supply-chain",
      "severity": "critical | high | medium | low",
      "message": "human-readable summary",
      "target": "server/tool/file the finding refers to",
      "file": "optional path",
      "line": 1,               // optional
      "detail": "optional extra context"
    }
  ],
  "warnings": ["string"]   // live-scan skips/declines, uninspected stdio servers
}
```

Findings are sorted by severity (critical first), then rule id, then target.
New *optional* fields may be added without a version bump; removing or
renaming fields, or changing semantics, requires bumping `version`.

## `deps --format json` report (schema version 1)

```jsonc
{
  "version": 1,               // report schema version (frozen)
  "scannedAt": "ISO-8601",    // timestamp, not stable across runs
  "scannedFiles": ["path"],   // manifests + source files that yielded references
  "dependencies": [
    {
      "name": "package name as written",
      "ecosystem": "npm | pypi",
      "origin": "manifest | import",
      "file": "path the reference came from"
    }
  ],
  "findings": [ /* same Finding shape as `scan`; ruleIds AG-DP-001..AG-DP-005, category supply-chain.
                   target is "<ecosystem>:<name>", with an " (import)" suffix for refs found
                   only in source imports */ ],
  "warnings": ["string"]      // offline-mode notice, unparseable-manifest warnings
}
```

`deps` exit codes follow the table above: `1` only when `--fail-on` is set and
met, `2` when the target directory does not exist. Registry lookup failures
degrade to `info`-severity findings and never fail the run by themselves.

## `diff --json` report

```jsonc
{
  "drifted": true,
  "entries": [
    {
      "kind": "server-added | server-removed | tool-added | tool-removed | description-changed | schema-changed",
      "server": "server name",
      "tool": "tool name (absent for server-level entries)",
      "detail": "human-readable description"
    }
  ]
}
```

## Diagnostics

`--debug` prints diagnostic details (config files parsed, servers contacted,
tool counts) to **stderr** only; stdout remains machine-readable.

## SARIF

`scan --format sarif` emits SARIF 2.1.0; severity maps to SARIF `level`
(`critical`/`high` → `error`, `medium` → `warning`, `low` → `note`).
