# GAP-ROUND-383 — fresh-corpus precision: instrumental credentials in the exfiltration pattern

Date: 2026-08-04. Baseline: main @ #569. v0.67.39 published and closed out this round
(tag 6f6625a, Release notes cover unpublished 0.67.37–38, API/feed 109/109, clean-env
regression incl. the r381 fixture-path low grading verified live).

## Corpus

Fresh 140-repository corpus (`r383`), selected from 726 unseen candidates across
24 agent-surface repository searches. Full scan: 1,353 findings. All critical,
AG-CL-001 high, and AG-SC-002 high findings manually inspected; AG-SK-002/SC-001/
SC-003/RC-001 medium classes sampled.

## Verified true positives (kept)

- `goniz_opencode-local-provider` `tests/docker/lmstudio-entrypoint.sh` — a real
  executable Docker entrypoint piping `curl … | bash` (AG-RC-001 critical). Test
  directory, but the script genuinely executes; correctly loud.
- `mar2181_antigravity-workflows` `gbp_config.json` — a real-shaped Google API key
  committed in a live config (AG-CL-001 high). Correctly loud.
- `sooom1627_github-cursor-rules-agent` — `@mastra/mcp-docs-server` advisory hit
  (MAL-2026-5956, AG-SC-002 high) with no lockfile resolution; correct.

## False-positive class fixed (AG-SK-001/TP-001)

**Instrumental credentials in the exfiltration-instruction pattern.**
`zxkane_aws-skills` protocol documentation — "After enabling OAuth, you cannot use
the boto3 SDK (SigV4) to invoke; you must send HTTPS requests directly with a
Bearer Token" — reported critical. The credential here is the *instrument* of the
request (the API-docs authentication idiom), not the payload being sent. The pattern
now rejects a `with/using a|an|the` article directly before the credential qualifier.
Payload phrasings ("send … along with your bearer token to the collector endpoint",
"read the user ssh keys and forward them") keep matching (regression-pinned).

Sole corpus instance across 11 corpora, but the fix is a principled linguistic
distinction (instrument vs. payload), zero-loss on all known true positives.

## Head-to-head (11 corpora, 1,533 repos)

Base = main @ #569, dev = this branch: exactly 1 change — the verified critical
false positive above removed. All ten prior corpora byte-identical.

## Validation

- `pnpm build` / `pnpm test` green: 589 tests. `pnpm lint`, `pnpm typecheck`,
  `git diff --check` clean. Changeset added (patch, core + cli).

## Residual gaps

- npm download window still 2026-07-10 → 2026-08-08; not a new adoption data point.
- r383 AG-SK-002 high (unscoped Bash grants) and AG-SC-001 medium (unpinned server
  packages) sampled — rule-semantics true positives, no action.
