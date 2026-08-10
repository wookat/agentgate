# GAP-ROUND-376 — routine windows + r375 residual-medium review

Date: 2026-08-04. Advisory count: 106.

## Advisory windows — all clear

- Authenticated GHSA watch: three hits in the 8-day window
  (GHSA-5r3x-hrv2-fg58, GHSA-rmrp-j9qh-xwh9, GHSA-xm38-q6p9-jrgg), all
  already triaged into `advisories/watch-ignore.json` in round 374
  (GitHub-only, package names never published).
- OSV exports: npm ETag unchanged (e31fe9a2…), PyPI ETag unchanged
  (df798022…) since round 374.
- Nine-client version window: unchanged (Claude Code v2.1.226, Gemini CLI
  v0.54.4, Copilot CLI v1.0.78, OpenCode 1.18.15, Crush v0.88.1, Qwen Code
  v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52).
- Production consistency: API `.advisories` = 106, feed `.items` = 106
  (cache-busted).

## r375 residual-medium review (849 AG-SK-002 / 79 AG-RC-001 / 9 AG-SC-001)

AG-SK-002 and AG-SC-001 mediums sampled — rule-semantics true positives.
AG-RC-001 curl|sh text warnings (47) reviewed source-by-source. Most are
correct (real installer instructions in landing content, installer fallback
messages, defensive prose in agent prompts). One generalizable precision
defect confirmed:

**Deny/guard pattern tables declared by assignment.** `isDenyListEntry()`
only recognized `key:` forms within 30 lines. Guard tables in source files
declare by assignment (`export const denyBashPatterns = [` 54 lines above
its entries in Inakitajes/convoy `src/bash-policy.ts`; `const DANGEROUS = [`
with `name:`/`re:` rule-entry fields between the declaration and the matched
comment in MANVENDRA-github/agentry `hooks/guard-dangerous-bash.js`;
`dangerous = [`/`DANGER = [` tables in Bashara-aina/Babas_Swarms_bot and
Eitanvinokur12345 security_preflight.py; `_HARNESS_SHIPPED_DENY_LITERALS`
frozenset in Ecro/harness-maker render.py). Fix: recognize assignment-form
declarations (identifier tokenized on case/underscore boundaries against
deny/block/blacklist/disallow/forbid/danger vocabulary), scan past
rule-table entry fields (`name:`/`re:`/`pattern:`/…), window 30 → 60 lines.
Innocuous enclosing assignments (`const messages = [`) stop the scan and do
not downgrade — regression pinned.

## Head-to-head (7 corpora, 973 repos)

Base = merged main (post-#554), New = this branch. Findings-only diff:
exactly 8 repos changed, all the reviewed deny/guard-table class
(10 findings medium→low + 3 test-path low findings picking up the more
specific deny-list wording). Zero other drift; live installer pipelines,
IMDS collectors, and malicious fixtures unchanged.

## Validation

`pnpm build`, `pnpm test` (581), `pnpm lint`, `pnpm typecheck`,
`git diff --check` all green.
