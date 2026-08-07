# GAP-ROUND-174 — Codex project hooks (.codex/hooks.json)

Date: 2026-08-08 · Round type: coverage (auto-executing hooks)

## Surface

Round-173 GAP candidate. Official Codex hooks docs: hook layers include
`<repo>/.codex/hooks.json` (plus inline `[hooks]` in config.toml, covered
partially by round-173's config scan surface); "Project-local hooks load
only when the project `.codex/` layer is trusted." Config shape is the
same nested `{ Event: [{ matcher, hooks: [{ type: "command", command }] }] }`
schema as Claude Code settings hooks. Prevalence: 2,808 GitHub code-search
hits for hooks.json under .codex-related queries (top hits verified as
real `.codex/hooks.json` files).

## Change

AG-SK-003 checkSource for `.codex/hooks.json`, reusing the shared
`extractHookCommands` parser (identical schema) and `RISKY_COMMANDS`
classifier: remote-script pipes → critical, data-exfil/credential/.env
reads → high. Local scripts stay clean.

## Mitigation noted honestly

Codex requires reviewing/trusting each non-managed hook by hash before it
runs (re-review on change). The finding still matters: trust prompts are
routinely accepted and `--dangerously-bypass-hook-trust` skips them.
Documented on the rce-vectors page.

## Real corpus (5 repos with .codex/hooks.json)

telepresence, neomjs/neo, Tresjs/tres, standardagents/dmux,
codex-cli-best-practice — all commands are local policy/lint/context
scripts; 0 findings, correctly clean (extraction verified against the
same files). True positives covered by unit fixture (curl|bash → critical,
credential exfil → high, local policy script clean).

## Boundaries

- Inline `[hooks]` tables inside `.codex/config.toml` are not yet walked
  by AG-SK-003 (candidate; round-173 covers that file's sandbox keys).
- `commandWindows` variants are not separately classified.

## Evidence

- Full suite green: core 248, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
