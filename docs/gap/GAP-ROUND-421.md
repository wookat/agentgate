# GAP-ROUND-421 — fresh-corpus verification + replicated defensive-detection-pattern fix

Date: 2026-08-03. Scanner: local build at main@0d231de (post-#631, 0.67.56).
GitHub Actions outage still in effect — degraded gate (GitGuardian + local
checks green, disclosed on the PR) applies to this round's PR.

## Corpus

- Searches: seven agent-surface categories (skills/MCP/plugins/hooks/
  instructions/clients), forks and oversized repos excluded.
- Candidates: 2,936; fresh after `seen.txt` dedupe: 1,727.
- Selected: 140; cloned: 140 (0 failures). Read-only; no dependency installs.
- Scan: `agentgate scan <repo> --format json --fail-on never` per repo.
  375 finding lines; 14 critical / 48 high / 109 medium / 204 low.
- Scanner stderr: 3,719 lines — "nothing was scanned" warnings, unavailable
  live tool surfaces, and benign YAML tag warnings. No repo was modified.

## Critical triage (14/14 inspected)

- Real remote installer pipelines kept critical: pyenv.run (haoblackj
  dotfiles), x.ai CLI + Bun/Ollama (jikig-ai soleur), UV installer
  (nicholas678 TrendRadar), installer references in validation scripts
  (wjhuang88 talos).
- Intentional security fixtures (whaojie797 design-skill-sentry
  tests/fixtures curl|sh + injection SKILL.md; Asymptote-Labs agent-beacon
  test-rule curl|sh examples) — fixture/test-path grading correct.

## High triage

- AG-SK-002 (35): genuine unrestricted `Bash`/dangerous permissions — kept.
- AG-SS-001 (9): real or high-confidence metadata/SSRF paths — kept.
- AG-CL-001 (2): credential-shaped fixture/test data — graded per test-path
  rules, correct.
- AG-TP-001 (2): deliberate hidden-unicode **detection patterns** judged
  attack payloads at high — Asymptote-Labs_agent-beacon
  `rules/prompt-injection/invisible-character-prompt-injection.rule.yaml`
  (bidi range in a detection regex/fixture) and MythologIQ-Labs-LLC_Qor-logic
  `qor/scripts/prompt_injection_canaries.py` (bidi range in a canary
  `re.compile` character class). Same shape previously seen in r417
  Pantheon-Security_medusa `signatures.yaml` (deferred singleton then).
  Three independent repos → generalization bar met → fixed this round.

## Medium/low sampling by rule

- AG-RC-001/SC-001: installer literals, `-y`/unpinned combos — correct.
- AG-CL-001: fixture fakes and placeholder-shaped values — correct.
- AG-SK-001 low: fenced quoted examples — correct per fence rules.

## Source change (this round)

AG-TP-001 now recognizes two defensive detection-pattern shapes and grades
them low: (1) a regex character class on the hit line containing every hidden
character (`re.compile(r"[\u202a-\u202e…]")`, YAML `patterns:` entries), and
(2) a quoted rule-test fixture payload in a detection-rule context
(rule/canary/signature/verdict/detect vocabulary). Both require hidden-unicode
attack prose in the ±3-line window or the detection-rule filename, so a hidden
character smuggled into ordinary code stays high.

Evidence: head-to-head (npm 0.67.56 vs patch) across all 97 corpus repos
containing trojan bidi/tag characters (314 AG-TP-001 findings per side) —
exactly 3 severity downgrades, all verified defensive (agent-beacon rule.yaml,
Qor-logic canaries.py, medusa signatures.yaml:130), zero upgrades; remaining
diff lines are same-severity low line-number drift where the reported hit
moved past a now-classified defensive hit. Ordinary-code bidi payloads pinned
high by regression tests. Local build/test (543 core + 60 cli + 30 convert)/
lint/typecheck/diff-check green. One patch changeset added.

## Deferred singletons

- medusa `medusa/core/rule_integrity.py:85` (`_BIDI_OVERRIDE = re.compile…`)
  stays high: the attack prose sits one line above the ±3 window and the
  `_BIDI_` identifier is underscore-bound (no word boundary). Single repo for
  that exact shape — watch, no window widening on one sample.
- Infrawrench (r419) and r417 non-sidenote singletons remain single-repo.
