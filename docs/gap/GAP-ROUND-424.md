# GAP-ROUND-424 — routine windows + r423 residual verification (honest no-defect round)

Date: 2026-08-03. Scanner: `main@3a58e84` (post-0.67.57 release).

## Advisory windows

- **Authenticated watch** (`api/scripts/watch.mjs` with a real token):
  `No uncovered MCP-related advisories found.`
- **OSV npm**: ETag `"d90926197707f4db4ad381d71093ce79"` — identical to the r422
  snapshot; the MAL set is unchanged (the 15 entries MAL-2026-13713..13727 were
  triaged in r420 — zero MCP/agent keywords). Zero net-new.
- **OSV PyPI**: ETag `"93f7c32ebfe756f0956e387bf87c8fe1"` — unchanged since r414.

## Client version window (all nine unchanged from r422)

```text
claude-code v2.1.227 | codex 0.147.0 | gemini-cli v0.54.4 | qwen-code v0.21.9
crush v0.88.1 | copilot-cli v1.0.79 | zed v1.14.2 | opencode v1.18.16 | goose v1.45.0
```

No new client releases → no new config/skill/hook surface to cover this round.

## Production consistency (post-0.67.57 release)

```text
website: 200
advisory API: 109
advisory feed: 109
repo advisory files: 109 (110 JSON incl. watch-ignore.json)
```

npm `latest` → 0.67.57 with real dependency versions; release close-out
(tag v0.67.57 on 29ad11a, GitHub Release, clean-env npx regression) was
completed and reported earlier this cycle.

## r423 residual sampling

- Medium AG-SK-002 (389 outside the template farm): 387 are the same real
  unscoped skill `allowed-tools` grant shape (Read/Write/Edit/WebSearch etc.);
  2 are real Claude Code `permissions.allow` unrestricted-network grants —
  rule semantics correct.
- r423 deferred singletons remain single-repo (functional bidi-isolate
  constants, non-boundary "placeholder" token, docstring masking example) —
  no second sample surfaced this round; deferral stands.

## Outcome

No generalized defect. No code change, no changeset.

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. GitGuardian + local
lint green (docs-only change).
