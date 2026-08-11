# GAP-ROUND-431 — fresh-corpus verification (140 repos) + AG-SS-001 comment-line fix

Round 431 is a fresh-corpus round: a brand-new 140-repo corpus across the seven
agent-surface families, fully scanned and triaged item by item. One generalized
defect was found (multi-repo evidence) and fixed in this round: AG-SS-001
graded metadata-endpoint literals in comment lines as live SSRF vectors.

## Corpus

- Searched surfaces: Claude Code skills/SKILL.md, mcpServers/mcp.json configs,
  OpenCode plugins, Claude plugin marketplaces, Cursor rules, Copilot
  instructions, Gemini CLI extensions, Goose recipes, Codex config, AGENTS.md,
  hooks/settings, Qwen Code, Kiro steering, Roo modes, Amazon Q agents,
  Windsurf rules, Crush, Factory Droid, Antigravity workflows.
- 2,747 candidates → 1,414 fresh after dedupe against all prior rounds
  (`seen.txt`) → 140 selected → 140 cloned (0 failures). Read-only: no setup,
  install, or execution inside corpus repos.
- Scan: 306 findings, 0 parse failures. 12 critical / 56 high / 77 medium /
  161 low.
- Warnings: 11 repos reported "nothing was scanned" — all verified to contain
  no discoverable MCP client configs (docs-only / library repos matched by the
  corpus search but with no agent config surface); correct diagnostics, not
  scanner defects. The remaining stderr noise is YAML unknown-tag warnings
  (CloudFormation `!Ref` in corpus repos), non-fatal and expected.

## Critical triage (12/12 inspected)

All true positives, preserved:

- Real installer pipelines (curl|bash / iwr|iex for uv, rustup, bun, claude
  installers and similar) indicated in skills/hooks — genuine
  download-and-execute surface.
- `samlindskog/funnelmanager`: active operational concealment plus an explicit
  pipe-to-shell payload in skills — genuine malicious/red-team shape, stays
  critical.

## High triage

- 46 AG-SK-002: real unscoped Bash/Write/permission pre-approvals and
  enableAllProjectMcpServers grants — true positives.
- 6 AG-CL-001: real credential-shaped literals (redacted here) — true
  positives.
- 4 AG-SS-001: 2 × KeeperHub (doc-comment mentions only — the generalized FP
  fixed this round), 2 × pipixia-labs/openteamwork (defensive control-plane
  classification in `network_gate.py` / `egress_policy.py` — set-membership
  comparison, not a fetch; singleton pattern, deferred to the gap list, not
  generalized).

## Generalized defect fixed: AG-SS-001 comment-line mentions

`checkSource` used the first regex match in the whole file to place and grade
the finding. When that first mention sat on a comment line, the context window
missed the defensive markers and the file graded high — and conversely a doc
comment above live code decided the line number.

Independent real-repo evidence (≥2 repos, not template copies):

- r431 `KeeperHub/keeperhub` `lib/safe-fetch.ts` — an SSRF-blocking wrapper
  whose only metadata mention is a doc comment about IPv4-mapped forms
  (`::ffff:169.254.169.254`); graded high.
- r431 `KeeperHub/keeperhub` `lib/security/content-scanner.ts` — defensive
  content scanner listing the metadata IP in a security-pattern comment;
  graded high.
- r425 `brainwhocodes/branchlight-repo` `packages/ai/src/utils/proxy.ts` —
  `isLocalOrMetadataHost` classifier whose doc comment preceded the classifier
  code; the comment decided the reported line.
- r415 `MCPJam/inspector` `server/routes/shared/conformance.ts` and r419
  `Infrawrench` `workflows/fetch.ts` / `uploadthing/client.ts` — redirect
  re-check guards with metadata literals only in explanatory comments (the
  r415-deferred singleton, now generalized).

Fix (`packages/core/src/rules/ssrf.ts`): scan all metadata matches, skip those
on comment-only lines (`//`, `/*`, `*`), and let the first non-comment mention
drive the existing context/severity logic. If every mention is a comment,
report low with comment wording. A comment above a live fetch no longer masks
it: Infrawrench `build-cloud.ts` (`tokenFromMetadataServer` dialing
`http://169.254.169.254/...token`) still reports high, as do branchlight's
`aws-credentials.ts` / `google-auth.ts` live credential clients.

Regression tests (3 new, `packages/core/test/rules.test.ts`): comment-only doc
prose → low; leading comment does not mask a live fetch below (line points at
the fetch); doc comment above a classifier → defensive low at the classifier
line. Existing bare-fetch-high / test-path / defensive-context tests unchanged.

Verification:

- 169-repo historical head-to-head (all corpus repos containing metadata
  literals; npm 0.67.58 vs patched build): 708 AG-SS-001 records both sides;
  exactly 6 intended high→low downgrades (the files above), 0 upgrades, 0
  other severity drift. Baseline 113 high / 595 low → patched 107 high /
  601 low.
- Full r431 140-repo rescan: 306 → 306 findings; the only changes are the two
  KeeperHub high→low downgrades and comment-wording on two already-low
  KeeperHub defensive findings.

## Medium/low sampling (by rule category)

- AG-RC-001 medium/low: dynamic-exec primitives in a scanner's own hardening
  tests (hackmyagent) and quoted curl|sh test payloads — correct quiet/medium
  grading.
- AG-SK-002 medium: real Write pre-approvals and enableAllProjectMcpServers —
  correct.
- AG-CL-001 low: fake keys in test paths — correct quiet grading.
- AG-TP-001 low: BOM (U+FEFF) artifacts — correct low.
- AG-SK-001 low: injection patterns inside fenced code blocks (canary skills,
  examples) — correct quiet grading.
- AG-SC-001 / AG-AM-001: real unpinned/mutable sources and unauthenticated
  remote endpoints — correct.
- AG-SS-001 low: test fixtures and defensive guards — correct.

## Deferred singletons

- pipixia-labs/openteamwork defensive set-membership metadata classification
  (`ipaddress.ip_address(...)` set literals) — one repo; current grading is
  high on the literal lines; deferred until a second independent repo shows
  the same shape.

## Gates

`pnpm build` / `pnpm test` (547 core + 60 cli + 30 convert) / `pnpm lint` /
`pnpm typecheck` / `git diff --check` all green locally. Ordinary GitHub
Actions remain unavailable; this round ships under the degraded gate
(GitGuardian + local checks green, disclosed).
