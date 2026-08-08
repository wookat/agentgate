# GAP-ROUND-240 — data checkpoint (rounds 231–239)

Periodic honest-data checkpoint. No code changes; numbers measured on
2026-08-08 against `main` (post-#358) and npm/production.

## Shipped since round 230

| Round | PR | Face |
| --- | --- | --- |
| 231 | #349 | Competitor re-check — osv-scanner 2.5.0, socket 1.1.155, advisory count refreshed (docs) |
| 232 | #350 | Factory Droid client — MCP discovery, hooks (AG-SK-003), skill/command/droid scanning (AG-SK-001) |
| 233 | #352 | Factory settings (AG-SK-002) — commandAllowlist, high autonomy, Droid Shield off |
| 234 | #353 | Advisories MCPA-2026-0028..0034 — mcp-atlassian batch + MCP Python SDK batch |
| 235 | #354 | Advisories MCPA-2026-0035..0044 — package-mapped backlog batch (10 entries) |
| 236 | #355 | Factory plugin surface — `.factory-plugin` discovery, inline hooks, mutable marketplaces |
| 237 | #356 | Factory plugin corpus sweep (46-repo wild corpus) + discovery dedupe fix |
| 238 | #357 | Advisories MCPA-2026-0045..0055 — Serena, Prompty, Flowise critical batch (11 entries) |
| 239 | #358 | Google Antigravity client — MCP discovery, hooks (AG-SK-003), workspace rules (AG-SK-001) |

Theme: two new clients (Factory Droid end-to-end incl. settings + plugin
surface with a full-corpus precision sweep; Google Antigravity), and three
advisory sweeps adding **28 entries** (41 → 69) — the largest advisory growth
window so far.

## Releases

- **v0.55.0 shipped in this window** (cut mid-window at round 232 boundary,
  PR #344): npm `mcp-agentgate` + `mcp-agentgate-core` both 0.55.0, tag/GitHub
  Release/deploy verified, clean-environment regression passed
  (0.52–0.55 cumulative surface).
- Rounds 232/233/236/239 minors and 234/235/237/238 patches are accumulating
  toward the next version.

## Data (measured, not estimated)

- Tests: 406 → **421** (core 350, cli 47, config-convert 24).
- Self-scan: 193 files, **21 findings** (15 medium, 6 low), ~0.76 s cold —
  unchanged since round 234 (+1 low there was our own advisory JSON's
  defensive metadata-endpoint text, below the CI gate).
- Advisories: **69** — repo (`advisories/MCPA-*.json`), live API
  (`/v1/advisories`), and the JSON feed all agree at 69.
- npm downloads (last month): `mcp-agentgate` **3,124** — ninth consecutive
  flat checkpoint; `mcp-agentgate-core` 3,355; `mcp-agentgate-config-convert`
  451. Distribution remains the largest gap and stays a CEO-level decision
  (marketing/launch), not something more scanning surface fixes.

## Known gaps carried forward

- Antigravity workflows (`.agents/workflows`) and OAuth token storage not
  modeled (GAP-239).
- Flowise same-window high/medium remainder (~15 advisories, same version
  ranges already covered by criticals) — backfill on demand (GAP-238).
- MCPA-2026-0055 still has no CVE; add alias when assigned (GAP-238).
- Go/rubygems ecosystems stay out of the advisory DB until a matching scan
  surface is modeled (standing scope decision).
- README client list spot-checked: Factory Droid, Antigravity, Goose, Crush
  present (no drift found this checkpoint).
