# GAP-ROUND-402 — routine windows + r401 fix verification (honest no-defect round)

Date: 2026-08-03. Baseline: main @ #602/#604 (0.67.51 versioned, npm still 0.67.49).

## Advisory windows

- **Authenticated advisory watch**: re-run with a GitHub token, zero uncovered
  MCP-related advisories.
- **OSV npm snapshot**: ETag changed since r400
  (`485c80f3…` → `03cda0b0…`) but the MAL record set is identical after
  filename normalization — diff empty (new records: 0).
- **OSV PyPI snapshot**: ETag changed since r400
  (`69fa9883…` → `22a6e7d4…`) but the MAL set diff is likewise empty
  (new records: 0).
- **Production consistency**: advisory API (`/v1/advisories`) 109, feed
  (`/feeds/advisories.json`) 109, repo `advisories/MCPA-*.json` 109 — all equal.

## Client version window

| Client | Version | Assessment |
| --- | --- | --- |
| Gemini CLI | v0.54.4 | unchanged since r400 |
| **Copilot CLI** | **v1.0.79** | release notes: Agent Plugins spec plugins can ship extensions under `com.github.copilot/extensions/` — **already covered**: `COPILOT_EXTENSION_FILE` (r312) matches `(\.github|com\.github\.copilot)/extensions/<name>/extension.(mjs|cjs|js)`. Remaining items are sandbox/UI settings with no config-surface change. |
| Crush | v0.88.1 | unchanged since r400 |
| Qwen Code | v0.21.9 | unchanged since r400 (Qoder surface covered in r400) |
| Codex | rust-v0.147.0 | unchanged since r400 |
| Goose | v1.45.0 | unchanged since r400 |
| OpenCode | v1.18.16 | unchanged since r396 |
| Zed | v1.14.2 | unchanged since r400 |
| Claude Code | v2.1.226 | unchanged since r400 |

## r401 fix verification on main

Rebuilt main @ #604 and re-scanned `r401/Lhy723_melody-harness`: AG-SC-001
count is 0 (the schemeless relative-url marketplace finding is gone; the repo
had no other AG-SC-001 hits). Matches the head-to-head recorded in
GAP-ROUND-401.

## Residual watch list (unchanged)

Deferred singletons from r401 remain on watch: FSI inside inline-code i18n
skill example (cosmix_loom), `!`-negated web-fetch filter list
(LegalQuants_lq-ai), `<System>` persona tag (liza-mas_liza), backtick-quoted
curl|bash inside JSON prose (hrdle_hrdle identity.json), plus the historical
canary.py / isPublicHttpHost / BANNED_HOSTS entries.

## Outcome

No new generalizable defect found. No code change, no changeset. Version PR
#604 (0.67.51, folds r401; publishing also covers unpublished 0.67.50/r400)
merged with green CI; awaiting SOP publish + close-out.
