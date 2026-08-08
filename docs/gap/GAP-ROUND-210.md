# GAP-ROUND-210 — data checkpoint (rounds 201–209)

Periodic honest-data checkpoint. No code changes; numbers measured on
2026-08-03 against `main` (post-#324) and npm/production.

## Shipped since round 200

| Round | PR | Face |
| --- | --- | --- |
| 201 | #314 | Copilot custom agent `mcp-servers` frontmatter discovery |
| 202 | #315 | Copilot CLI MCP configs (`~/.copilot/mcp-config.json`, `.github/mcp.json`) |
| 203 | #317 | Copilot CLI hooks (`.github/hooks/*.json`, bash/powershell) — AG-SK-003 |
| 204 | #318 | Copilot settings files: inline hooks + mutable plugin marketplaces |
| 205 | #319 | Copilot plugin marketplaces/manifests (AG-SC-001 + advisory checks) |
| 206 | #320 | Open Plugin Spec LSP surface (`lsp-config/servers.json`, bash/powershell keys) |
| 207 | #321 | AG-SK-001 precision — Copilot-ecosystem corpus FP sweep (7 real FPs fixed) |
| 208 | #322 | Bare `plugin.json` manifests (Open Plugin Spec first lookup) |
| 209 | #324 | JetBrains Junie — MCP discovery + `guidelines.md` skill scanning |

Theme: the Copilot CLI / Open Plugin Spec supply chain went from uncovered to
end-to-end (configs → hooks → settings → marketplaces → manifests → LSP →
bare-manifest first lookup), plus one new client (Junie).

## Releases

- 0.49.0 / 0.50.0 / 0.51.0 cut by changesets across the window; npm published
  through **0.51.0** (core + cli; config-convert unchanged at 0.9.0).
- v0.51.0 tag + GitHub Release created; deploy green; clean-environment
  regression via `npx mcp-agentgate@0.51.0` verified Copilot hooks
  critical/high, marketplace mutable-source medium, `.github/mcp.json`
  discovery + `@azure/mcp@latest` advisory hit, and the round-207 precision
  fix ("MUST read the reference files" no longer flagged).

## Data (measured, not estimated)

- Tests: 282 → **372** (core 301, cli 47, config-convert 24).
- Self-scan: 155 files, **18 findings**, ~0.21 s (unchanged across the window).
- Advisories: **31** — repo, live API, and JSON feed all agree.
- npm downloads (last month): **3,124** — sixth consecutive flat checkpoint.
  Distribution remains the biggest gap; product coverage keeps compounding
  while adoption is static. Owner decision still pending on distribution
  investment (launch posts, integrations, registry listings).

## Known open boundaries (carried forward)

- Client-list drift in README/homepage/quick-start (missing Qwen Code,
  Copilot CLI, Junie) — docs catch-up candidate for a near round.
- Referenced hook/launch script files are never content-followed (uniform
  boundary across all hook faces).
- `~/.copilot/installed-plugins/` local state and `$COPILOT_HOME`/
  `COPILOT_HOME` relocation not modeled.
- Junie `.junie/skills/<name>/rules/*.md` reference trees not independently
  scanned (SKILL.md itself is).
