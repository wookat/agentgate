# GAP-ROUND-173 — Codex project-scoped config sandbox/approval opt-outs

Date: 2026-08-08 · Round type: coverage (overprivileged agent settings)

## Surface

Codex loads project-scoped overrides from a checked-in `.codex/config.toml`
when the user trusts the project (official config reference:
"You can also add project-scoped overrides in .codex/config.toml files.
Codex loads project-scoped config files only when you trust the project").
A repo can therefore ship `approval_policy = "never"` +
`sandbox_mode = "danger-full-access"` and every trusting teammate runs
unsandboxed, unprompted commands. Prevalence (GitHub code search):
3,440 config.toml files mention `approval_policy`, 1,126 mention
`danger-full-access` (401 restricted to `.codex/` paths).

## Change

AG-SK-002 checkSource for `.codex/config.toml` (TOML via smol-toml):
- `sandbox_mode = "danger-full-access"` → high
- `default_permissions = ":danger-full-access"` (permission-profile form) → high
- `approval_policy = "never"` → medium
- `sandbox_workspace_write.network_access = true` → medium
`read-only`/`workspace-write` and interactive approval policies stay clean.

## Real corpus (5 repos with checked-in .codex/config.toml)

- gogf/gf: never + danger-full-access + network_access → high + 2 medium (true positives)
- phodal/routa: never + danger-full-access → high + medium
- trueleaf/apiflow: danger-full-access + never → high + medium
- dyoshikawa/rulesync: `default_permissions = ":danger-full-access"` → high (caught only after adding the profile form)
- shanraisshan/codex-cli-best-practice: workspace-write + on-request → 0, correctly clean

## Honest boundaries

- Named `[permissions.<name>]` profile contents are not modeled (only the
  built-in `:danger-full-access` token).
- Per-profile `profiles.<name>.*` overrides are not walked.
- `hooks` / `hooks.json` in the Codex project layer are a candidate for
  AG-SK-003 (lifecycle command execution) — separate round.

## Evidence

- Full suite green: core 247, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
