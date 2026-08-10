# GAP-ROUND-400 — routine advisory windows + Qoder plugin surface (Qwen Code v0.21.9)

Round 400 is a routine verification round (advisory windows, client version window,
production consistency, round-399 residuals). The client version window surfaced a
real configuration-surface change — Qwen Code v0.21.9 ships native Qoder plugin
installation — which this round covers.

## Advisory windows

- **Authenticated advisory watch**: re-run, zero uncovered MCP-related advisories.
- **OSV npm snapshot**: ETag changed since the r394 baseline
  (`…` → `485c80f377f7402519e2252818ccdd5f`). Full MAL-set diff after filename
  normalization (`.json` suffix stripped): exactly 21 new records,
  MAL-2026-13688..MAL-2026-13708. Each checked by package name and record text:
  typosquat clusters, crypto/discord stealers, generic-tool-name squats — zero
  MCP/agent relevance. None enter the advisory database.
- **OSV PyPI snapshot**: ETag changed (`…` → `69fa98831ee87a49bed2e46fdc71cb16`)
  but the MAL set is identical to the r394 baseline (11,638 records both sides,
  diff empty).

## Client version window

| Client | Version | Assessment |
| --- | --- | --- |
| Gemini CLI | v0.54.4 | bugfix window, no config-surface change |
| Copilot CLI | v1.0.78 | bugfix window, no config-surface change |
| Crush | v0.88.1 | bugfix window, no config-surface change |
| **Qwen Code** | **v0.21.9** | **new surface: native Qoder plugin installation** |
| Codex | rust-v0.147.0 | bugfix window, no config-surface change |
| Goose | v1.45.0 | bugfix window, no config-surface change |
| OpenCode | v1.18.16 | unchanged since r396 |
| Zed | v1.14.2 | bugfix window, no config-surface change |
| Claude Code | v2.1.226 | bugfix window, no config-surface change |

### Qwen Code v0.21.9 — Qoder plugin support (evidence)

Upstream `QwenLM/qwen-code` v0.21.9 adds `packages/core/src/extension/qoder-converter.ts`
with `QODER_PLUGIN_MANIFEST = '.qoder-plugin/plugin.json'`: Qwen Code now installs
Qoder plugins directly, converting the manifest (a Claude-plugin-shaped config with
optional `contextFileName`, defaulting to the plugin root's `system-prompt.md`) into
a Qwen extension. That makes `.qoder-plugin/` repos an execution/instruction surface
for Qwen users, not just Qoder users.

Wild samples (multiple independent repos, observed in prior-round corpora):

- `superbasedapp/plugins` — `.qoder-plugin/marketplace.json` at the repo root plus a
  nested `.qoder-plugin/plugin.json` under `qoder/superbased/`.
- `gillcash/necktie` — `.qoder-plugin/plugin.json` with `skills`, `rules`, and a
  path-form `hooks: "./hooks/qoder-hooks.json"` reference.

AgentGate's plugin machinery covered `.claude-plugin`, `.plugin`, `.factory-plugin`,
`.codex-plugin`, `.cursor-plugin`, `.goose-plugin` — but not `.qoder-plugin`, so a
Qoder plugin repo's manifest hooks, bundled mcpServers, component markdown, and
system-prompt context were invisible.

### Fix (this round)

- `.qoder-plugin` added to `PLUGIN_META_NAMES` / `AGENT_DOT_DIRS` (scanner),
  `PLUGIN_MANIFEST_FILE` (AG-SK-003 manifest hooks), `PLUGIN_META_DIRS`
  (mcpServers discovery), `MARKETPLACE_CATALOG_FILE` + `MARKETPLACE_CATALOG_PATHS`
  (AG-SC-001 mutable sources, marketplace source-root gating).
- New manifest-gated surface: a plugin root's `system-prompt.md` is loaded as
  model-facing extension context on install, so it is skill-scanned (AG-SK-001)
  under the same plugin-root gate as component markdown. A bare `system-prompt.md`
  with no plugin manifest is NOT scanned (negative test pinned) — standalone
  system-prompt files exist in the wild in non-plugin repos (3 corpora repos
  checked) and are not an installable surface.
- Path-form hook file references (`hooks/qoder-hooks.json`) were already covered by
  the r188 JSON hook-shape detection; verified, no change needed.

### Verification

- Focused failing tests first (manifest hooks + component md + system-prompt.md;
  discovery mcpServers; marketplace mutable source; negative system-prompt.md),
  then the minimal production change. 530 core + 60 cli + 30 convert green;
  lint/typecheck green.
- Head-to-head on the wild-sample repos (old build vs new): zero findings drift —
  both repos' Qoder plugin content is benign, so correct coverage yields no new
  findings there; the surface is now scanned (synthetic true-positive tests pin
  the hot paths).
- Corpora sweep for `system-prompt.md` outside plugin roots (beetroot-salad,
  askalf, yankeeinlondon repos): no new findings, gate holds.

## Production consistency

- Website `https://agentgate.zalize.com`: HTTP 200.
- Advisory API `/v1/advisories`: 109 records.
- Feed `/feeds/advisories.json` (`items`): 109 records.
- Repository advisory data (`packages/core/src/advisories/data.ts`): 109 MCPA ids.
- All three consistent with the r399 baseline.

## Round-399 residuals

- `isPublicHttpHost` positive-named allowlist guard (AG-SS-001 singleton): still a
  single wild sample; deferred, unchanged.
- Generated-report `exec` enumeration (AG-RC-001 singleton): deferred, unchanged.
- `BANNED_HOSTS` denylist word-shape (AG-SS-001 singleton): deferred, unchanged.

## Evidence vs inference

- Observed evidence: upstream qoder-converter source at v0.21.9; wild `.qoder-plugin`
  repos in prior corpora; test runs; production endpoint counts; OSV diffs.
- Inference: Qoder itself (the IDE) presumably reads the same marketplace layout —
  the marketplace coverage is justified by the wild sample plus the shared
  Claude-plugin schema, not by Qoder documentation review.
