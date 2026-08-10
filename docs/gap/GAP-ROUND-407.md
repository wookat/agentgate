# GAP-ROUND-407 — fresh-corpus verification (honest no-defect round)

Date: 2026-08-03. Baseline: main @ #610 (0.67.52 published; no changesets
pending).

## Corpus

Fresh 140-repo corpus across the seven agent-surface query families
(pushed:>2026-08-07): 1,406 candidates → 1,008 after seen-list dedupe →
140 selected and shallow-cloned (one clone, DitriXNew/EDT-MCP, failed
transiently and succeeded on retry). Full scan: 668 findings.

Distribution: SK-002 190 medium + 82 high; SK-001 123 low + 1 critical;
RC-001 7 critical + 42 medium + 52 low; SS-001 2 high + 54 low; TP-001
41 low; SC-001 32 medium + 6 low; CL-001 3 high + 26 low; AM-001 1 high +
6 medium.

## Critical triage (all manually inspected — all true positives)

- 7 AG-RC-001 curl|sh: real installer pipelines — dokploy ansible task
  (muffin-deployment), uv installer (keboola agnes), rustup in CodeBuild
  buildspec (stella arenabench), omnigraph installers (mitodl agent-kit ×2),
  mise installer (msavdert dotfiles), Antigravity CLI installer strings in an
  adapter yaml (crew-research pattern, smileynet). All live pipes or
  install-command carriers — correct.
- 1 AG-SK-001 critical: `reverse-skill-bcy skills/llm-security/SKILL.md` — a
  live pentest skill whose attack-level catalog embeds a real zero-width-space
  injection example ("Ign​ore​all…previous…instructions", U+200B) in prose.
  Hidden characters in a live skill file are executed agent instructions —
  hot-by-design per the r393/r397 deliberate-payload precedent; the fenced
  injection-override pattern in the same file already reports low.

## High triage (all manually inspected — all true positives)

- 82 AG-SK-002: real unscoped `Bash`/allowed-tools pre-approvals in live
  skill/command frontmatter (marketplace, maka-agent, canary, iblai …).
- 3 AG-CL-001: the same real-shaped Windsurf `firebaseApiKey` AIza literal
  seen in r405's 9router (KirisakiRei fork ×2 — static analysis cannot prove
  referrer restrictions; stays high per r405 ruling) + a real-form
  `X-API-Key`/`X-MCP-Key` pair hardcoded in LLMWikiNG `.agents/mcp_config.json`.
- 1 AG-AM-001: the same LLMWikiNG server on plain HTTP with those tokens.
- 2 AG-SS-001: genuine GCE metadata service-account email/token fetches
  (keboola agnes `group_sync.py`, `bigquery/auth.py`) — live metadata access.

## Medium/low sampling by category

- RC-001 medium: real `execSync` call points and prose/spec carriers of
  install one-liners (rulesync test-fixture markdown template literal —
  JS/TS template literals are deliberately excluded from the r391 backtick
  prose downgrade; Shadow-Warden explanation strings; autorun print() install
  hint per the r393 print-hint ruling) — semantics correct.
- SC-001 medium: unpinned `@latest`/bare npm specs, OpenCode startup plugins,
  hve-core mutable `#plugins-v3.2.2` marketplace ref — correct.
- AM-001 medium: remote servers without auth headers (context7, testdino,
  TRES Finance, leadconnectorhq) — verify-auth wording correct.
- SS-001/CL-001/TP-001/SK-001 low: defensive/blocking contexts, test-path
  secret shapes, redaction vectors, BOM/zero-width artifacts in doc trees
  (Banuba far-general docs ×many) — all correctly quiet.

## Outcome

No generalizable scanner defect established this round (no two-independent-
sample FP class): honest no-defect record, docs only, no changeset.
