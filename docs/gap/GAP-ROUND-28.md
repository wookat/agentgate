# GAP Report — Round 28 (advisory API version-matching bug, found by deploy verification)

## P1 fixed — Worker `/v1/query` never matched ranges introduced at "0"

While verifying the post-merge redeploy (25 advisories live on website + Worker),
version-scoped queries came back empty:

```
GET /v1/query?name=awslabs.documentdb-mcp-server&ecosystem=pypi&version=1.0.10
→ { "advisories": [] }        # should match MCPA-2026-0011 (< 1.0.12)
```

Root cause: the Worker's dependency-free semver parser required a full
`x.y.z` version, so the OSV-style `introduced: "0"` event was unparseable →
`compare()` returned null → the range was skipped. **Every** advisory range that
starts at `"0"` (the most common form — all malicious-package entries) was
invisible to version-scoped API queries. Name-only queries were unaffected, and
the CLI was unaffected (core has its own lenient segment-based compare — this is
why scan matched correctly while the API did not).

Fix: parser now accepts partial versions (`0`, `1.2`), missing segments count
as 0. Regression test added (`api/test/semver.test.mjs`).

Verified after redeploy:

```
…&version=1.0.10 → ["MCPA-2026-0011"]
…&version=1.0.12 → []
```

## Deploy-state verification (round 27 follow-through)

- Website feed 25, Worker `advisory_count` 25, `mcpa-2026-0011` page 200.
- Manual deploy still required (Cloudflare repo secrets pending).

## Honest limits

- `/v1/advisories?package=` is not a supported filter (use `/v1/query?name=`);
  spec is accurate, but the ecosystem filter silently ignoring an unknown
  `package` param could mislead — candidate for a 400-on-unknown-params round.
