# GAP-ROUND-300 — data checkpoint (rounds 291-299)

Date: 2026-08-08. Previous checkpoint: round 290 (rounds 281-289).

## Shipped in this window (9 PRs, all merged)

| Round | PR | What |
| --- | --- | --- |
| 291 | #430 | Advisories MCPA-2026-0074..0077 — remote-control & credential-recon npm malware batch (87 → 91; three packages still installable at entry time, all verified by unpacking latest tarballs) |
| 292 | #431 | AG-SC-001 classifies remote-source server launch specs (git / VCS shorthand / archive URL); `github:` shorthand no longer sent to registry lookup |
| 293 | #432 | The other two Codex marketplace manifests (`.cursor-plugin/marketplace.json`, `.agents/plugins/api_marketplace.json`) scanned |
| 294 | #434 | `deps` AG-DP-007: mutable remote dependency specifiers in package.json (22,820 wild specs quantified; 6 git + 8 archive previously invisible) |
| 295 | #435 | Advisory sweep: zero new entries; watch-ignore list stops three GitHub-only GHSA candidates resurfacing; first PyPI OSV snapshot retained |
| 296 | #436 | AG-DP-007: PyPI PEP 508 direct references + PEP 735 dependency-groups parsing |
| 297 | #437 | Wild-corpus sweep (364 manifests, 229 hits, 15/15 spot-audit TP): extras/editable/bare-URL requirement forms + commit-addressed archive exemption |
| 298 | #439 | AG-DP-007: Poetry table-form git/url dependencies (138 wild pyprojects → 30 previously invisible hits, 8 high / 22 medium); clean advisory sweep |
| 299 | #440 | AG-DP-007: uv source overrides `[tool.uv.sources]` (98 wild pyprojects → 64 previously invisible hits, 12 high / 52 medium) |

Window arc: rounds 292→294→296→297→298→299 built out one coherent capability —
**mutable-remote-source detection across every mainstream Python/npm declaration
surface** (server launch specs, package.json, requirements/PEP 508/735, Poetry
tables, uv sources) under a single policy: unpinned git medium, non-registry
archive high, full-SHA and registry tarballs exempt, offline-capable.

## Measured data (real runs, 2026-08-08)

- Tests: 460 → **472** (30 config-convert + 388 core + 54 cli), all green.
- Self-scan (dogfood): 218 files, 21 findings, **0.78 s** (offline table run) — flat vs 0.82 s at round 290.
- Advisory database: 87 → **91**; bundled dir, live API, and JSON feed all agree at 91 (CI count-drift gate active).
- Releases in window: **v0.67.1** (cli/core 0.67.1 + config-convert 0.14.0, manually published; tag + GitHub Release + deploy verification + clean `npx` regression done). Version PR #438 accumulates round-296..299 patches for the next release.
- npm last-month downloads: mcp-agentgate **3,124** — flat for the seventeenth consecutive checkpoint; mcp-agentgate-core 3,355. Distribution remains the top non-engineering gap (external list, awaiting owner decision).

## Honest notes

- Round-295/298 malware windows were near-zero partly because the OSV snapshots were
  pulled the same day; the next advisory round (301+) should run against a genuinely
  new multi-day window.
- No new client surfaces appeared in the round-299 sweep window; surface-check
  cadence stays as-is.
