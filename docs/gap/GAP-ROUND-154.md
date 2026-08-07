# GAP-ROUND-154 — AG-SS-001 test-path downgrade + rounds 151–153 FP sweep

Date: 2026-08-08 · Round type: real-corpus FP sweep + noise fix

## Corpus (2 flagship AWS repos)

- awslabs/mcp (2,664 scanned files, the official AWS MCP server
  monorepo): 0 AG-SK-002 findings — rounds 151–153 checks stay silent
  on the largest real MCP codebase. 31 findings total, dominated by
  AG-SS-001 high hits on metadata-endpoint references in `tests/`
  trees (test_ssrf_protection.py, test_security_validator.py, ...)
  — fixtures for the SSRF protections under test, i.e. noise at high.
  AG-CL-001 already reports test-tree secrets quietly (low).
- aws/amazon-q-developer-cli (41 files): 3 AG-RC-001 critical
  (curl|sh in build scripts — real pattern, correctly reported;
  archived upstream repo). 0 AG-SK findings.

Setup note: both clones are research-only (read-only, no commits);
their hook configs (.husky/, .pre-commit-config.yaml) were noted but
not installed.

## What shipped

AG-SS-001 source hits in test/fixture paths (same path heuristic as
AG-CL-001, minus `docs?/` since a doc telling readers to query the
metadata service is still actionable) downgrade high → low with an
explicit "likely an SSRF-protection test fixture; confirm" note.
Nothing is silenced.

## Impact on the corpus

awslabs/mcp: 12 of 13 AG-SS-001 highs drop to low (all in tests/);
the one non-test hit (aurora-dsql mutable_sql detector source, which
embeds the metadata URL in a block-pattern list) remains high —
recorded as a known residual (block-list context detection inside
arbitrary source is not attempted; the NetworkPolicy manifest carve-out
stays YAML-only by design).

## Honest boundaries

- Source files that reference the metadata IP as part of a *deny
  pattern list* (aurora-dsql case) still report high; static analysis
  cannot cheaply distinguish deny-list embedding from use.
- `docs/` paths intentionally keep high, unlike AG-CL-001.

## Routine checks

- Advisory watch: no uncovered public MCP advisories this round
  (31 advisories, three sources consistent).
- Competitors: no releases affecting the comparison page.

## Evidence

- Full suite green: core 227, cli 47, config-convert 24.
- Self-scan: still 17 findings, but composition shifts from
  3 high / 13 medium / 1 low to 13 medium / 4 low — the 3 highs were
  metadata-endpoint references in agentgate's own test files (SSRF
  rule fixtures), exactly the pattern this round downgrades.
  Intentional change; the dogfood CI gate (--fail-on high) still
  passes.
