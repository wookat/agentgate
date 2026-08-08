# GAP-ROUND-233 — Factory Droid settings checks (2026-08-08)

Round type: close a round-232 boundary (Factory Droid `settings.json` risk surface, docs.factory.ai Settings reference verified 2026-08-08).

## Official semantics (docs.factory.ai → Droid CLI → Settings)

- `commandAllowlist`: "Commands that run without extra confirmation" (array; safe defaults). Companion keys `commandDenylist` / `commandBlocklist` are restrictive — not flagged.
- `sessionDefaultSettings.autonomyLevel`: `off | low | medium | high` — "low, medium, and high pre-authorize work at or below that risk level". `sessionDefaultSettings.autonomyMode` is deprecated but retained for older configs; wild files also carry top-level `autonomyLevel`/`autonomyMode` with `auto-*` values (e.g. `auto-high`).
- `enableDroidShield`: default `true` — "Enable secret scanning and git guardrails"; `false` turns both off.
- Hierarchy: user `~/.factory/settings.json`, project `.factory/settings.json`, plus `settings.local.json` local overrides at both levels ("merge on top").

## What shipped (AG-SK-002, `skill-poisoning.ts`)

- `FACTORY_SETTINGS_FILE` = `.factory/settings(.local)?.json`:
  - `commandAllowlist` entries whose first word is in the shared dangerous-command set (`rm`, `curl`, `wget`, shells, `sudo`, `iex`, …) → medium.
  - Default autonomy `high` / `auto-high` (both nested `sessionDefaultSettings.*` and legacy top-level keys) → high.
  - `enableDroidShield: false` → medium.
- AG-SK-003 Factory hook regex extended to `settings.local.json` (same `hooks` key).

## Real-corpus verification (same 5 repos as round 232)

- **mrwogu/promptscript** `.factory/settings.json`: `"autonomyMode": "auto-high"` → AG-SK-002 high (true positive — every session pre-authorizes high-risk actions); its `commandAllowlist` (`ls`, `pwd`, `git:*`, `npm:*`, `docker:*`) correctly not flagged.
- **vincentkoc/dotfiles** (JSONC settings, `autonomyLevel: "auto-medium"`, `enableDroidShield: true`, large allowlist of read-only commands): 0 findings — no FP.
- **subsy/ralph-tui**, **rjmurillo/ai-agents**, **freshtechbro/claudedesignskills**: unchanged vs round-232 baselines.
- Fixtures cover: dangerous allowlist entries (`curl`, `rm -rf`) + `autonomyLevel: high` + Droid Shield off; legacy `auto-high`; benign `auto-medium`/safe allowlist producing 0 findings.

## Data

- Core tests 339 → 342 (three new scanner tests); full suite, lint, typecheck, build, website build green. Self-scan findings unchanged (20).

## Honest boundaries

- Scoped allowlist syntax (`git:*`, `docker:*`) is not interpreted — only the first word is classified, so `docker:*` (which includes `docker run`) stays unflagged; conservative, revisit if the official docs specify the matching semantics.
- `customModels` (BYOK endpoints) and org-managed enterprise settings are not modeled.
- User-level `~/.factory/settings.json` is machine state; only repo-carried project settings are scanned in a repo scan.
