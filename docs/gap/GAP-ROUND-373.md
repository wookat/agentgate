# GAP-ROUND-373 — fresh-corpus precision: enclosing example lists, placeholder-shaped dummies, self-test paths, IOC-scanner headers

Date: 2026-08-03

## Routine windows

- Advisory watch (authenticated): zero uncovered. OSV npm/PyPI export ETags
  unchanged vs the r372 snapshot (e31fe9a2… / de189c70…).
- Nine-client version window: unchanged (Claude Code v2.1.226, Gemini CLI
  v0.54.4, Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code
  v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52).

## Fresh corpus + per-finding verification → four narrow precision classes

A fresh corpus (r373, seven agent-surface searches deduped against prior
corpora) was scanned and every critical/high plus residual AG-CL/SS-001
candidate inspected against source. Four evidence-backed classes:

1. **AG-RC-001 — enclosing `examples:` list values** (yaml/toml/json only).
   A threat DB's `examples:` list quoting "curl | bash from paste sites"
   (claude-code-ultimate-guide ×2) is documentation; extends the r372
   example-key marker to values nested in a list under an enclosing
   `examples` key. A nearer non-example key blocks the downgrade
   (regression pinned); executable files untouched.
2. **AG-CL-001 — placeholder-shaped values.** `do-not`/`do_not` segments
   (`sk-live-DO-NOT-FORWARD-4471`), runs of 8+ identical characters
   (padded demo filler), and all-lowercase digit-free `sk-` kebab
   identifiers (`sk-user-profile-updated` in a detector's own comments)
   are not key material. Verified against source in tenjin-agent,
   Academic-Agents-Studio, and claude-skills' redaction linter; the real
   docker-compose padded-key stays covered by the run heuristic and the
   remaining true-positive highs are unchanged.
3. **AG-CL-001 — `_selftest.*` files count as test paths** (Python
   self-test convention, evals/harness/scoring_selftest.py).
4. **AG-SS-001 — `.selfcheck.*` files count as test paths**
   (trusted-origin.selfcheck.ts assertion fixture), and a threat-intel
   scanner whose header states its purpose ("Scan … for active
   supply-chain incident indicators") is defensive context for the IOC
   table below (affaan-m/ECC CI scanner). A bare metadata probe with no
   such header stays high (regression pinned).

**Rejected after corpus evidence:** a provisional "workflow-shaped yaml
outside .github/workflows is inert" heuristic was disproven — vendored
skill/reference workflows in four historical corpora carry real
`run: curl … | sh` install steps that must stay critical. Removed; a
regression now pins workflow-shaped yaml `run:` steps as critical.

## Head-to-head (eight corpora vs post-#547 outputs)

Every change is one of the four hand-verified classes: 5 inspected
false-positive highs removed (2 downgraded to low), 4 example-list
criticals→low, and monotone removals of placeholder-shaped low findings in
test paths. Zero true-positive drift — all previously-critical workflow
commands, the MAX docker-compose key, IMDS collectors, and metadata probes
are unchanged.

Two synthetic test fixtures (monotone JWT signatures, `'Q'.repeat(48)` PEM
body) were themselves placeholder-shaped under the new run heuristic and
were regenerated as non-monotone fakes so they keep representing
real-shaped secrets.

## Validation

Full suite green (566 tests), lint/typecheck clean, `git diff --check` clean.
