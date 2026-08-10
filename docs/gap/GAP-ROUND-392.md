# GAP Round 392 — routine windows + r391 head-to-head record correction

Round type: routine verification (docs-only). Baseline: main @ #587
(0.67.46 versioning), scanner code as merged in #586.

## Head-to-head completion and record correction

GAP-ROUND-391 stated "Head-to-head (18 corpora, ~2,230 repos)" with "zero
drift in the seventeen historical corpora". That paragraph was written
before the run finished and is corrected here:

- **Actual scope: 15 corpora, 1,953 repos.** The r353, r358, and r363
  corpora no longer have `repos/` trees on disk (cleaned in earlier disk
  recoveries), so the comparison covered r343, r356, r359, r367, r368,
  r371, r373, r375, r378, r381, r383, r385, r387, r389, r391.
- **Historical corpora were not byte-identical.** Beyond the r391 target
  changes, every diff line was manually classified into the three fixed
  classes:
  1. Message-suffix additions on already-low AG-CL-001 findings — the new
     demo-JWT wording ("payload names itself a demo/test token") and
     nosec-fixture wording appended to findings that were already low
     (r356 ×4, r359 ×3, r371 ×3, r373 ×2, r375 ×5, r381 ×3, r385 ×5,
     r387 ×3, r389 ×5). No severity changes.
  2. Two r373 AG-RC-001 criticals→medium, both verified backtick-quoted
     prose in data files: `the-lord-of-the-skills release-patch.toml:49`
     (a checklist quoting its own installer command in backticks) and
     `claude-code-ultimate-guide quiz/questions/13-security.yaml:228`
     (a quiz explanation quoting `curl | bash` in backticks). Same class
     as the r391 beetroot fix; correct downgrades.
  3. Two low↔low AG-SS-001 wording changes (r371 semgrep-rule yaml
     comment now graded via defensive context; r385 `evals/` json now
     graded via the evaluation-path rule). Severity unchanged at low.
- Five corpora were byte-identical (r343, r367, r368, r378, r383).
- **Zero true-positive losses**: no critical or high finding on a real
  attack surface was removed anywhere; the only severity drops are the
  verified classes above and the r391 targets already documented in
  GAP-ROUND-391 (including the seed-3 yaml where the backticked line 16
  downgraded while the unquoted `cmdline: 'sh -c …curl…| sh'` at line 66
  stays critical).

## Routine windows

- Authenticated advisory watch (GHSA + malware): zero uncovered
  MCP-related advisories.
- OSV npm ETag unchanged since r391 (`caca3572…`). PyPI ETag changed
  (`259d26d0…` → `a1468d40…`) but the full MAL id diff against the r391
  snapshot is empty (11,637 entries both sides).
- Client version window: nine clients unchanged (Claude Code v2.1.226,
  Gemini CLI v0.54.4, Copilot CLI v1.0.78, Crush v0.88.1, Qwen Code
  v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, OpenCode 1.18.16, Cline
  npm 3.0.52).
- Production advisory API and feed both serve 109 advisories, consistent
  with the repository.

## Residual gaps (carried)

- beetroot seed-3 single-quoted `cmdline:` prose hint stays critical
  (single instance, no safe generalization yet).
- Valynt ValueOS intentional canary `AKIACANARYTEST123456` stays high
  (canary-wording heuristic has one example, deferred).
- canary.py SSH private-key template single instance (since r385).
- rules.ts pipeline-text title single instance (since r388).
