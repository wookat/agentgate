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
      "kind": "server-added | server-removed | tool-added | tool-removed | description-changed | schema-changed | skill-added | skill-removed | skill-changed",
      "server": "server name (\"(skills)\" for skill-* entries)",
      "tool": "tool name (absent for server-level entries)",
      "file": "skill file path (skill-* entries only)",
      "detail": "human-readable description"
    }
  ]
}
```

## `advisory check --json` report

```jsonc
{
  "package": { "ecosystem": "npm | pypi | null", "name": "pkg", "version": "1.2.3" }, // null when -e omitted (both checked); version null when omitted
  "source": "live | bundled",   // "bundled" when --offline or the advisory API is unreachable
  "matches": [
    {
      "ecosystem": "npm | pypi", // the ecosystem this match came from
      "versionConfirmed": true, // false when no version was given and the advisory has fixed ranges
      "advisory": { "id": "MCPA-YYYY-NNNN", /* ... McpaAdvisory ... */ }
    }
  ]
}
```

Exit code `1` when `matches` is non-empty, `0` when clean — so
`agentgate advisory check <pkg>@<version>` works as a pre-install gate.
`advisory list --json` emits `{ "source", "count", "advisories": [...] }`,
sorted newest-first by id.

## Diagnostics

`--debug` prints diagnostic details (config files parsed, servers contacted,
tool counts) to **stderr** only; stdout remains machine-readable.

## SARIF

`scan --format sarif` emits SARIF 2.1.0; severity maps to SARIF `level`
(`critical`/`high` → `error`, `medium` → `warning`, `low` → `note`).
