# GAP-ROUND-437 — fresh-corpus validation (140 repos)

Fresh-corpus round. One generalized defect found and fixed (AG-TP-001 precision on
plain-data JSON); everything else verified as correct scanner behavior.

## Corpus

- 4,459 raw candidates from seven agent-surface searches → 3,899 unique → 3,825
  fresh after dedupe against 4,172 historical repos (`/home/ubuntu/corpora/seen.txt`)
- 140 repos selected, shallow-cloned read-only, 0 clone failures
- Scan: `agentgate scan <repo> -f json --fail-on never` per repo; 4,274 findings
  (23 critical / 608 high / 631 medium / 3,012 low), zero scan crashes

## Critical review (23/23 inspected in source)

- 22 × AG-RC-001: real remote install/exec pipelines — Docker `get.docker.com | sh`
  (Borre, Senfkorn-UG ×2), Tailscale installer ×6 (Senfkorn-UG), goose
  `download_cli.sh | bash` (ReZorg, mbarnes mirror), rustup `sh.rustup.rs | sh`
  (mbarnes), JFrog CLI (mbarnes NeMo CI script), just/mise installers (mombe090),
  dotfile bootstrap pipelines (SimonKrenn ×2, htlin222, outfitter-dev), openclaw
  `install.sh` real `curl | bash` (ibragimov-oasis; sibling `test-install.sh:1782`
  is quoted test text and correctly separate). All true positives.
- 1 × AG-SK-001 concealment critical: `doublecheck.agent.md:15`
  "You do not tell the user what is true. You extract claims, find sources…" —
  benign epistemic role prose, not action concealment. The only other
  "do not tell the user…" text in the corpus (mbarnes `a11y.instructions.md`)
  correctly does NOT fire under the r354 interaction-hiding-object gate.
  Singleton FP shape (1 repo) — recorded, below the two-repo bar.

## High review (608)

- AG-TP-001 (355): **generalized false positive — fixed this round.**
  354 hits in `mreichhoff_TrieLingual` (`public/data/*/subtries/*.json` language
  corpora) and 1 in `mbarnes-code_expert-dollop`
  (`modules/productivity/mealie/frontend/lang/messages/ar-SA.json` locale catalog).
  All are bidi formatting chars (U+202A/202B/202C/202D) inside JSON string values
  of valid, plain-data JSON — legitimate mixed-direction text rendering, not
  executable or agent-facing content. Two independent repos → generalized.
- AG-SK-002 (231): real unscoped Bash/tool pre-approvals — ibragimov-oasis (94,
  command farm), CX330Blake dotfiles skills-archive (36), Actual-Chat (33),
  jay6697117 (16), rune-langium/epiphan (12 each), rest small. Sampled per repo:
  all genuine allowed-tools grants.
- AG-CL-001 (13): mostly real — live sk- keys (francomascareloai ×3, htlin222),
  live Tavily key in `.mcp.json` (Souzaphone), real committed Codex OAuth tokens
  (`mavi78_yildiz-salon/.codex/auth.json` — serious), real AWS SES SMTP creds
  (SAP params.json), real-form AIza keys (Stephenfre fallback, SDustDreams scoop
  font URL). Three benign singletons recorded: `react-native-sk-loader.json`
  (package-name slug matching `sk-…`), SAP script comment example `ghp_…`
  ("For example" doc line), noseyparker custom detection rules example `gho_…`
  (defensive rules file not covered by the secret-scanner-config exemption).
  Each is a single repo — below the two-repo bar.
- AG-SS-001 (7): real metadata-endpoint use — GCE bootstrap scripts (Senfkorn-UG,
  getvictor EC2/terraform, Borre ECS) and offensive SSRF skill scripts
  (CX330Blake skills-archive ×2). All correct.
- AG-SC-002 (2): correct advisory matches — `@mastra/mcp-docs-server`
  MAL-2026-5956 (0xnyn) and `nx` MAL-2025-41443 (mbarnes).

## Medium/low sampling (per represented family)

AG-SK-002 medium (real Write/WebFetch grants), AG-SC-001 medium/low (real unpinned
specs, `-y` auto-confirm), AG-AM-001 (real header-less remote servers), AG-RC-001
medium/low (doc-text curl|sh, `$eval(` review prompts, comment-line wording per
r369/r395), AG-SC-003 (correct bundled-advisory matches), AG-SK-001 low
(structural tags / fenced examples), AG-CL-001 low (test/fixture wording),
AG-SS-001 low (test-path/defensive wording per r431), AG-TP-001 low
(TrieLingual bulk). All consistent with rule semantics.

stderr: 4,094 lines, all benign diagnostics (3 malformed-JSON parse warnings on
genuinely broken `.mcp.json` files, YAML `!include` unresolved-tag warnings);
zero scan failures.

## Fix

`isJsonStringData()` in `packages/core/src/rules/tool-poisoning.ts`: when a
`.json` file parses as JSON and every hidden char sits inside a string token,
AG-TP-001 grades low with "inside JSON string data" wording. Guards: agent-facing
config basenames (mcp/settings/plugin/marketplace/hook/agent/config JSON) never
downgrade; invalid JSON never downgrades; hidden chars outside string tokens keep
high. Regression test added (locale JSON low / broken JSON high / settings JSON
high).

Full-corpus head-to-head (140 repos, 4,274 findings before and after): exactly
355 target AG-TP-001 high→low in the two evidence repos; zero other drift
(remaining diff lines are line-field formatting between the two harness scripts).
Local gates: build, 550+60+30 tests, lint, typecheck, `git diff --check` all green.

## Singletons carried (below two-repo bar)

1. AG-SK-001 concealment on benign epistemic prose ("do not tell the user what is
   true") — doublecheck.agent.md.
2. AG-CL-001 on package-name slugs containing `-sk-` (nice-registry dependents).
3. AG-CL-001 on comment "For example" doc tokens (SAP script) and noseyparker
   custom detection-rule examples.

## Disclosure

GitHub Actions remains unavailable; gates run locally and stated in the PR.
Corpus repos were read-only: no installs, no setup scripts, no execution of
corpus code.
