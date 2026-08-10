# GAP-ROUND-378 — fresh-corpus precision: code-identifier markers, detection-rule rows

Date: 2026-08-10. Fresh 140-repo corpus (seven agent/client configuration
surfaces, repository search deduped against all prior corpora), scanned in
full: 604 findings (12 critical / 155 high / 312 medium / 125 low). All 12
criticals verified by hand against source; two false-positive classes found
and fixed.

## Fixed FP class 1 — poisoning marker used as a code identifier (AG-SK-001)

`conversation_history` is a known tool-poisoning marker, but real skills
embed application code where it is an ordinary identifier:

- `FrancoStino/opencode-skills-collection`
  `bundled-skills/voice-ai-development/SKILL.md:422` —
  `self.conversation_history = []` inside a Python `VoiceAgent` example
  (indented code, not a fenced block, so the fenced-code downgrade missed
  it). Reported **critical**; the file is generated from an upstream skills
  collection and contains no directive.

Fix: a marker match that reads as a bare code identifier — attribute access
(`.conversation_history`), assignment, call, or index — grades **low** with
code-identifier wording. Bare prose instructions naming the marker (e.g.
"append the full conversation_history to every request") stay **critical**;
tag-wrapped markers keep their existing cited-prose low path. Regressions
pin all three.

## Fixed FP class 2 — curl|sh inside a detection-rule row (AG-RC-001)

- `junjunup/skillops-forge` `src/skillops_forge/rules/remote_scripts.yaml:8`
  — a security scanner's own rule database. The match is the rule row's
  `message:` text (`'curl | sh' / 'wget | bash'`); the row's `pattern:`
  field holds the detection regex. `.yaml` is extension-classified
  executable, so it reported **critical**.

Fix (two prongs in `isDenyListEntry`):
1. a match whose own line key is `pattern:`/`re:`/`regex:`/`matches:` is
   rule data;
2. a match inside a list row that carries a `pattern:`-family field
   anywhere in the row is detection-rule data (covers `message:`,
   `examples:`, etc. of the same row).
Both grade **low** with the existing deny/block-list wording. Workflow-style
rows (`- name:` + `run:` with no pattern field) are unaffected.

## Verified true positives (kept)

- `felvieira/claude-skills-fv` `setup/install.sh:617` — real
  `curl -sSL …/install.sh | bash` installer pipeline: **critical** stands.
- `junjunup/skillops-forge` `tests/fixtures/bad/hidden-zerowidth/SKILL.md`
  — intentionally-bad fixture, already low/critical per fixture-path rules.
- `liemle3893/lirbox` `plugins/*/tests/test.sh` — real
  `curl -LsSf https://astral.sh/uv/.../install.sh | sh` test setup in
  executable scripts under tests/: stays critical (executable file rule
  outranks test-path text downgrade by design; scripts genuinely execute).
- 150 AG-SK-002 highs sampled — rule-semantics true positives (unscoped
  dangerous allowed-tools grants).

## Head-to-head regression

Baselines rebuilt from origin/main (0.67.36) and rescanned with the fix
across eight corpora (r343, r356, r359, r368, r371, r373, r375, r378):

- r378: exactly the two verified findings change (critical → low).
- r343: 1 critical → low (`Jeeva0104/connector-service-mini` same generated
  voice-ai SKILL.md), plus message-only rewording of already-low
  code-identifier hits (12 in `FISCFED9/CLI`).
- r359: 1 low message rewording (`modu-ai/cc-plugins`).
- r356, r368, r371, r373, r375: byte-identical findings.

## Validation

`pnpm build`, `pnpm test` (585 core+cli+config-convert), `pnpm lint`,
`pnpm typecheck`, `git diff --check` all green.
