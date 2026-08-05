# GAP-ROUND-3 — Production benchmark loop, round 3 (cross-server analysis)

Date: 2026-08-05. Round 2 closed the per-server recall/precision gaps against
mcp-scan; its one remaining *capability* we lacked was configuration-wide
analysis. mcp-scan's flagship feature is "toxic flows" — reverse-engineered
from the `mcp-scan==0.3.4` source (`pip download --no-binary`): `printer.py`
renders `TF*` global issues from `ToxicFlowExtraData`, a mapping of flow roles
to lists of tool references across *all* servers in the scan path, with a
`--full-toxic-flows` flag to list every participating tool. The analysis itself
runs server-side (Invariant/Snyk cloud), so it is unavailable offline — but the
concept is the right one: **the agent sees every configured server's tools in
one namespace, so risk is a property of the whole configuration.**

## Gaps found (our side, before this round)

| # | Reference behaviour | AgentGate before | Gap | Prio |
|---|---|---|---|---|
| 1 | Toxic-flow detection across servers | `AG-OP-001` classified capability combos **per server only**: a notes server + a separate send-email server scanned clean | The classic exfiltration setup (GitHub-MCP incident shape) is *invisible* to per-server analysis | **P0** |
| 2 | Cross-server shadowing detection | Nothing compared tool surfaces between servers | Two servers exposing the same tool name → the client silently resolves one; a malicious duplicate hijacks calls | **P0** |
| 3 | (found while fixture-testing #1) | Every zod/JSON-Schema tool carries `"$schema": "http://json-schema.org/…"` — the `http` token gave **every tool** a `network` capability in `AG-OP-001` | Systemic false positive across all live scans | **P0** |
| 4 | (found while fixture-testing #1) | `verbAlt('fetch')` produced `fetch(?:s|ed|ing)?` — "Fetch**es**" (and searches/pushes/…) did not match | Sibilant third-person forms slipped through round 2's recall fix | **P0** |

## Fixes in this round

- New `checkConfiguration(surfaces)` rule hook + `scanConfiguration()` core API,
  run by `scan --live` when ≥2 servers are inspected.
- **`AG-TF-001`** (toxic flow): tools across all servers are classified into
  *reads private data* / *ingests untrusted external content* / *can send data
  out*. Private data + outbound send = `medium` (exfiltration flow); all three
  = `high` (complete toxic flow). The finding's `detail` names the
  participating tools, mirroring mcp-scan's `--full-toxic-flows`.
- **`AG-XS-001`** (shadowing/hijack): duplicate tool names across servers =
  `high`; a tool description instructing the agent about *another server's*
  tool ("instead of…", "before calling…") = `critical`.
- `toolText()` now strips `$schema` before pattern matching (fixes #3); all
  tool rules go through it.
- `verbForms` handles sibilant stems (`fetches`, `searches`, `pushes`) (fixes #4).

## Evidence (local two-server fixture, `scan --live --yes`)

A benign-looking notes server + comms server (each individually unremarkable):

```
CRITICAL AG-XS-001 comms/search   Tool "search" instructs the agent about another
                                  server's tool "notes/read_notes" — cross-server hijacking
HIGH     AG-TF-001 notes + comms  Configured tools form a complete toxic flow: untrusted
                                  content can reach a tool that reads private data and a
                                  tool that sends data out
HIGH     AG-XS-001 notes + comms  Tool name "search" is exposed by 2 servers (notes, comms)
MEDIUM   AG-SS-001 comms/fetch_page  (SSRF surface)
```

Before this round the same configuration produced **only** the SSRF medium plus
a *false* `AG-OP-001` (from the `$schema` bug). mcp-scan on the same fixture
requires a `SNYK_TOKEN` + network to say anything at all.

Regressions: round-2 malicious fixture still fully detected (7 findings, was 6 —
the new one is a legitimate second SSRF finding); vscode repo scan unchanged
(89 findings, 1.6 s, 13,639 files); 145 tests green; single-server configs are
explicitly skipped by `scanConfiguration`.

## Honest conclusion

Cross-server analysis now exists and works offline — mcp-scan's equivalent is
cloud-only. Ours is heuristic (three ability classes, regex-matched); mcp-scan's
cloud analysis can model flows we cannot. Still open for round 4+:

1. The 67 `AG-RC-001 medium` noise on huge non-MCP repos (scope repo scans to
   MCP-relevant files by default).
2. Advisory feed for known-bad MCP servers/packages.
3. macOS/Windows verification.
