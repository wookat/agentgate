# GAP-ROUND-433 — fresh-corpus verification (140 repos, honest no-defect round)

Date: 2026-08-04. Scanner: `main@1a50418` (0.67.59).

## Corpus

- Same seven-surface query set as prior rounds (skills, mcpServers/mcp.json,
  OpenCode plugins, marketplaces, Cursor/Windsurf/Copilot rules, Gemini CLI
  extensions, Goose recipes, Codex config, AGENTS.md, hooks/settings, Qwen
  Code, Kiro, Roo, Amazon Q, Crush, Factory Droid, Antigravity).
- 2,731 candidates → 1,449 fresh after dedupe against `seen.txt` → 140
  selected → 140 cloned (0 failures). Read-only, no setup/exec.
- Scan: 943 findings, 0 parse failures. 12 critical / 298 high / 498 medium /
  135 low.
- Warnings: 11 × "nothing was scanned" (repos with no discoverable agent
  config surface — correct diagnostics); YAML unknown-tag noise
  (CloudFormation `!Ref`/`!Equals`, Helm `{{ }}` map-key stringification) —
  non-fatal parser diagnostics only.

## Critical triage (12/12 inspected)

- 10 genuine installer pipelines: NodeSource setup_22.x|bash (csglite),
  uv installer ×3 (Aditi-IT-Assist, TrendRadar ×2 — the two TrendRadar repos
  are byte-identical copies of one template, counted as one shape), rustup +
  uv + d2lang install|sh (OmegaOS ×3), bun (VoiceStudio), nvm + helm
  (bkn-foundry onboard.sh / k8s.sh). All true positives, preserved.
- 2 same-repo quoted-string mentions in bkn-foundry:
  `preflight_checks.sh:691` — the literal text `curl|sh` inside a quoted
  diagnostic message, and `deploy/manifests/deploy.sh:69` — an
  `info "  curl -sfL https://get.k3s.io | sh"` instructional echo. Neither is
  an executed pipe; both graded critical. **Singleton repo** (both files in
  one repository; no second independent repo this round shows the shape) —
  recorded as a slow-burn, no change.

## High triage

- 294 AG-SK-002: real unscoped `allowed-tools: Bash` / permission "allow"
  grants. Concentration is template-farm-like but genuine: oleg-koval
  agent-skills (122, a 60+-skill multi-adapter package farm), artibot (89),
  OmegaOS (56), scott-cc (16) — every sampled file really pre-approves
  unrestricted Bash. Rule semantics correct.
- 4 AG-CL-001: Eternalgy-TrendRadar hardcoded live `sk-…` API key committed
  in two files (redacted here) and petclinic `.mcp.json` hardcoded
  `X-API-Key` + Bearer JWT — all true positives.

## Medium/low sampling (by rule category)

- AG-SK-002 medium: real Write/Edit pre-approvals — correct.
- AG-RC-001 medium: `exec(`/`execSync(` in server/scripts code — correct
  review-flag grading.
- AG-RC-001 low: comment-line and test-fixture curl|sh — correct quiet wording.
- AG-SC-001 medium: unpinned npx/marketplace auto-enable — correct; one
  oddity: knotica's `uvx --from ${CLAUDE_PLUGIN_ROOT}` (a local plugin-root
  env placeholder) is described as "unpinned package" — message wording is
  off for local-path sources, but singleton (first repo ever seen using
  `--from ${VAR}`); slow-burn.
- AG-SC-003 medium: pr-guardian pins `@modelcontextprotocol/server-filesystem`
  with known advisories MCPA-2025-0004/0005 — correct advisory surfacing.
- AG-CL-001 low: `sk-…` shapes in test paths — correct quiet grading.
- AG-SS-001: 16 low, 0 high — test fixtures, defensive guards, and one
  "Only code comments…" (gatewaze attachments.ts) from the r431 fix working
  as intended in the wild.
- AG-TP-001 low: zero-width joiners in Malayalam locale files and BOMs in
  test files — correct low.
- AG-SK-001 low: instruction-override phrases inside fenced examples — correct.
- AG-AM-001: remote servers without auth headers — correct verify prompts.

## Deferred singletons

1. bkn-foundry quoted-string/echoed `curl|sh` mentions graded critical
   (one repo, two files).
2. knotica `uvx --from ${CLAUDE_PLUGIN_ROOT}` "unpinned package" wording
   (local-path plugin source).
3. r431's pipixia defensive set-membership metadata classification — no
   second sample this round.

## Outcome

Honest no-defect round: no shape reached the two-independent-repo bar.
No code change, no changeset.

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. GitGuardian +
local lint green (docs-only change).
