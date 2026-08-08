# GAP-ROUND-204 — Copilot CLI settings files (`.github/copilot/settings.json`)

## Scope

Round 203 covered Copilot CLI hook *files* (`.github/hooks/*.json`, `.copilot/hooks/*.json`).
This round covers the Copilot CLI *settings* surface, verified against the official
configuration-directory reference (github/docs `cli-config-dir-reference.md`):

- Settings precedence: built-in defaults → MDM → user `~/.copilot/settings.json` →
  repository `.github/copilot/settings.json` → local `.github/copilot/settings.local.json`
  → env vars → CLI flags. Repository settings "apply to everyone who works in the
  repository" and are committed/shared.
- Repository-supported keys include `hooks` (merged — **repository overrides user for the
  same key**; same schema as `.github/hooks/*.json` files) and `extraKnownMarketplaces` +
  `enabledPlugins` (declarative plugin auto-install; also read by the Copilot cloud agent).
- The files are JSONC.

## What shipped

1. `COPILOT_SETTINGS_FILE` matcher: `(.github/copilot|.copilot)/settings(.local)?.json`.
2. AG-SK-003: the inline `hooks` key runs through `extractCopilotHookCommands` +
   the shared risky-command classifier (bash / powershell / command keys), same
   Copilot-lifecycle message as round 203.
3. AG-SC-001: `enabledPlugins` × `extraKnownMarketplaces` reuses the Claude Code
   mutable-marketplace check (identical schema per official docs) with a
   "Copilot CLI plugin" label.
4. Scanner: the `.github` skill-only exclusion also exempts these settings paths.

## Corpus evidence

- GitHub code search: 98 files at `.github/copilot/settings.json` (2026-08).
- True positives: **dotnet/roslyn** — 6 plugins auto-enabled from `dotnet/arcade-skills`
  and `dotnet/skills` github marketplaces with no `sha`/release `ref` (AG-SC-001 medium ×6);
  **Azure/git-ape** — 1 (self-referencing marketplace, known round-181 boundary: the
  scanner cannot know the repo's own remote identity from the filesystem).
- Clean: krusty93/relego (plugin enabled from a marketplace not declared in the file —
  correctly not flagged), danielsogl/copilot-workflow-demo (`mergeStrategy` only).
- No in-the-wild inline `hooks` found in the sampled corpus; true positives covered by
  test fixtures (curl|sh in `sessionStart`).

## Boundaries (not modeled)

- `deniedUrls` / `disabledMcpServers` / `disabledSkills` are tighten-only at repo level —
  no risk signal, not modeled.
- `permissions.disableBypassPermissionsMode`, sandbox keys, MDM/server-managed settings:
  user/device level only, not repo-carried.
- `.github/allowed_models.txt` model allowlist: no security-relevant surface for us.
- `enabledPlugins` referencing marketplaces defined elsewhere (user settings) cannot be
  resolved from the repo alone — only same-file marketplace+enable pairs are checked
  (same as the Claude settings check).
- Self-referencing marketplace sources are still flagged (round-181 boundary).

## Validation

- `pnpm build && pnpm lint && pnpm typecheck && pnpm test`: green
  (core 288 / cli 47 / config-convert 24).
- Self-scan: 18 findings (unchanged).
