# GAP-ROUND-395 — fresh-corpus precision: comment-line and Python-prose curl|sh mentions

Date: 2026-08-03. Baseline: main `fc282c7` (post #591, npm latest 0.67.46).

## Corpus

Seven agent/MCP surface-family repository searches (pushed:>2026-07-27), deduplicated
against all prior corpora: 1,680 candidates → 1,282 unseen → 140 selected and
shallow-cloned. Full scan with `agentgate scan -f json --fail-on never`:
325 findings (11 critical / 26 high / 116 medium / 172 low).

## Verification

- **All 11 critical inspected line-by-line** — all true positives kept: intentionally
  malicious SKILL.md/AGENTS.md fixtures (prompt-injection test corpora in 4 repos),
  real `curl -LsSf https://astral.sh/uv/install.sh | sh` installer scripts (2 repos),
  a goreleaser brew/README block with a real project install pipeline, and a bench
  harness script iterating over live commands including `curl https://x | sh`.
- **High (26)**: predominantly AG-SK-002 permission/autonomy grants (`allowed-tools:
  Bash(*)`/`Write`/`WebFetch`, Codex `approval_policy = "never"`, network-enabled
  sandbox, Gemini auto_edit) — semantically correct warnings; one AG-SS-001 active
  IMDS probe (`curl http://169.254.169.254/latest/meta-data/` in an IR script) —
  genuine active metadata probe, kept high.
- **Medium sampled by rule** (AG-SK-002 52, AG-RC-001 51, AG-SC-001 7, AG-AM-001 6):
  true dynamic-exec call sites (`execSync(...)`) and real installer command
  registries/executed pipelines (agent-catalog install commands, Daytona sandbox
  bootstrap, Tailscale updater tuple, rustup smoke bootstrap) are correct.

## Generalized defect fixed (multi-sample)

Two related AG-RC-001 misgrades on curl|sh **text** matches in non-executable sources
reported medium where the context can never execute:

1. **Comment lines**: the comment-only low grade required an executable-class file, so
   `#`/`//` comments in `.py`/`.ts` stayed medium; block-comment `*` continuation lines
   (JSDoc) were not recognized as comments at all. Samples: security-analysis comments
   quoting attack idioms (`core.fsmonitor = curl … | sh`, `EDITOR='vi; curl …|sh; vi'`,
   hook-guard rationale comments) in 2 repos ×3 files, JSDoc installer one-liner docs in
   another repo ×2 files. Fix: comment lines grade low with comment wording in any file
   class; `*` continuations count as comments.
2. **Python backtick prose**: RST ``curl | sh`` inline-code spans in docstrings
   (2 repos) — backticks are not Python syntax, so a span is always prose. Fix: extend
   the r391 backtick-quoted-prose check to `.py` (including double-backtick spans) and
   grade low; JS/TS template literals and shell command substitution are excluded, and
   the yaml/toml behavior from r391 (medium) is unchanged.

Focused regressions + positive preservation added (`rules-branches.test.ts`): comment
lines in `.py`/JSDoc → low; docstring RST span → low; live command string in a Python
tuple stays medium; template-literal `.ts` stays medium (existing test); executable
scripts stay critical (existing tests).

## Head-to-head

17 corpora (~2,090 repos) rescanned against the main-baseline outputs; every diff line
was individually classified as one of the two fixed categories (see PR). Zero true-positive
loss; no unrelated drift.

## Residual (not changed)

- Printed installer hints via Python `print("curl … | sh")` remain medium text warnings
  (quoted output, but a live string in an executable path — cautious grade kept).
- Defensive scanner message strings mentioning curl|wget|bash remain medium (rule text).

No advisory-window work this round (r394 windows were clear; next routine round covers them).
