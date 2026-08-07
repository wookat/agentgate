# GAP-ROUND-95 — includeTools ↔ live tool surface correlation

Date: 2026-08-07

## Gap (round-92 leftover)

Round 92 only checked `includeTools` for *presence*. A typoed or stale
entry (`"clik"`, a tool renamed upstream) silently matched nothing: the
author believes the skill is scoped to specific tools, but that entry
scopes nothing — and the skill breaks when it tries to call the tool.
Nothing correlated the allowlist against what the server actually
exposes.

## Fix

New `checkIncludeToolsCoverage(server, tools)` in core (exported), wired
into `scan --live` after surfaces are gathered: each `includeTools`
entry is compiled as a `*`-glob and matched against the live tool names;
entries matching zero tools report one low AG-OP-001 finding listing the
dead entries. No allowlist, no surface, or full coverage → no finding.

## Evidence (real run)

Fixture skill declaring the e2e toy-server (tools `add`, `greet`) with
`includeTools: ["add", "gret"]`; `scan . --live --yes`:

```
AG-OP-001 low  includeTools entry "gret" on server "toy" matches none of
its 2 live tool(s) — stale or typoed allowlist entries scope nothing
```

`["add"]` alone reports nothing. Suite green: core 183 / cli 40 /
config-convert 21; build/lint/typecheck pass.

## Still open (honest)

- Only `scan --live` runs the correlation; `ci` compares lockfiles and
  does not spawn servers, so a stale allowlist won't fail the gate.
- Glob semantics are `*`-only (matching Amp's documented usage); no
  `?`/character classes.
