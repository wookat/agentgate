# GAP-ROUND-334 — wild-corpus precision sweep of the Agent Plugins spec surface (round 333)

Date: 2026-08-04
Method: same as rounds 297/304/321/328 — GitHub code search for root-level `plugin.json`
files referencing `agent-plugins.org/schemas`, clone every hit, scan head-to-head against
published `mcp-agentgate@0.67.9`, and manually verify every output delta.

## Corpus

- GitHub code search (`"agent-plugins.org/schemas" path:/ filename:plugin.json`): 173 unique
  repos across two pages; 162 cloned fresh into `~/corpora/r334/repos` (the rest were already
  in the r333 corpus or vanished).
- Full head-to-head: 162 repos, 12,435 scanned files, finding-level diff (rule|severity|file|message).

## Results

27 repos changed output vs 0.67.9. Verified line by line:

- **658 gained findings, all attributable and true.** 654 are AG-AM-001 per-config hits from
  the newly discovered implicit `./mcp.json` bundles (650 of them in one repo,
  `withoneai/one-agent-plugin`, which ships 650 platform directories each carrying an
  identical Agent Plugins manifest + `mcp.json` for the same unauthenticated
  `mcp.withone.ai` endpoint — correct per file, since each directory installs separately).
  3 are true AG-SC-001/003 hits on `katalon-labs/true-skills`' bundled unpinned
  `mcp-remote` (advisory MCPA-2025-0001). 1 is a real fenced-code AG-SK-001 low.
- The remaining changed repos only gained scanned-file visibility (previously invisible
  `skills/` trees under spec manifests), with zero findings — no noise added.

## Two real defects found and fixed

1. **Regression from round 333 (never shipped):** in `pluginServerLocations`, a bare
   `plugin.json` that resolved server locations made the walker `continue` past the
   directory, skipping metadata-dir manifests coexisting at the same root.
   `dodopayments/dodo-agent-plugin` ships both a spec `plugin.json` (implicit `mcp.json`)
   and `.codex-plugin/plugin.json` (sibling `.mcp.json`): the r333 build silently dropped
   the `.mcp.json` findings (14 → 10, including an advisory hit). Fixed by always
   descending; depth-0 dedupe already prevents double counting. Regression test pins the
   coexistence case (`legacy` + `portable` servers both parsed).
2. **AG-CL-001 test-file false positive:** `Nafjan/summon` keeps a leak-check fixture token
   (`sk-SECRET-do-not-leak-…`) in `skills/summon/scripts/test_discovery.py` — reported
   high because the test-path heuristic only matched `tests/`-style directories and
   `.test/.spec` suffixes, not `test_*` / `*_test.*` filename conventions (Python/Go).
   Now reported quietly (low) like other test paths; regression test added.

## Honest boundaries

- `withoneai/one-agent-plugin`'s 650 identical AG-AM-001 findings are individually correct
  but drown the report. Cross-file dedupe of identical server findings was deliberately
  NOT added: an attacker can poison a single copy, and collapsing identical hits would
  hide which files carry it. Recorded as a report-UX candidate, not a scanner defect.
- `sentdm/sent-plugin`'s four AG-SK-001 criticals ("Do not tell the user RCS is
  self-service…") are a benign vendor correcting a misconception, but the scanner cannot
  verify truthfulness of the suppressed claim; the concealment shape (install-wide skill
  telling the model to withhold information from the user) is exactly what the rule
  exists for, so the finding stands.
- Client version window re-checked alongside: no changes across the nine tracked clients.
