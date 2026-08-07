# GAP-ROUND-130 — data checkpoint (rounds 121-129)

Date: 2026-08-07 · Round type: data checkpoint (per-10-round cadence)

## Shipped since round 120

- 9 feature/fix rounds → 9 merged PRs (#204, #206, #208, #209, #211,
  #213, #215, #216, #218) + version PRs.
- 6 releases: 0.26.0, 0.27.0, 0.27.1, 0.28.0, 0.29.0, 0.30.0
  (config-convert 0.8.0 → 0.9.0). Every release tagged, GitHub Release
  created, clean-environment regression run against the npm artifact.

## Coverage

- MCP client discovery: 18 → 19 clients (Amazon Q Developer: global +
  project mcp.json/default.json + named `cli-agents/*.json` agents).
- Instruction/skill surfaces added: Kiro steering, Roo Code rules
  (dirs + single-file), root instruction files (AGENTS.md standard,
  CLAUDE.md, GEMINI.md, Zed `.rules`, Copilot instructions), Copilot
  path-specific instructions + prompt files, Amazon Q project rules.
- config convert: 17 → 18 targets (amazonq).
- Advisories: 31 (repo = API = feed, verified this round); advisory
  watch: zero uncovered MCP advisories.

## Quality evidence (real runs)

- Two real-corpus FP sweeps: round 124 (4 flagship agent repos; found
  and fixed 6 AG-RC-001 workflow FPs), round 129 (4 repos with real
  `.amazonq/rules`; zero FPs).
- Self-scan baseline: 155 files, 17 findings, 0.21 s (unchanged).
- Test suite: core 208, cli 47, config-convert 24 (round 120: 198/47/23).

## Adoption (honest)

- npm 30-day downloads: 3,124 — but concentrated on 8/4–8/6,
  overlapping our own publish/CI/regression activity; still no basis to
  claim organic adoption. Distribution (marketplace listings, launch
  posts) remains the biggest gap and awaits the boss's call.

## Candidate improvements carried forward

- AG-SS-001 context pass: k8s NetworkPolicy manifests that reference
  the metadata IP to block it get flagged (found in round 129 on EDDI).
- Amazon Q `cli-agents` agent files as convert targets: deliberately
  out (full agent configs), revisit only with a concrete user ask.
