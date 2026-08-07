# GAP-ROUND-105 — Parallel live gathering (scan --live / lock / diff / ci)

Date: 2026-08-07 · Round type: performance (measured)

## What was found

`gatherSurfaces` connected to servers strictly one at a time. With several
stdio servers (each paying `npx`/`uvx` startup) or several remote servers
(each paying network round-trips), total live time grew linearly. Real
measurement, 6 stdio servers with 500 ms startup each (0.21.0):

```
npx mcp-agentgate@0.21.0 lock --config mcp.json   → 4.2 s
```

## Fix

`packages/cli/src/context.ts`: `gatherSurfaces` now uses a small worker pool
(concurrency 4). Results are stored by index so server ordering — and
therefore lockfile output — is unchanged; per-server errors are still
collected individually.

## Verification (real runs)

- Same 6-server config, local build after the change: **4.2 s → 1.6 s**.
- Lockfile byte-identical to the sequential one (compared ignoring
  `generatedAt`).
- Full suite green: build/lint/typecheck, 188 core / 41 cli / 21
  config-convert (includes the stdio + remote e2e tests).

## Limitations

- Concurrency is a fixed 4 (not configurable); avoids spawning dozens of
  processes at once on machines with many configured servers.
- Consent semantics unchanged — stdio servers are still only started after
  the `--live` prompt/`--yes`.
