# GAP-ROUND-179 — Codex named [permissions.<name>] profiles

Date: 2026-08-08 · Round type: coverage completion (round-173 boundary)

## Surface

Round-173 modeled top-level sandbox/approval keys but left named
permission profile tables unmodeled. Official Codex config reference:
`default_permissions` may name a custom profile requiring a matching
`[permissions.<name>]` table; `permissions.<name>.filesystem.<path>` can
grant `"write"` on any absolute path, and `permissions.<name>.network.enabled`
turns on sandboxed networking. A project-scoped config can therefore
recreate danger-full-access semantics under an innocuous profile name
without any `danger-full-access` literal appearing in the file.

## Change

`checkCodexConfig` walks `[permissions.<name>]` tables:
- filesystem `"write"` on `/`, `/**`, `~`, `~/`, or `$HOME` → high
- `network.enabled = true` → medium
Scoped path writes (e.g. `/tmp/build`), deny rules (`"**/*.env" = "deny"`),
and `enabled = false` are not flagged.

## Real corpus

Re-scan of r173 + r176 corpora (10 repos): 0 new findings — none of the
real configs define named permission profiles yet (the feature is
recent); existing round-173 true positives unchanged (gogf/gf, routa,
apiflow, rulesync, codex-cli-best-practice). True/false positives
covered by unit fixtures.

## Boundaries

- Broad-but-not-root writes (e.g. `/home` or `/Users` as literal paths)
  are not flagged — candidates if seen in the wild.
- `extends` chains are not resolved (`:danger-full-access` is rejected
  as a parent by Codex itself per the reference).
- `workspace_roots` additions and proxy `dangerously_*` keys unmodeled.

## Evidence

- Full suite green: core 256, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
