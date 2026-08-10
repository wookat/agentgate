# GAP-ROUND-393 — fresh-corpus precision (compound-noun exec/eval prose, pin-advice spec validity)

Round type: fresh-corpus scan round. New 140-repo corpus built from seven
agent-surface repository-search query families (pushed:>2026-07-20), deduped
against all prior corpus picks (1,711 candidates → 1,367 unseen → 140 selected).

Scanner: main @ d7a1197 (identical rule code to v0.67.46).

## Corpus scan results

310 findings: 6 critical / 27 high / 197 medium / 80 low.

### Criticals — all six inspected, all true positives (kept)

| repo | file | class |
|---|---|---|
| EvanZhang008_open-walnut | scripts/cloud/setup.sh:116 | real NodeSource installer `curl \| bash -` |
| Kelushael_rig | rig.sh:125 | real installer `curl "$url" \| bash` |
| getkimchi_kimchi | scripts/dev-startup.sh:54 | real Bun installer |
| shifengbin_News | setup-mac.sh:27 | real uv installer |
| stephenwong_ai-homeassistant | setup-mac.sh:95 | real uv installer |
| Nyuway-Cybersecurity_nyuwayskillscanner | benchmarks/corpus/malicious/credential-forwarder/SKILL.md:10 | intentional malicious fixture (exfil + concealment) — expected hit |

### Highs — all 27 inspected

- AG-SS-001 (3): open-walnut CDK user-data and generator emit real IMDS
  token/public-IPv4 probes; gptmoss vendored openai `_workload.py` performs
  live Azure IMDS token retrieval. True positives (live probes), kept high.
- AG-SK-002 (23): unrestricted `Bash` / `allow` permission grants across
  quetrex-plugins, awesome-claude-skills, sample-apex-skills,
  claude-platform-playbook, nix-flakes (incl. OpenCode `permission.bash:
  "allow"`), claude-sessions, ai-workspace-template, kandev, retort. All are
  real unscoped grants; rule semantics correct.
- AG-CL-001 (1): colisconnect `simulation_colab.py` hardcodes an unmarked
  secret-shaped `sk-` API key default in a runnable script. No fake/demo
  marker; correct high (value not reproduced here).

### Medium/low residual sampling

- AG-AM-001 (95 med): generated `.mcp.json` trees pointing at remote
  `cortex.joai.ai` servers without auth headers — correct warnings.
- AG-SK-002 (57 med): broad Edit/Write/WebFetch grants — correct.
- AG-SC-001 (9 med): mutable local marketplace sources, `@latest` npm
  plugins, unpinned OpenCode plugins — correct, but see defect 2 below.
- AG-RC-001 (36 med + 21 low): real dynamic-exec call sites, real installers
  in docs, fixtures — mostly correct; see defect 1 below.

## Generalized defects fixed (2)

### 1. AG-RC-001: hyphenated compound nouns reported as exec/eval call sites

`EVAL_RE` rejected `.`/word chars before `eval|exec` but not `-`. Prose like
`"code-exec (not for goal=build_extension)"` (majieddd_tool-scout, 5 findings
across scenario JSON + tests) and `"olmo-eval (noise-vs-real-gain error
bars)"` (mmarks13_personal_podcast_generator episodes.json) matched as
dynamic code-execution primitives. Hyphens cannot appear in JS/Python
identifiers, so `X-exec(`/`X-eval(` is never a call. Fix: exclude `-` in the
guard class. Regression pins prose non-match and a bare `exec(userInput)`
call still matching.

### 2. AG-SC-001: pin advice renders an invalid spec for tagged plugins

For an unpinned OpenCode/Kilo plugin already carrying a tag
(`@plannotator/opencode@latest`, gytkk_nix-flakes — 3 findings) the message
suggested `Pin an exact version (e.g. @plannotator/opencode@latest@1.2.3)`,
which is not a valid npm spec. Fix: strip the trailing tag/range before
building the example. Regression pins `@scope/plugin@latest` →
`(e.g. @scope/plugin@1.2.3)` and bare names unchanged.

## Residual single-instance gaps (deferred, not fixed)

- `EtanHey_cmuxlayer` comment `// failed/unsupported exec (and for …)` —
  space-preceded prose `exec (`; single instance.
- `goweft_heddle` backtick-quoted `` `exec( `` in a Python docstring —
  single instance.
- Earlier deferred singles remain (beetroot `cmdline:` prose, ValueOS canary,
  canary.py SSH template, rules.ts pipeline-text title).

## Head-to-head (16 corpora incl. r393)

Baseline = the r391-era scan outputs (valid: main d7a1197 has no scanner
change since #586). New side rebuilt from this branch. Every diff line was
inspected and falls into exactly the two fixed classes:

- Hyphen-prose AG-RC-001 medium removals (13 findings, 9 repos): r343
  `nc --exec/--sh-exec` comment, r356+r375 PMOVES `retrieval-eval` comment,
  r378 MCP-Audit `--eval(...)` CLI-flag string (the same file's real
  `exec(base64…)` docstring hit remains, line renumbered 369→427), r381
  reyn `sandbox-exec(1)` man-page reference, r385 hatch3r, r389 m3-memory,
  r391 clauster, r393 tool-scout (5) + podcast-generator (1).
- AG-SC-001 pin-advice message wording only (severity/line unchanged):
  r356, r371, r373 (3), r375, r393 (3).

Zero other drift; r359/r367/r368/r383/r387 byte-identical. No true
positive lost anywhere.

## Advisory windows (this round)

- Authenticated watch: “No uncovered MCP-related advisories found.”
- OSV npm ETag unchanged (caca3572…).
- OSV PyPI ETag changed (a1468d…→398ba7c8…); full MAL ID diff = exactly one
  new entry, MAL-2026-13686 (PyPI `chaintest` crypto infostealer, Contagious
  Interview-adjacent) — not MCP/agent-related; no advisory action.
- Production API/feed: 109 / 109, consistent with the repo.
