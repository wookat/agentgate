# GAP-ROUND-187 — URL env-default resolution for AG-AM-001

Date: 2026-08-08 · Round type: precision improvement (round-184 corpus follow-up)

## Problem

Round-184 surfaced a real config shape: plugin MCP servers whose URL uses a
shell parameter-expansion default, e.g.
`${TLSRADAR_BASE_URL:-https://tlsradar.com}/api/v1/mcp`
(davepoon/buildwithclaude, tlsradar plugin). `new URL()` fails on the
literal string, so AG-AM-001 could only emit an "unparseable URL" low
finding — even though for every user who has not set the variable, the
default is the effective endpoint.

## Change

AG-AM-001 substitutes `${VAR:-default}` / `${VAR-default}` before parsing.
tlsradar now gets a real analysis: `https://tlsradar.com/...` with no auth
header → medium missing-auth (was low unparseable). URLs whose variables
have no default (`${BASE_URL}/mcp`) still report the honest low finding.

## Real corpus

buildwithclaude AG-AM-001: cashflow/hookradar/mortgage-pricer medium
(unchanged) + tlsradar upgraded low→medium. Other 9 corpus repos: no
AG-AM-001 changes.

## Boundaries

- Only URL fields are substituted; env defaults in commands/args are left
  as-is (commands are matched by pattern, not parsed).
- `${VAR:=default}` / `${VAR:+alt}` forms are not modeled (not seen in the
  wild for MCP URLs).

## Evidence

- Full suite green: core 266, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
