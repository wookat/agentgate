# GAP-ROUND-381 — fresh-corpus precision: fixture-tree server configs, harness filenames, redaction vectors

Date: 2026-08-04. Baseline: main @ #566 (version packages, 0.67.38 pending publish).

## Advisory window

- Authenticated watch re-run: no uncovered MCP-related advisories (109 in repo, API and feed both serve 109).

## Corpus

Fresh 140-repository corpus (`r381`), selected from 1,009 unique candidates across seven
agent-surface repository searches after removing 410 previously seen repositories.
Full scan: 862 findings. All critical and all AG-CL-001/AG-SS-001/AG-SC-001 high findings
were manually inspected in source.

## Verified true positives (kept)

- `shengdabai_Tony-Claude-Code-Skills` — real executable shell setup with a live
  `curl … | sh` installer line (AG-RC-001 critical).
- `akbar-dzikri_opencode-skill-enforcer` — OpenCode instruction fetched from a raw
  mutable GitHub URL (AG-SC-001 high).
- `DanWahlin_ai-agent-board` `.github/agents/squad.agent.md` — a "Do NOT tell the
  user about…" instruction inside model-fallback guidance (AG-SK-001 critical).
  Read in context it instructs the agent to conceal behavior from the user, which is
  exactly the rule's target semantics; kept critical.

## False-positive classes fixed (AG-CL-001)

All three classes were confirmed in multiple independent repositories before changing
the rule, and every head-to-head change below was manually inspected.

1. **Fixture-tree server configs** — an MCP server config under a test/fixture path
   (e.g. `tests/fixtures/security-plugin/embedded-secrets/mcp.json` in
   `HiAi-gg_agent-plugins-doctor`) deliberately models an insecure configuration.
   `checkServer` env/header secrets now grade low with fixture wording when the source
   config file is a test/fixture path. Non-fixture configs keep high (regression-pinned).
2. **Delimited test/selfcheck filename tokens** — self-verifying harness files named
   `integration-test-mcp-00N-*.mjs` / `selfcheck-mcp-00N-*.mjs` (under `tools/` in
   `reiTavares_ContextDevKit`) carry deliberate bad-case secret fixtures. A
   `test`/`selfcheck`/`selftest` token delimited by `-`/`_`/`.` inside the basename now
   counts as a test path. Unrelated hyphenated words (`contest-ranker`) do not match
   (regression-pinned).
3. **Redaction test vectors** — a secret-shaped value whose line carries the mask it
   must redact to (`{ raw: "ghp_…", mask: "[REDACTED:gh]" }`) or that lives in a
   redact-named utility file is a test input, not a leak. Corpus examples:
   `templates/contextkit/tools/scripts/economy/redact.mjs` (ContextDevKit) and eight
   prior-corpus `*redaction*.test.*` files that were already low via test paths and now
   also get the precise wording.

## Head-to-head (11 corpora, 1,393 repos)

Base = main @ #566, dev = this branch. Result: 16 findings high→low (all the manually
verified fixture/harness cases above), 28 low findings changed wording only (redaction
vector phrasing appended), zero other drift. r343, r353, r363 corpora byte-identical.

## Validation

- `pnpm build` / `pnpm test` green: 588 tests (config-convert 30, core 499, cli 59).
- `pnpm lint`, `pnpm typecheck`, `git diff --check` clean.
- Changeset added (patch, core + cli).

## Residual gaps

- npm download window still 2026-07-10 → 2026-08-08 (11,996 CLI / 12,929 core); not an
  independent new adoption data point.
- Broad `tools/` executable harness files beyond the delimited-token convention remain
  high by design — downgrading whole `tools/` trees would hide real secrets.
- 0.67.37/0.67.38 auto-version PRs (#564/#566) were merged on main; npm publish of
  0.67.38 is pending the release SOP.
