# GAP-ROUND-427 — fresh-corpus verification (honest no-defect round)

Date: 2026-08-03. Scanner: `main@6b0555e` (post-0.67.57).

## Corpus

Fresh 140-repo corpus across the seven agent-surface query families
(`/home/ubuntu/corpora/r427`): 2,771 candidates → 1,530 unseen after dedupe
against the historical `seen.txt` → 140 picked, 0 clone failures. Scan:
457 findings (7 critical / 90 high / 260 medium / 100 low), zero parse
failures (warnings were repo-content diagnostics + 16 legitimate
"nothing was scanned" repos with no agent surface).

## Critical triage (all 7 inspected in source)

- 6 real remote install pipelines: `jsonui-cli` bootstrap curl|bash directed
  at the agent inside a Codex agent-instruction TOML (`agents/test.toml` —
  the instruction tells the agent to run it when the CLI is missing; kept
  hot per r393/r407 precedent for actionable instructions), rustup in a
  container bootstrap (irin), `astral.sh/uv` installers ×2 (facebook-lyr /
  instagram-lyr), `ollama.com/install.sh` (shiroe benchmark host bootstrap),
  nvm v0.40.1 installer (ThisCode). All true positives.
- 1 singleton deferred: `ystsbry_revu` `.goreleaser.yaml` — curl|sh appears
  only inside the release-notes `header:` fenced block (documentation text in
  a release-pipeline config). Single repo; recorded as a slow-burn candidate
  (would extend the r355 CI-pipeline-config exemption), not generalized.

## High triage

- 81 AG-SK-002: real unscoped `Bash` allowed-tools / permission grants
  (wasm-spike 32, Marketing-Agent-OS 16, ThisCode 12, etc.) — verified
  samples all genuine unrestricted pre-approvals. Correct.
- 8 AG-CL-001: all true — a real FinMind JWT hardcoded as an env fallback
  (Stock-Portfolio-System, ×2 vendored release copies) and a real
  `ctx7sk-…` context7 API key duplicated across six client MCP configs
  (maxgfr_conforme). Kept high.
- 1 AG-SS-001: `execution-fixture` HTTP server whose `/api/redirect`
  302s to `169.254.169.254` (kanho532_autopw2) — an SSRF test fixture but
  under `src/`, live redirect target; single repo, kept as-is.

## Medium/low sampling by rule

- AG-AM-001 (22): real unauthenticated remote MCP endpoints (context7,
  supabase, figma, atlassian, custom hosts). Correct.
- AG-SC-001/003: real unpinned npm launch specs. Correct.
- AG-RC-001 medium/low: documentation-context curl|sh graded quiet as
  designed (generated docs content, safety-demo example). Correct.
- AG-SK-001 low: structural `<Instructions>` tags and fenced injection
  examples graded low as designed. Correct.
- AG-TP-001 low: hidden Unicode in tests/vendored JS/eval JSON graded
  quiet per test-path rules. Correct.
- AG-SS-001 low: defensive `ssrf_protection.py`, fetch-guard sources, and
  test paths. Correct.

## Outcome

No two-repo generalizable defect. No code change, no changeset. One new
singleton slow-burn recorded (goreleaser release-notes header text).

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. GitGuardian +
local lint green (docs-only change).
