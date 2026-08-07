# GAP-ROUND-96 — `--fail-on never` everywhere; JetBrains verdict

Date: 2026-08-07

## Gap

Round 93 gave `deps` a `never` escape hatch when it gained a default
gate, leaving the three gate-capable commands inconsistent: `ci` (default
`high`) had no way to gate on drift *only* — teams that pin with
`lock --skills` and want drift-only CI had to accept the static-finding
gate or not use `ci` at all. `scan` accepted no `never` either.

## Fix

`--fail-on never` is now accepted by `scan` and `ci` too:

- `ci --fail-on never` — drift (and unreachable servers) still fail; the
  static-finding gate is disabled.
- `scan --fail-on never` — report only, explicit spelling of the default.

Docs updated (ci/scan option tables). Patch changeset (cli only).

## Evidence

- e2e: drifted toy-server under `ci --fail-on never` still exits 1;
  clean surface exits 0. `scan --fail-on never` on a plain-http config
  exits 0 while still reporting findings. Suite green:
  core 183 / cli 40 / config-convert 21 (new assertions live in the
  existing --fail-on and lock/diff/ci e2e tests).

## Research (this round)

- JetBrains AI Assistant MCP: official docs describe GUI-managed
  configuration only (Settings | Tools | AI Assistant | MCP, with
  "Import from Claude"); no documented on-disk config path. Third-party
  blogs claim `~/.config/JetBrains/AIAssistant/mcp.json`, but that is
  not official — not added, same policy as Warp's GUI-managed servers.
- Routine: advisory watch zero uncovered; competitors unchanged
  (mcp-scan 2.0.2, socket 1.1.154, snyk-agent-scan 0.5.16).
- Mobile visual check (375px) on homepage/deps/overprivileged pages:
  no horizontal overflow.

## Ops note (recurring friction)

The deploy workflow on main always skips: `CLOUDFLARE_API_TOKEN` repo
secret is not set, so every website/API deploy is done manually from the
dev box. Setting that secret would make main pushes self-deploying.

## Still open (honest)

- `ci` does not spawn servers, so the round-95 includeTools live
  correlation never runs in the gate.
- Distribution/adoption remains the largest non-code gap.
