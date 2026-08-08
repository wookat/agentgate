# GAP-ROUND-250 — Data checkpoint (rounds 241–249)

Date: 2026-08-08. Documentation-only checkpoint round; all numbers below are
measured, not estimated.

## What shipped in this window (9 PRs, all merged)

| Round | PR | What |
| --- | --- | --- |
| 241 | #360 | Antigravity workflows (`.agents/workflows/*.md`) into AG-SK-001 |
| 242 | #361 | `config convert` supports antigravity (`serverUrl` semantics) |
| 243 | #362 | Precision sweep of the Antigravity surface (docs, 22 repos, 0 FP) |
| 244 | #363 | Advisories MCPA-2026-0056..0059 (Flowise post-sunset batch, OpenHands resolver injection) — 69→73 |
| 245 | #364 | Docs: no-fixed-release advisories (`last_affected`, sunset products) |
| 246 | #365 | Roo Code project custom modes (`.roomodes`) into AG-SK-001 |
| 247 | #366 | AG-SK-002 checks OpenCode agent frontmatter permissions (`.opencode/agents/*.md`) |
| 248 | #367 | Precision sweep of `.roomodes` + `.opencode/agents` (docs, 36 repos, 0 FP) |
| 249 | #368 | OpenCode singular `agent`/`command`/`mode(s)` directories (AG-SK-001/002) |

Window highlights: two new instruction surfaces (Roo custom modes, OpenCode
agent markdown), one honest scope rejection (Roo `groups` are capability
toolsets, not approvals — dropped before shipping noise, GAP-ROUND-247), and
two wild-corpus precision sweeps totaling 65 repositories with zero false
positives.

## Measured data (2026-08-08)

- Tests: 421 → **428** (core 356, cli 47, config-convert 25); all suites,
  lint, typecheck, build green.
- Self-scan (dogfood): 197 source files, 21 findings (15 medium, 6 low),
  **0.78 s** wall clock.
- Advisories: **73** — repo `advisories/MCPA-*.json`, live API
  `/v1/advisories`, and website JSON feed all agree (three-way consistent).
- Website: https://agentgate.zalize.com returns 200.
- npm last-month downloads: mcp-agentgate **3,124**, mcp-agentgate-core
  3,355 — the tenth consecutive flat checkpoint. Distribution remains the
  biggest gap and stays escalated for an owner decision.

## Release status (recorded honestly)

Version PR #351 (0.56.0: 8 minors + 4 advisory patch batches + dedupe fix)
merged this window, but the npm publish step failed: the repo has no
`NPM_TOKEN` secret and npm trusted publishing (OIDC) is not configured for
the three packages, so the token exchange 404s. **npm is still at
0.55.0/0.9.0 — 0.56.0 is not published.** Escalated to the owner with the
two fix options (trusted-publisher config or a granular `NPM_TOKEN`);
release verification (tag, GitHub Release, clean-environment regression)
runs after a successful re-publish.

## Carry-over boundaries

- Deprecated OpenCode `tools:` boolean frontmatter map not classified
  (rounds 247/248 call: uncommon, superseded by `permission`).
- Go/rubygems advisory ecosystems stay deferred until a matching scan
  surface exists (owner decision, round 235).
