# GAP-ROUND-199 — FP sweep of Qwen surfaces (rounds 195–198) + precision fixes

Date: 2026-08-08 · Round type: precision / verification

## Scope

Real-corpus sweep of the Qwen Code surfaces added in rounds 195–198 plus
old-rule precision on flagship repos with real QWEN.md/.qwen trees:
QwenLM/qwen-code, maestro-orchestrate, qwen-orchestrator,
nexu-io/open-design (84k★), AirPower-Web, kunkun, lesan, ZKEACMS,
remixed-dungeon, Claudable.

## Results

- Qwen surfaces: 0 false positives across all 10 repos.
- open-design exposed 5 real old-rule FPs, all fixed:
  1. AG-SS-001 high ×2 — metadata IP cited in SSRF-guard comments
     (safe-fetch.ts, byok-tools.ts). Defensive-context check now reads a
     ±2-line window and knows guard/validate vocabulary → low.
  2. AG-SK-001 critical — `<system>` inside an inline code span
     (`blocks/<name>--<system>.md` path template, taste-skill). Inline
     code spans now quote like fenced blocks → low.
  3. AG-RC-001 critical ×2 — curl|sh quoted in a `#` usage comment
     (od-contribute install.sh) and in a quoted-heredoc usage banner
     (landing-page install.sh). Comment lines downgrade to medium;
     quoted-heredoc bodies (literal, never executed) are masked. A live
     match is still preferred over a commented one so comments can't
     mask real launches.
- Remaining open-design highs are true positives (Bash allowed-tools).

## Boundaries

- Unquoted heredocs (`<<EOF`) still match — they expand and can execute
  command substitutions.
- Only `#`-style comments handled; `//`-comment executables (none of the
  executable-file types use them) unmodeled.

## Evidence

- Full suite green: core 282, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings, unchanged.
