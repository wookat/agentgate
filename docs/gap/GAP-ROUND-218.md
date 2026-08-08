# GAP-ROUND-218 — real-corpus FP sweep (rounds 211–217 surfaces + legacy rules)

## Corpus (real scans)

- block/goose, czlonkowski/n8n-mcp, HKUDS/nanobot (fresh clones)
- All-Hands-AI/OpenHands, jikig-ai/soleur, online-go, snowdreamtech/frp (round-211 corpus)
- 46 real Goose recipes (round-215 corpus)

Rounds 211–217 surfaces (OpenHands skills/microagents/setup.sh, Goose recipes/
inline_python/deps, new advisories) produced no false positives.

## True FPs found and fixed (all verified in the wild)

1. **AG-RC-001 — echoed curl|sh help text** (`block/goose download_cli.sh:364`):
   `echo "Non-interactive shell detected (e.g. 'curl ... | bash')."` reported
   critical. Fix: mask echo/printf string literals in shell scripts before
   matching; strings containing `$(`/backtick stay live (command substitution
   executes), covered by a true-positive test.
2. **AG-SS-001 — blocklist header just outside the context window**
   (`n8n-mcp src/utils/ssrf-protection.ts`): the "(ALWAYS blocked …)" comment sat
   3 lines above the metadata IP; window was ±2. Fix: widen to ±3.
3. **AG-CL-001 — underscore-delimited placeholder**
   (`n8n-mcp src/utils/template-sanitizer.ts`): `sk-YOUR_OPENAI_KEY_HERE` reported
   high; `\byour\b` never matches before `_`. Fix: accept `_` as a word delimiter
   in the placeholder vocabulary.
4. **AG-TP-001 — bidi fixture in a test file**
   (`soleur apps/web-platform/test/c4-diagram-path-scope.test.ts`): U+202E used
   as a fixture for the very path-validation under test reported high. Fix:
   test/fixture paths report quietly (same policy as AG-SS-001 round-154).

## Kept as honest signals (not FPs under rule semantics)

- Live `curl … | bash` installers (goose scan-recipe.sh, OpenHands setup.sh,
  soleur bootstrap scripts) — real pipe-to-shell executions.
- soleur infra scripts fetching `169.254.169.254` (Hetzner instance metadata) —
  real metadata fetches; the scanner cannot verify intent.
- soleur `skill-security-scan/references/` corpus (curl|sh pattern in a rules
  YAML, U+200B in a patterns doc) — data-vs-code indistinguishable, same
  precedent as awesome-copilot tools.yml (GAP-ROUND-207).
- Unrestricted `Bash` allowed-tools grants in soleur SKILL.md files — true.

## Validation

- Full suite green: core 321, cli 47, config-convert 24; build/lint/typecheck ok.
- Re-scan after fixes: n8n-mcp 0 crit/high (was 2), goose 1 crit (real installer),
  soleur 14 crit/high (all true per semantics, was 15).
- Self-scan: 19 findings — unchanged.
