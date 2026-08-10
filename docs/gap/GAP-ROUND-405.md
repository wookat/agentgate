# GAP-ROUND-405 — fresh-corpus verification: defensive-unicode-comment precision fix

Date: 2026-08-03. Baseline: main @ #607 (0.67.51 published; no changesets pending).

## Fresh corpus

- 24 agent/MCP surface searches (`pushed:>2026-08-05` window), 1,488 candidates,
  1,021 after seen-list dedupe, 140 repositories selected and cloned
  (one retry: `callzhang/ceo-agent-service` initial empty-clone error).
- Full scan: 390 findings.

## Manual triage

All 11 criticals inspected from source:

- Real installer/bootstrap pipelines (true positives kept hot): OPTIMUZ uv +
  helm installers, sprefa prebuilt-binary installer, skillset pinned Bun
  bootstrap, celln rustup host/k8s setup, crew-research antigravity install
  adapter, toolu comemory installer string, iloveitaly Cursor cloud-agent
  `environment.json` remote install/start commands (auto-executed — correctly
  critical).
- Deliberate detection fixtures kept hot: rigscore `test/fixtures/...`
  curl|sh pre-commit and `.cursorrules` "Ignore all previous instructions".

Highs inspected: 88 AG-SK-002 real unscoped Bash/Write pre-approvals;
AG-CL-001 `firebaseApiKey` AIza literals in 9router (real-shaped client key —
stays high; the `firebaseApiKey` named-constant singleton from r403 now has a
second example but both are copies of the same Windsurf constant, still
deferred); AG-SS-001 OPTIMUZ live GCE metadata probes (genuine metadata
access — correct).

## Generalizable defect found and fixed

**AG-TP-001 false positive: trojan bidi characters inside defensive comments.**
Two independent r405 samples — `blamejs/exceptd-skills` (`bin/exceptd.js`, an
illustrative `"alice\u202eevilbob"` bidi-forgery example in a doc comment) and
`swannysec/robot-tools` (`_common.py`, an RLO mis-attribution example in a
security-forensics comment) — were reported high as possible hidden tool
instructions. Both are security tooling documenting the attack class in
comments.

Fix: a trojan-grade hit is graded low when its line is a comment line and
nearby prose names the attack class (bidi/RLO/zero-width/homoglyph/
trojan-source vocabulary). The scanner now iterates all hidden-char hits and
surfaces the first non-defensive one, so a real hidden char after a defensive
comment still reports high at the right line. Regression tests pin: defensive
JS/Python comments low, comment without attack prose high, code line after a
defensive comment high.

Corpus verification: 1,350 bidi-containing files across all 16 retained
corpora head-to-head — exactly 7 downgrades, all manually confirmed defensive
(MCP-Audit poisoning test, Rapid-MLX bidi doc comment + bidi render tests,
raptor anti-BiDi defense docs, agentic-security adversarial test, plus the two
r405 samples); zero true-positive loss. Full r405 rescan diff: exactly the two
targeted downgrades, zero other drift.

## Residual watch items

- Falconiere/toolu `CURL_INSTALL="curl … | sh"` assigned then only echoed as
  guidance — quoted-assignment-echo singleton, deferred.
- r403 singletons (placeholder-phrase env values, rule-DB JSON exec tokens)
  remain single-example.

## Outcome

Code fix + regression tests + patch changeset.
