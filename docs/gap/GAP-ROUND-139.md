# GAP-ROUND-139 — real-corpus verification of settings/hooks checks

Date: 2026-08-07 · Round type: real-corpus verification (docs only)

## Method

GitHub code search shows checked-in Claude Code settings are widespread:
~1,090 files match `bypassPermissions`, ~1,584 match
`enableAllProjectMcpServers` under `.claude/`. Cloned four popular real
repositories and scanned with the rounds 134–138 build (local build incl. #231, CI-green and pending merge at scan time).

## Results (true positives, zero noise)

| Repo | Finding |
| --- | --- |
| payloadcms/payload | bare `WebSearch` allow (medium) + `enableAllProjectMcpServers` (medium) |
| windmill-labs/windmill | `enableAllProjectMcpServers` (medium); ~60 scoped allows correctly clean |
| sceneview/sceneview | `defaultMode: "bypassPermissions"` (high) |
| traceroot-ai/traceroot | `defaultMode: "bypassPermissions"` (high) |

- All four repos also use hooks; every hook is a project-local script
  (format/lint/dispatch) → AG-SK-003 correctly reports 0.
- windmill's large scoped allow list (60+ entries) produced no false
  positives.

## Routine sweep

- Advisory watch: no uncovered MCP-related advisories.
- Competitors: mcp-scan 2.0.2, socket 1.1.155 — no change.

## Carried forward

- `Bash(rm:*)`-style scoped-destructive grants still unflagged
  (needs severity decision; windmill allows only read-only commands, so
  no new evidence this round).

## Evidence

- Scans run locally on the rounds 134–138 build; docs only, no
  changeset.
