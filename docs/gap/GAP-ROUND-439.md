# GAP-ROUND-439 — fresh-corpus verification

Fresh-corpus round. Honest zero: every verified critical/high is semantically
correct or a single-repo shape below the two-repo generalization bar. No
scanner changes, no changeset. Docs only.

## Corpus

- 15 agent-surface GitHub code-search queries (skills, .mcp.json, cursor/codex
  configs, AGENTS.md/GEMINI.md, opencode/kilo/crush, marketplaces, goose
  recipes/hints, hooks) → 4,459 raw candidates → 3,903 unique → 3,689 fresh
  after dedup against the 4,312-repo historical list.
- 140 repos selected (one per owner, seeded shuffle), cloned read-only,
  depth 1. 1 transient clone failure (`fightpig/Words`) retried successfully —
  all 140 present and healthy. No corpus installs, no setup scripts, no corpus
  code executed.
- Full scan (main@0cfc99f, post-#653): **828 findings — 18 critical /
  181 high / 350 medium / 279 low**, zero parse failures (stderr was repo
  diagnostics: malformed JSON, esphome `!lambda` YAML tags).

## Critical (18) — each inspected in source

- **Real install pipelines (12, keep critical)**: NawaMan_CodingBooth ×4
  (code-server, ghcup, jdk, rustup installers), kevinmcmahon_dotfiles ×4
  (rustup, fnm ×2, tailscale — live else-branch of a dry-run guard),
  Sheldon-92_TAD ×2 (raw.githubusercontent tad.sh curl|bash in install.sh /
  upgrade.sh), valksor_kvelmo ×1 real (`install.sh` — see singleton below for
  its twin), sinewaveai test fixture (intentionally malicious SKILL.md,
  kept per r423 precedent).
- **Offensive-security skill (1, keep)**: 26zl_cybersec-toolkit
  offensive-ai-security SKILL.md — deliberate red-team jailbreak instructions,
  hot by design (r425 osforge precedent).
- **Singletons recorded (below)**: valksor error-message twin, Sheldon-92_TAD
  educational failure catalog (×4 counting .agents/.claude duplicate trees —
  one repo).

## High (181) — verified by rule family

- **AG-SK-002 (115)**: all real unscoped `allowed-tools: Bash` /
  permission pre-approvals (icdev-ai 53-skill farm, AgentParadise commands,
  26zl skills, cached plugin marketplaces in ZOE) — rule semantics correct.
- **AG-CL-001 (59)**: predominantly real credentials — anderlli0053 Scoop
  bucket ×39 true-form AIza keys in download URLs + an AKIA key; ZOE ×9 live
  sk-/AIza/JWT literals in .claude configs and executor scripts; mgkcloud live
  Xero OAuth access/refresh tokens in wrangler.toml; vindk8d Supabase token and
  yangsi7 four hardcoded MCP env/header keys in .mcp.json; Octopus hardcoded
  Flask auth token. Two singleton FP shapes recorded below (instar canary
  sentinel, sinewave benchmark corpus).
- **AG-SS-001 (5)**: 26zl real SSRF-exploitation scripts (red-team, keep);
  vindk8d committed venv site-packages (botocore + google-auth live IMDS
  clients — live metadata-fetch code, keep per branchlight precedent).
- **AG-TP-001 (2)**: one repo (sinewaveai) — see singleton below.

## Medium/low — sampled by family

AG-SK-002 medium (228): scoped-but-risky grants, correct. AG-SC-001/AM-001:
real unpinned/mutable launch specs. AG-SC-003 (2): unpinned `mcp-remote`
matching MCPA-2025-0001 — correct. Low families (TP-001 test paths/locale
data, SK-001 fenced/quoted examples incl. 26zl teaching material, RC-001
comment mentions) — sampled, semantics correct.

## Singletons recorded (below the two-repo bar)

1. **sinewaveai bidi.yml (AG-TP-001 high ×2 paths, one repo)**: Semgrep-style
   detection rule with raw bidi chars as *unquoted* YAML `pattern-regex:`
   scalars + defensive comments. The r421 defensive-detection-pattern
   downgrade requires a bracketed char class or a *quoted* fixture string, so
   bare-scalar YAML rule values stay high. No second repo in this corpus or
   any historical scan output.
2. **valksor_kvelmo install.sh:127 (AG-RC-001 critical)**: curl|bash text
   inside a multi-line `error "..."` usage message containing escaped quotes
   (`\"curl … | bash\"`); the r435 print/log-helper masking does not survive
   the embedded escaped quotes. One repo.
3. **Sheldon-92_TAD (AG-SK-001 critical ×4, one repo)**: educational
   prompt-engineering failure catalog quoting an injection incident in inline
   code, and an archived RAG prompt template with `<conversation_history>`
   inside a fenced block. Defensive/teaching context; duplicated across
   .agents/.claude trees.
4. **JKHeadley_instar canary sentinel (AG-CL-001 high)**:
   `sk-CANARY-NEVER-A-REAL-KEY` leak-detection sentinel constant.
5. **sinewaveai benchmark corpus (AG-CL-001 high ×2)**: intentional
   `sk-live-…` vuln fixtures under `benchmarks/corpus/` and a benchmark
   daemon fixture string — path shape not covered by test/fixture exemptions.

Each shape has exactly one independent repository; per SOP no scanner change
until a second repo shows the same generalized shape.

## Bookkeeping

- pick.txt appended to the historical dedup list (4,312 → 4,452 unique).
- Disk pressure at round start (100%): old corpus clones (r265–r437 `repos/`)
  removed, scan outputs retained.

## Disclosure

GitHub Actions remains unavailable; scan ran locally against a fresh build of
main. No code changes, no changeset (r437 patch changeset still pending
versioning).
