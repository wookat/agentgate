# GAP-ROUND-352 — AG-TP-001 test-path heuristic gaps (deferred from GAP-351)

## Window checks

- Advisory watch (authenticated GHSA + malware sweep): re-run after the r349
  batch — no uncovered MCP-related advisories.

## Fix

GAP-351 deferred three AG-TP-001 highs on the r343 corpus. One is a clear
heuristic gap, fixed this round: `browser-tests/fixtures.mjs` is a browser-test
fixture deliberately embedding bidi/zero-width characters to exercise the
sanitizer under test, but the test-path heuristic only matched exact directory
names (`tests/`, `fixtures/`) and `*.test.*`/`*.spec.*` filenames.

Now:
- directory segments with a separator-joined test suffix match
  (`browser-tests/`, `e2e_tests/`); lookalike words without a separator
  (`latest/`, `contests/`) do not — regression-pinned;
- standalone fixture filenames (`fixture.js`, `fixtures.mjs`) match.

## Head-to-head (r343 corpus, 150 repos)

Exactly 1 finding changes: the gaze browser-test fixture high → low. All other
output byte-identical.

## Still deferred (honest)

The two data-borne bidi-isolate highs (scraped YouTube titles with U+2068,
display names with U+2067/U+202D in a skill's memory-source filenames) remain
high: reliably distinguishing internationalized display data from
Trojan-Source concealment needs more evidence than two samples; noted for a
future round with a larger corpus.
