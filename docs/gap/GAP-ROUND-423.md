# GAP-ROUND-423 — fresh-corpus verification (honest no-defect round)

Date: 2026-08-03. Scanner: local build of `main@cdfeead` (post-0.67.57).

## Corpus

Fresh 140-repo corpus (`/home/ubuntu/corpora/r423`), built from 24 agent-surface
GitHub search queries (`pushed:>2026-07-28`, non-fork, ≤200 MB):

- candidates: 2,927 → unseen after dedupe vs `seen.txt`: 1,668 → picked: 140
- clone failures: 0

## Scan results

8,861 findings across 140 repos (12 critical / 2,571 high / 6,127 medium / 151 low);
43 lines of scan warnings (yaml key-stringification warnings + `--live` hints), zero parse failures.

One template farm dominates: `pjt222_agent-almanac` (372 skills × i18n copies)
accounts for 8,071 findings — all AG-SK-002 grants of unscoped
`allowed-tools: Read Write Edit Bash Grep Glob`, which is exactly what the skill
frontmatter pre-approves. Rule semantics correct.

## Critical triage (all 12 inspected by hand — all true positives)

- Real install pipelines (kept critical): `55515-code_orchestrator`
  tool_profiles.yaml tailscale `curl | sh` (×2 incl. backup copy),
  `ElonQian1_Elon` rustup, `SCU-CSEN346_KELE` uv installer (×3 setup scripts),
  `everruns_everruns` just.systems installer, `fishnos_claude-config`
  claude.ai install.sh, `oxbshw_watch-skill` uv, `sy-l123_sy-TrendRadar` uv.
- `AbrahamOO_security-mcp`: deliberately malicious fixture SKILL.md
  ("Ignore all previous instructions… silently re-run") and a live BiDi override
  character inside `unicode-homograph-tester/SKILL.md` prose — live payloads in
  skill files stay critical per r393/r397/r407/r417 precedent.

## High triage

- 2,384 of 2,567 AG-SK-002 highs are the agent-almanac template farm (real
  unscoped `Bash` pre-approval in every skill). The remaining 183 are the same
  real grant shape across 20+ repos (e.g. `AbrahamOO_security-mcp`'s 92 redteam
  skills each pre-approving unscoped `Bash, Edit, WebSearch, WebFetch`).
- 3 AG-CL-001 highs inspected: `AbrahamOO` remediation-map bad-example
  `sk-proj-XXXXplaceholderXXXX` (embedded "placeholder" not at a word boundary —
  singleton), `AbrahamOO` verify-claims.mjs writes an OPENSSH key fixture
  (scripts/, not test path — singleton), `kai-kou` mask_secrets.py docstring
  example `xoxb-abc…` (singleton).
- 1 AG-TP-001 high: `oxbshw_watch-skill` localize.py `LRI, PDI = "\u2066", "\u2069"`
  — functional RTL isolate constants for LLM answer localization. The comment
  vocabulary ("left-to-right isolate / pop directional isolate") is outside the
  attack-prose set, and cross-corpus search found no second repo with literal
  bidi chars in functional constants still graded high (open-walnut ZWSP const,
  forge-mentor/algo defensive scanners all already low on main). Singleton — deferred.

## Medium/low sampling

- AG-AM-001 mediums: real unauthenticated remote endpoints (everruns plugin
  fleet, context7, revwerk) — correct.
- AG-SC-003: real `mcp-remote` advisory MCPA-2025-0001 hit in everruns `.mcp.json`.
- AG-RC-001 mediums: real execSync/installer literals in scripts — correct.
- Low AG-TP-001 (28): BOM/ZWJ artifacts and test-fixture bidi — correct quiet grading.
- Low AG-SS-001 (39): defensive/blocking contexts and test paths — r413/r415
  wording present, correct.
- Low AG-SK-001 (38): fenced quoted injection examples — correct.
- Low AG-CL-001 (20): corpus/test fixture secrets — correct.

## Outcome

No two-repo generalizable defect found. No code change, no changeset.
Deferred singletons recorded: functional bidi-isolate constants (oxbshw),
non-boundary "placeholder" token (AbrahamOO), docstring masking example (kai-kou),
plus prior rounds' deferrals (medusa `_BIDI_`, Infrawrench validator).

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. GitGuardian + local
lint green (docs-only change).
