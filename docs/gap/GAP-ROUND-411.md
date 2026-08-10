# GAP-ROUND-411 — fresh-corpus verification + AG-SS-001 defensive-context fix

Fresh-corpus round following the v0.67.53 release closeout (r409 fence fix on
npm, production website/API/feed consistent at 109 advisories).

## Corpus

- 1,645 candidates from 30+ agent/MCP/plugin/skill/client surface queries
  (window `pushed:>2026-07-27`, ≤200 MB, non-fork).
- Historical dedupe against `seen.txt` → 992 fresh; 140 selected; 140/140
  cloned (0 failures).
- **Dedupe-file gap found and fixed**: `seen.txt` had not accumulated all
  historical round picks (only part of pre-r409 rounds), so 15/140 selected
  repos were re-scans of earlier corpus repos (incl. `AnalystTom/Agent_panel`
  from r399). `seen.txt` has been rebuilt as the union of all `r*/pick.txt`
  (now 2,629 entries); 125/140 repos this round were genuinely fresh.

## Scan

- 895 findings across 140 repos; 0 scan errors.
- 23 critical / 151 high / 410 medium / 311 low.

## Critical — all inspected individually

- 20 AG-RC-001 curl|sh: real live install pipelines (hermes-agent, uv, sdkman,
  zoxide, claude.ai/install.sh, nodesource, gcloud SDK, fly.io, trufflehog,
  cursor.com/install, clerk API-spec pipe into node) — true positives kept.
- fayzan123/context-audit: deliberately malicious skill fixtures (injection +
  concealment + zero-width + tag-char smuggling) — true positives kept per
  r393/r397/r403 precedent.
- devedge09/grckit `collect.md` U+200B mid-word (`Guard​Duty`): word-splitting
  hidden char is exactly the split-evasion shape AG-SK-001 keeps critical by
  design (r345); benign here but the grading contract is correct — kept.
- costrict-plugins-repo `doctor.sh:315`: curl|bash inside a quoted remediation
  hint passed as the *second* string argument on a continuation line — the
  continuation-arg mask only recognizes single-string continuation lines.
  **Single sample** across 19 corpora — below the multi-sample bar; deferred.

## High — relevant findings inspected

- 141 AG-SK-002: real unscoped Bash / permission pre-approvals — correct.
- AG-CL-001: real-shape AIza key literal (OpenBiliClaw InnerTube), live
  JWE user token in `tools/mcp.example.json` (global-harness) — kept; the
  ai-guardian `scenarios/*/secret-scanning.yaml` fake AKIA prompts are guard
  test scenarios outside the test-path list — **singleton class, deferred**.
- AG-SC-002 mcp-mermaid compromised release advisory — correct.
- **AG-SS-001 (3 hits, 2 misgraded — fixed this round, see below)**.

## Generalized defect fixed: AG-SS-001 defensive-context gaps (2 samples)

Two independent fresh repos carried clearly defensive SSRF code graded high:

1. `RedHatProductSecurity/ai-guardian` `web/pages/ssrf.py` — module docstring
   "SSRF Protection page — network request filtering and IP blocking" with a
   `CORE_PROTECTIONS` blocklist table. The header heuristic only accepted
   verb-first order ("prevent … SSRF"), not noun-first "SSRF Protection".
2. `santifer/career-ops` `test-all.mjs` — a `blockCases` list of URLs the SSRF
   guard must block. The camelCase lowercase identifier set covered
   `denied|deny|dangerous` but not `block` (and `blockCases` has no word
   boundary for the word-boundary set).

Fix (`packages/core/src/rules/ssrf.ts`):
- `headerDefensive` also accepts `SSRF` followed within 40 chars by
  `protect*/block*/filter*/prevent*/mitigat*/guard*` in the file header.
- camelCase lowercase set adds `block(ed)?[A-Z]` (blockCases, blockList…).

Verification: full head-to-head across all 19 corpora (~2,230 repos),
AG-SS-001 only, npm 0.67.53 vs patched build — diff is exactly the two target
downgrades (high→low), zero other drift; synthetic `harvest.sh` IMDS token
theft stays high (regression test added).

Related singleton still deferred: `AnalystTom/Agent_panel` `isPublicHttpHost`
(metadata IP only in a comment on a `return false` line inside a
positively-named predicate) — re-seen this round but it is the *same repo* as
r399, so still one independent sample.

## Medium/low — sampled per rule

- AG-RC-001 medium: real `spawnSync('sh'` call sites, comment-line curl|sh
  already low with comment wording — correct.
- AG-SC-001: unpinned npm servers, mutable git marketplace sources, `-y`
  auto-confirm — correct.
- AG-AM-001 (39): unauthenticated remote endpoints, majority concentrated in
  generated configs of a few repos — rule semantics correct.
- AG-SK-001 low: fenced-block quoted injection examples (r409 behavior
  confirmed on fresh data) — correct.
- AG-TP-001/CL-001 low: test-path hidden chars and fixture secrets — correct.

## Validation

- `pnpm build` / `pnpm test` (535 core incl. new regression + 60 cli +
  30 convert) / `pnpm lint` / `pnpm typecheck` / `git diff --check` all green.
- Patch changeset added (`round411-ssrf-defensive-context`).
