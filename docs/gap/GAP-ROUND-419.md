# GAP-ROUND-419 — fresh-corpus verification + replicated "sidenote" marker fix

Date: 2026-08-03. Scanner: local build at main@cf9c040 (post-#628). GitHub
Actions outage still in effect — degraded gate (GitGuardian + local checks
green, disclosed on the PR) applies to this round's PR.

## Corpus

- Searches: 26 agent-surface queries (skills/MCP/plugins/hooks/instructions/
  clients), GitHub API pages 1–4 × 50, forks and >200,000 KB repos excluded.
- Candidates: 2,680; historical `seen.txt`: 2,911 entries; fresh: 1,662.
- Selected: 140; cloned: 140 (0 failures). Read-only; no dependency installs.
- Scan: `agentgate scan <repo> --format json --fail-on never` per repo.
  385 finding lines; 17 critical / 140 high / 107 medium / 121 low.
- Scanner stderr: 137 lines — all either the expected "nothing was scanned:
  no MCP client configs" warning for repos with no config surface, or a
  benign YAML `TAG_RESOLVE_FAILED` warning (`!Equals` CloudFormation tag).
  Zero parser failures.

## Critical triage (17/17 inspected)

- 16 × AG-RC-001 real remote installer pipelines — all true positives kept:
  rustup (Aitherium ×2, TreMuraki cloud-init, rtk-ai cloud-init), uv
  (Ronnasayd, benjamin-blake, cognizant-ai-lab), trufflehog install.sh
  (Ditto190, swarm-ai-research), factory.ai CLI (Factory-AI droid-action ×5),
  bun (midnghtsapphire skill yml), remote `check-compliance.js | node`
  (midnghtsapphire bootstrap).
- 1 × AG-SK-001 "sidenote" in j0hanz_j0hanz-marketplace
  `plugins/tutor/skills/teach/references/DESIGN.md:22` — benign typography
  prose ("margin hold citation as sidenote"). Second independent repo showing
  the same shape (first: r417 Sinity_sinnix html-report SKILL.md:159) →
  generalization bar met → fixed this round (below).

## High triage

- AG-SS-001 (79): xbill9_gemma4-dev (76) — active GCE metadata token
  fetches feeding pip index auth in TPU startup scripts/MCP servers; true
  positives kept high. Infrawrench (3) — defensive block-comment prose
  explaining metadata exposure plus an SSRF validator folding IPv6-mapped
  169.254.169.254; single-repo shape, deferred (no rule change).
- AG-SK-002 (61): real unscoped `Bash` allowed-tools pre-approvals in skill/
  command frontmatter (rtk-ai, bitflight-devops, Rconman99, …) — correct.

## Medium/low sampling by rule

- AG-CL-001: test/fixture fakes, redaction test vectors, Firebase
  client-distributable keys, demo JWTs — graded correctly.
- AG-TP-001: hidden chars in test files/BOM boundaries — low, correct.
- AG-SK-001 low: fenced quoted "ignore previous instructions" examples —
  correct per fence rules.
- AG-RC-001/SC-001 medium/low: installer literals and `-y`/unpinned
  combinations — semantics correct.

## Source change (this round)

The bare `\bsidenote\b` "known poisoning marker" now requires a directing
verb (`pass/send/include/… as|in|into a sidenote`); `conversation_history`
unchanged. Regression tests: verb-directed sidenote + the id_rsa demo payload
stay flagged; three benign typography sentences stay silent.

Evidence: head-to-head (npm 0.67.55 vs patch) across all 23 corpus repos
containing "sidenote" — exactly 3 downgrades, all verified benign (r417
sinnix SKILL.md:159 critical, r419 j0hanz DESIGN.md:22 critical, r419 j0hanz
VOICE.md:31 code-identifier low); zero other drift. Local build/test
(540 core + 60 cli + 30 convert)/lint/typecheck/diff-check green. One patch
changeset added.

## Deferred singletons

- Infrawrench defensive metadata prose/validator (1 repo, 3 hits) — watch.
- r417's four singletons remain single-repo (the sidenote one is now fixed).
