# GAP-ROUND-190 — Data checkpoint (rounds 181–189)

Date: 2026-08-08 · Round type: data checkpoint

## Shipped since GAP-ROUND-180

9 PRs merged (#289, #291, #292, #293, #294, #297, #296, #298, #299) +
1 release published in window (0.46.0, tag/Release/deploy verified,
clean-cache regression passed in ~/clean0460). 0.47.0 version PR (#290)
is merged into main; npm publish pending owner action.

The window closed out the Claude Code plugin supply chain end to end:

- Round 181: AG-SC-001 — mutable git plugin sources in marketplace
  catalogs (`.claude-plugin/marketplace.json`). Real TPs: buildwithclaude
  (9), InsForge (1); anthropics official marketplace clean.
- Round 182: AG-SK-003 — plugin `hooks/hooks.json` + inline manifest
  hooks; echo/printf single-quoted-literal masking fix (budgetclaw FP).
- Round 183: discovery — plugin-bundled `.mcp.json` (nested plugin
  roots). Real TPs: buildwithclaude kegg + 3 unauthenticated remotes.
- Round 184: discovery — manifest `mcpServers` inline objects and
  plugin-root-relative path refs (`${CLAUDE_PLUGIN_ROOT}/` supported).
  Real TPs: thumbgate, fabler-x402-tools.
- Round 185: AG-SK-003 — plugin LSP server commands (`.lsp.json` /
  inline `lspServers`); real language servers stay clean.
- Round 186: AG-SK-003 — plugin monitor commands (`monitors/monitors.json`
  / `experimental.monitors`), persistent unsandboxed background processes.
  (#295 merged into a feature branch by mistake; re-landed as #297.)
- Round 187: AG-AM-001 — `${VAR:-default}` URL fallbacks resolve to the
  effective endpoint (tlsradar low→medium real analysis).
- Round 188: AG-SK-003 — shape-detection for hook/monitor config JSON at
  custom manifest paths (evasion-gap closure).
- Round 189: marketplace entries defined fully inline (`strict: false`):
  entry-level `mcpServers` discovered + advisory-checked, entry-level
  `hooks` classified.

## Metrics (measured 2026-08-08)

- Tests: core 256 → 269, cli 47, config-convert 24 (all green).
- Self-scan: 155 files, 18 findings (14 medium, 4 low), ~0.32 s.
  (17 → 18: a round-182 test fixture containing a curl|sh literal in a
  docs-level file, recorded in GAP-ROUND-182.)
- Advisories: 31 in feed and API; 32 local JSON files (incl. the
  non-advisory `watch-ignore.json` helper) — three sources consistent.
- npm mcp-agentgate last-month downloads: 3,124 (2026-07-08 →
  2026-08-06) — flat for the fourth consecutive checkpoint; distribution
  remains the biggest gap (escalated, owner reports it is with the boss).
- Releases: 0.46.0 published in window; 0.47.0 (rounds 181–188: six
  minors + one patch) versioned on main awaiting npm publish; round-189
  accrues to 0.48.0.

## Honest gaps / carry-overs

- npm OIDC trusted-publisher publish still fails; manual publish is the
  working path (owner decision pending).
- Marketplace `metadata.pluginRoot` indirection and entry-level
  `commands`/`agents`/`skills` path lists unmodeled (no wild evidence).
- Plugin LSP `env` injection and monitor `when` gating unmodeled.
- All corpus scans are of unmodified public repos; no fabricated results.
