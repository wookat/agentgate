# GAP-ROUND-140 — data checkpoint (rounds 131–139)

Date: 2026-08-07 · Round type: data checkpoint

## Shipped since round-130

- 11 PRs merged: #220 (AG-SS-001 NetworkPolicy FP), #222 (.github/agents),
  #224 (.github/chatmodes), #226 (Claude settings permissions), #227
  (settings corpus), #228 (JSONC parsing), #230 (Claude hooks), #231
  (enableAllProjectMcpServers), plus docs rounds #218-era style corpus
  reports (#227, #232) and version PRs.
- 4 releases published & tagged with clean-env regression: 0.30.1,
  0.31.0, 0.32.0, 0.33.0 (0.34.0 version PR green, pending publication).
- New coverage this block: VS Code custom agents + legacy chatmodes;
  Claude Code project settings (permissions.allow, bypassPermissions,
  enableAllProjectMcpServers), JSONC tolerance, and hook commands.

## Data (all measured today)

- Tests: core 215, cli 47, config-convert 24 (round-130: 208/47/24).
- Self-scan: 155 files, 17 findings, 0.22s (baseline unchanged).
- Advisories: 31 bundled = 31 live API = 31 feed items (consistent);
  watch sweep: zero uncovered MCP-related advisories.
- Real-corpus verification this block: 11 repos total (3 chatmode/agent
  corpora + 4 settings corpora ×2 rounds), true positives in 5 repos,
  zero false positives.
- Surface size (GitHub code search): ~1,090 checked-in `.claude`
  settings files contain `bypassPermissions`, ~1,584 contain
  `enableAllProjectMcpServers` — the settings surface added this block
  is widespread, not niche.
- npm 30-day downloads: mcp-agentgate 3,124 / core 3,355 — still
  concentrated in our own release/CI activity windows; cannot be read
  as organic adoption.
- Competitors: mcp-scan 2.0.2, socket 1.1.155 — no MCP/skill surface
  movement this block.

## Honest gaps carried forward

- Distribution remains the biggest gap (Marketplace listing, launch
  posts) — awaiting boss decision.
- Scoped-destructive grants (`Bash(rm:*)`) severity decision pending
  more corpus evidence.
- Home-directory surfaces (~/.claude, ~/.copilot/agents) outside
  project trees — candidate `scan --home` feature.
