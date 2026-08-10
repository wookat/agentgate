# GAP-ROUND-409 — fresh-corpus verification: CommonMark fence tracking (AG-SK-001)

Date: 2026-08-03. Baseline: main @ #612 (0.67.52 published; no changesets
pending before this round).

## Corpus

Fresh 140-repo corpus (1,271 candidates → 877 after seen-list dedupe → 140
selected, deterministic shuf), all 140 cloned, full scan: 590 findings, zero
scan errors.

## Critical triage (5)

- `hafley66/sprefa` `install.sh` and `tilework-tech/nori-cli`
  `setup-cloud-dev.sh`: real curl|sh installer pipelines (cargo-dist,
  cargo-binstall) — true positives, kept critical.
- `Heretek-AI/heretek-claude-harness` security-scan fixture SKILL.md: a
  deliberately malicious prompt-injection fixture in a live-shaped skill path —
  true positive by the r393/r397 fixture precedent.
- `GliteTech/glite-english-audit` SKILL.md line 658: **false positive** — the
  injection example sits inside a `~~~~text` fence, but `fencedCodeLines`
  treated the inner `~~~text`/`~~~` runs as closers, so the line was graded as
  live content. CommonMark requires a closing fence to use the same character,
  be at least the opener's length, and carry no info string.
- `rrrutledge/rrrutledge-claude-code-plugins` drainer `context.example.md`:
  `<System>` is a template placeholder among other `<…>` placeholders, but the
  neighboring-placeholder heuristic misses it because the sibling tokens
  contain em-dashes/apostrophes outside the `<[\w|/ -]+>` token class.
  **Singleton** — deferred (single independent sample).

## Fix shipped (multi-sample)

`fencedCodeLines` now follows CommonMark closing-fence rules. Evidence across
all 18 on-disk corpora (424,441 markdown files compared naive-vs-correct):
exactly 4 injection-pattern lines change fence membership, in 4 independent
repos/corpora (Prorise-cool r383, fastrevmd-lab r387, skillseal r403,
GliteTech r409) — **all** in the fence-open direction (downgrades); zero lines
move out of a fence (zero escalations).

Head-to-head: GliteTech critical→low (target); Prorise-cool one low→low
line/wording shift; fastrevmd-lab and skillseal zero diff (already covered by
other downgrades); full r409 rescan diff is exactly the two target lines.
Regression tests pin the nested-`~~~~` case low and the info-string-closer
case low; patch changeset added.

## High/medium/low sampling

- AG-SK-002 high (188): real unscoped Bash/allowed-tools pre-approvals.
- AG-CL-001 high (5): real-shaped key literals in live source — correct.
- AG-SS-001 high (1): live metadata access — correct.
- AG-AM-001 high (1) + medium: unauthenticated remote MCP endpoints — correct.
- AG-SC-001/RC-001/TP-001 samples: rule-semantics correct (unpinned specs,
  comment-line curl|sh with r395 wording, boundary zero-width artifacts).

## Outcome

One generalizable defect fixed (fence tracking); one singleton deferred
(`<System>` placeholder token class). Zero true-positive loss.
