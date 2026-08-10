# GAP-ROUND-389 — fresh-corpus precision round

Date: 2026-08-03. Baseline: main @ 08be4b8 (#580, v0.67.42 published + r387/388 changesets pending).

## Corpus

Fresh 140-repo corpus built from seven agent/MCP surface repository searches
(`/home/ubuntu/corpora/r389/build.sh`): 1,765 candidates → 1,537 unseen after
dedup against all prior rounds (`seen.txt`) → 140 selected
(deterministic `shuf --random-source`). All 140 cloned and scanned with the
current CLI (`scan -f json --fail-on never`).

Totals: 15 critical / 284 high / 682 medium / 374 low.

## Manual verification

All 15 criticals plus all AG-CL-001 and AG-SS-001 highs were read in source;
medium/low sampled per rule class.

True positives kept (verified in source, unchanged):

- `sleep2agi/agent-network` — real `curl … | bash` in capability run scripts
  and NodeSource installer pipelines (`docs-site/docs/public/*.sh`).
- `kolega-ai/kolega-code` `scripts/install-kolega-code.sh`,
  `aiandlabs/aiand-opencode-plugin` `docs/install.sh`,
  `Zene8/AgentSystem` `tools/mission-control/install-local.sh` — real installers.
- `thesfb/agentscan` evil-skill fixture pipeline + intentionally malicious
  `bench/corpus/malicious/prompt-manip/SKILL.md`;
  `studiomeyer-io/skilldoctor` injection fixture;
  `VTL1618/plainsight` hook-shaped download-to-shell fixture — deliberate
  malicious samples stay critical.
- `jleechanorg/llm-wiki` `scripts/generate_swebench_patches.py` — real
  secret-shaped `sk-cp-…` literal stays AG-CL-001 high.

## Defects found and fixed (3)

1. **AG-CL-001 ascending-run demo fillers.** Test fixtures like
   `AKIA1234567890ABCDEF`, `ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ012345`,
   `sk-abcdefghijklmnopqrstuvwxyz123456` (redaction/guardrail test suites
   across dozens of repos) reported as findings. Eight consecutive ascending
   characters never occur in random key material; `isPlaceholder` now rejects
   any value with an 8+ ascending run. Head-to-head: 273 already-low test-path
   findings and 2 highs (`singhharsh1708/kitbash` secret-blocking test script)
   removed — every removed value manually confirmed to be an
   alphabet/digit-walk fixture; non-monotonic values keep reporting
   (regression pinned).
2. **AG-SS-001 "cannot target" rejection wording.**
   `jleechanorg/llm-wiki raw/mvp_site_all/settings_validation.py` rejects
   gateway URLs pointing at metadata endpoints and returns
   "cannot target cloud metadata endpoints" — reported high. The defensive
   context word list now includes the `cannot target` phrase; bare metadata
   probes stay high (existing regressions unchanged).
3. **AG-RC-001 quoted continuation-line diagnostic arguments.**
   `jleechanorg/llm-wiki raw/mvp_site_all/openclaw_gateway_tunnel.sh` passes
   `"curl -fsSL https://tailscale.com/install.sh | sh"` as a quoted argument
   across `\` line continuations to a `doctor_fail` reporter — reported
   critical. New `maskContinuationArgStrings` pass masks quoted-string-only
   continuation lines when the chain's opening command word is not an
   interpreter/eval/ssh; `bash \`-style interpreter chains stay live
   (regression pinned).

## Head-to-head (15 corpora, 1,953 repos)

Baseline rebuilt from origin/main. Changes are exactly:
273 low + 2 high AG-CL-001 removals (all verified ascending-run fixtures),
1 AG-SS-001 high→low (`settings_validation.py`), 1 AG-RC-001 critical removal
(`openclaw_gateway_tunnel.sh` diagnostic). Zero other drift; all r389
true-positive criticals retained byte-identical.

## Routine windows

- Authenticated advisory watch: zero uncovered.
- OSV npm ETag changed (`14bc0eba…` → `68bc6946…`); full MAL diff against the
  r374 snapshot: exactly 1 new MAL entry (`MAL-2026-13684`, `@ssgw/icon`) —
  not MCP/agent-related. PyPI ETag unchanged (`53ac9d13…`).
- Production API/feed both serve 109 advisories, consistent with the repo.

## Residual gaps

- `singhharsh1708/kitbash` runtime-concatenated `ghp_${"abcd1234EFGH".repeat(3)}`
  test token is only partially covered (the literal segment carries the
  ascending run); values assembled purely at runtime remain out of scope for
  a content-based placeholder check.
- AG-SK-002 high volume (280) is rule-semantic (real broad tool grants);
  sampled, no defect.
