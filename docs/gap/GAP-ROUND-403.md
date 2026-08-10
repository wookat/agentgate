# GAP-ROUND-403 — fresh-corpus verification (honest no-defect round)

Date: 2026-08-03. Baseline: main @ #605 (0.67.51 published and closed out).

## Corpus

Fresh 140-repo corpus (`corpora/r403`): 24 agent-surface repository-search
queries (`pushed:>2026-08-02`), 1,575 candidates → 1,133 after dedupe against
the cumulative seen list → 140 picked and shallow-cloned. Full scan: 955
findings, zero scan errors.

## Severity/rule distribution

| Bucket | Count |
| --- | ---: |
| AG-SK-002 medium / high | 420 / 256 |
| AG-RC-001 medium / low / critical | 47 / 32 / 12 |
| AG-TP-001 low | 46 |
| AG-SS-001 low / high | 40 / 1 |
| AG-SK-001 low / critical | 31 / 5 |
| AG-CL-001 low / high | 25 / 5 |
| AG-SC-001 medium / low | 21 / 11 |
| AG-AM-001 medium | 2 |
| AG-SK-003 critical | 1 |

## Criticals — every one read at source

- 12 AG-RC-001 curl|sh: all real, live install pipelines (nvm ×2, rustup ×2,
  uv ×3, Ollama, Bun, get.docker.com, golangci-lint installer, opencode.ai
  installer in a GitHub Action) — true positives, keep hot.
- 5 AG-SK-001 + 1 AG-SK-003: intentional malicious fixtures in two
  skill-scanner repos (RedFlag-CI `__fixtures__` bidi/tag/ZWSP CLAUDE.md;
  claude-skill-audit `test/fixtures/malicious` hook + exfil SKILL.md) — the
  established policy keeps deliberately-malicious skill payload fixtures hot
  (cf. r393/r397); the same repos' non-skill fixture files correctly report
  low via test-path grading.

## Highs — every one read at source

- AG-SK-002 (256): unscoped `Bash` pre-approvals, dominated by one plugin repo
  (mindrian-os-plugin, 204) — real grants, rule semantics correct.
- AG-CL-001 (5): scrubber-rejection fake `sk-ant-…` in a verify script (value
  not run-shaped — watch list); Windsurf/Codeium public `firebaseApiKey`
  constants ×2 (one repo — client-distributable key, static analysis cannot
  confirm; watch list); real `.mcp.json` env `OPENAI_API_KEY:
  "unused-bge-m3-is-authless"` placeholder phrase (watch list, singleton);
  none meets the multi-repo generalization bar.
- AG-SS-001 (1): adversarial SSRF fixture under `backend/benchmark/corpus/` —
  scanner-benchmark payload kept hot per the r393 precedent for
  benchmarks/corpus malicious fixtures.

## Medium/low sampling by category

AG-RC-001 mediums: real `require('child_process')`+execSync call sites,
non-executable curl|sh prose/i18n strings correctly medium with prose wording,
one dynamic-exec token inside a security rule-DB JSON description string
(mindrian cve-db.json — singleton, watch list). AG-SC-001: real unpinned npm
servers and `#release`-ref marketplace sources. AG-AM-001: well-known OAuth
remote endpoints (Atlassian/Figma), verify-out-of-band wording correct.
CL/SS/TP lows: test-path fakes, defensive guards, sanitizer test vectors —
all correctly quiet.

## Routine windows

- Authenticated advisory watch: zero uncovered MCP-related advisories.
- OSV npm/PyPI: ETags identical to r402 (`03cda0b0…` / `22a6e7d4…`), MAL-set
  diffs empty.
- Client version window: all nine unchanged from r402 (Copilot CLI v1.0.79
  already assessed there).

## Watch list additions (singletons, deferred)

1. Placeholder-phrase env values (`unused-bge-m3-is-authless`) passing the
   opaque-string check in the server env-var test — needs more wild samples.
2. Named `firebaseApiKey` constants outside Firebase config object shape.
3. Dynamic-exec tokens inside security-rule-database JSON description strings
   (same family as the deferred rules.ts title singleton).

## Outcome

No new generalizable defect found. No code change, no changeset — docs-only
evidence record.
