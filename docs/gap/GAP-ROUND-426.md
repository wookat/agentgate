# GAP-ROUND-426 — routine windows + r425 residual verification (honest no-defect round)

Date: 2026-08-03. Scanner: `main@dd65bb2` (post-0.67.57).

## Advisory windows

- **Authenticated watch** (`api/scripts/watch.mjs` with a real token):
  `No uncovered MCP-related advisories found.`
- **OSV npm**: ETag `"d90926197707f4db4ad381d71093ce79"` — identical to
  r422/r424; MAL set unchanged. Zero net-new.
- **OSV PyPI**: ETag changed (`"b4c2b2138b4bedcbee06b632a0cedc56"`), but the
  full MAL set diff against the r414 snapshot is empty (11,642 → 11,642,
  0 new IDs). Zero net-new.

## Client version window (all nine unchanged from r424)

```text
claude-code v2.1.227 | codex 0.147.0 | gemini-cli v0.54.4 | qwen-code v0.21.9
crush v0.88.1 | copilot-cli v1.0.79 | zed v1.14.2 | opencode v1.18.16 | goose v1.45.0
```

No new client releases → no new config/skill/hook surface to cover this round.

## Production consistency

```text
website: 200
advisory API: 109
advisory feed: 109
npm latest → 0.67.57
```

## r425 residual sampling

- Low AG-SS-001 spot checks: SIEM-event examples, SSRF-guard sources,
  identity-gate tests, safe-download tests — defensive/test contexts, correct
  quiet grading.
- Low AG-RC-001 spot checks: backtick inline-code prose, commented lines,
  test/fixture-path quoted payloads (incl. a supply-chain-audit benchmark
  fixture) — correct quiet grading.
- r425 deferred singletons remain single-repo (deadends.dev error-signature
  canon, branchlight defensive doc comment, osforge presence-only `.env`
  check) — no second sample surfaced this round; deferral stands.

## Outcome

No generalized defect. No code change, no changeset.

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. GitGuardian + local
lint green (docs-only change).
