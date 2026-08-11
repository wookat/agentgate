# GAP-ROUND-435 — fresh-corpus verification (generalized AG-RC-001 fix)

Round 435 built a fresh 140-repository corpus of real agent-ecosystem repositories,
scanned it read-only with the current main build, and manually triaged every
critical, every relevant high, and per-rule samples of medium/low findings.
One generalized scanner defect was confirmed across two independent repositories
and fixed in this PR.

## Corpus

- Search surfaces: Claude Code skills/SKILL.md, mcpServers/mcp.json configs,
  OpenCode plugins, Claude plugin marketplaces, Cursor rules, Copilot
  instructions, Gemini CLI extensions, Goose recipes, Codex config/AGENTS.md,
  agent hooks/settings, Qwen Code, Kiro steering, Roo modes, Amazon Q agents,
  Windsurf rules, Crush, Factory Droid, Antigravity workflows.
- 2,669 unique candidates → 1,353 after dedupe against all prior rounds
  (`seen.txt`) → 140 selected (seeded shuffle).
- Clones: 139/140 succeeded; `JackyMe/ai-knowledge-base` failed (removed/private)
  and was replaced by a seeded re-draw (`micro/mu`). Final corpus: 140.
- Repositories were evidence only: no installs, no setup, no execution, no
  modification.

## Scan results (baseline = main @ 0.67.59 behavior)

541 findings: 9 critical, 94 high, 181 medium, 257 low.

Scanner diagnostics (`stderr`): all YAML warnings were CloudFormation
short-form tags (`!Sub`/`!Ref`/`!Not`/`!Equals`) and a Helm `!override` tag —
benign unresolved-tag notices from the YAML parser, no parse failures.
12 "nothing was scanned" warnings were verified correct (no agent config
surface); 10 "server(s) not contacted" notices are the expected static-scan
hint.

## Critical triage (9/9 inspected in source)

| repo | file | verdict |
|---|---|---|
| JoeyEarlyToBed/TrendRadar | setup-mac.sh (uv installer) | true positive — live `curl \| sh` |
| Misaka477/Natalia-Cli | vendored wezterm `.cirrus.yml` (rustup) | true positive by current policy; `.cirrus.yml` is not in the CI-config exemption — **singleton, deferred** (second independent sample required, cf. r427→r428 goreleaser precedent) |
| dinglebear-ai/axon | scripts/dev-setup.sh (rustup) | true positive — live installer |
| djlinnujhey/aeon | stage-vuln-scanner.sh (trufflehog) | true positive — live installer |
| for13to1/dotfiles | _install/linux/curl-install.sh (fnm) | true positive — live installer |
| for13to1/dotfiles | skills/script-analyzer/examples/risky_script.sh | executable risk-example shipped inside a skill tree (`curl \| bash` live if run) — kept |
| hanjukim/prep-cli | scripts/bootstrap.sh:664 | **false attribution** — match landed in a multi-line `fail "…"` login-help message; the file's real live installers are at 875/977 (see fix below) |
| zacgoodwin/AIBootstrap | bootstrap.sh (roborev.io) | true positive — live installer |
| GeckoVision/gecko-surf | skills/anti-poisoning/how-it-works.md U+200C | live hidden char inside a skill file (evasion example in inline code); kept critical per r423/r429 precedent — skills execute as instructions |

## High triage (94/94 reviewed)

- 90 × AG-SK-002: 87 unscoped `Bash` in skill `allowed-tools`
  (geniro-claude-harness 37, Saturate/agents 34, cekura-skills 6, others),
  2 × `permissions.defaultMode: bypassPermissions`, 1 × settings
  `permissions.allow: Bash` — all verified genuine grants in source.
- 3 × AG-CL-001: TrendRadar hardcoded live `sk-…` key in `config/config.yaml`
  and as `run.sh` env fallback; Sma1lboy/kobe hardcoded `Bearer sk-…` in a
  skill script — genuine credential-shaped literals (values redacted here).
- 1 × AG-SS-001: dikaofc/DikaRoute `src/i18n/messages/id.json` — Indonesian
  locale copy stating metadata endpoints "tetap diblokir" (remain blocked).
  Defensive descriptive UI text in a non-English locale file; the defensive
  vocabulary window is English-only — **singleton, deferred**.

## Medium/low sampling (per rule family)

- AG-SK-002 medium (93): sampled — genuine scoped-but-risky grants.
- AG-SC-001 (41 med): auto-enabled plugins from mutable marketplaces — correct.
- AG-SC-003 (4): `mcp-remote` unpinned vs MCPA-2025-0001 — correct advisory match.
- AG-RC-001 medium/low: dynamic-exec primitives in real source/test files,
  comment-line curl|sh — rule semantics correct.
- AG-AM-001 (15): remote servers without auth headers — correct.
- AG-TP-001 low (153): BOM/zero-width/2028 chars in data/test/source files,
  graded low — correct.
- AG-SS-001/CL-001/SK-001 low samples: test paths, defensive contexts,
  fenced examples — correct.

## Generalized defect fixed: print/log-helper message strings (AG-RC-001)

Two independent repositories showed the same shape — an instructional
`curl … | sh` line inside the string argument of a print/log helper function,
which the shell displays but never executes:

1. `openbkn-ai/bkn-foundry` (r433, previously recorded as a single-repo
   deferral): `preflight_strict_warn_or_fail "curl not found (k3s install uses
   curl|sh; …)"` and `info "  curl -sfL https://get.k3s.io | sh"` — the
   leading-downloader ("wrapper idiom") liveness exception kept these quoted
   strings live.
2. `hanjukim/prep-cli` (r435): a multi-line `fail "…"` login-help message
   containing `curl -fsSL $SCRIPT_URL | bash` plus `$(…)` substitutions —
   multi-line strings with substitutions were never maskable, so the critical
   finding pointed at message text instead of the file's real installers.

Fix (packages/core/src/rules/rce-vectors.ts):

- `PRINT_WORD`: segment-wise print/log command vocabulary (`echo`, `info`,
  `warn`, `fail`, `log_*`, `*_warn_or_fail`, …).
- The leading-downloader exception in `maskInertQuotedStrings` and
  `maskMultilineDataStrings` no longer applies when the preceding command word
  is print-like.
- New multi-line pass: a print-helper's double-quoted multi-line message is
  masked even when it contains `$(…)`/backtick substitutions — the
  substitution spans themselves stay live, so `fail "$(curl … | sh)"` would
  still match. The closing quote must end its line to keep pairing safe.
- `run 'curl … | bash'` wrapper idioms and all real pipelines stay critical
  (regression-pinned).

### Verification

- 549 core + 60 cli + 30 convert tests green; lint, typecheck,
  `git diff --check` green. Two new regression tests.
- Full r435 140-repo head-to-head (baseline scan vs patched build): exactly
  one change — prep-cli critical moves from line 664 (message text) to 875
  (real bun installer), severity unchanged. Zero other drift across 541
  findings.
- Historical head-to-head over all 86 retained corpus repos containing
  print-helper + curl shapes (npm 0.67.59 vs patched): exactly the three
  target changes — bkn-foundry preflight critical re-attributed 691 → 1990
  (real nvm installer, stays critical), bkn-foundry
  `infra/sandbox/deploy/manifests/deploy.sh` (info-only K3s hint file) drops
  its critical, prep-cli as above. Zero upgrades, zero other drift.

## Deferred singletons (watch for second samples)

- `.cirrus.yml` as CI pipeline config exemption (Natalia-Cli, vendored wezterm).
- Non-English locale defensive prose for AG-SS-001 (DikaRoute id.json).
- Defensive-doc hidden-char examples in skill trees (GeckoVision) — kept
  critical by policy; noted only.

## Gate disclosure

Ordinary GitHub Actions remain unavailable; degraded gates were used:
full local build/test/lint/typecheck/diff-check plus GitGuardian on the PR.
