# GAP-ROUND-362 — single-line messages: remaining excerpt sites

## Routine windows

- Advisory watch (authenticated GHSA + malware sweep): zero uncovered.
- OSV exports: npm ETag unchanged (`e31fe9a28baffdba3bc7ffea32444eec`);
  PyPI ETag changed (`36cb3f98fa8f620fac46a870562e0825`) — full MAL id scan of
  the fresh export found one MCP-named id modified since r358
  (MAL-2026-11198, mcp-search-server), already covered by MCPA-2026-0005.
- Nine-client version window: unchanged (Claude Code v2.1.226, Gemini CLI
  v0.54.4, Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code
  v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, cline npm 3.0.52).

## Change: complete the single-line message sweep

Round 361 fixed the demonstrated AG-RC-001/AG-SK-001 multi-line message
defect. A full audit of remaining excerpt-embedding message sites found the
same latent defect class wherever a matched span or config-supplied command
is embedded verbatim:

- AG-TP-001 tool-description injection messages — `toolText()` joins
  name/description/schema with `\n` and the injection regexes use `\s+`, so
  matches can span lines;
- all AG-SK-003 hook/monitor/LSP/plugin command messages — commands come from
  JSON/YAML config values, which can be multi-line (YAML block scalars,
  embedded `\n`);
- AG-SC-001 remote instruction entries and git-URL plugin specifiers.

All now use the shared `snippet()` helper (whitespace runs collapse to one
space; truncation after normalization). Line-locating `slice(0, 40)` lookups
are intentionally unchanged — they must match raw file content.

## Verification

- r359 corpus head-to-head vs the r361 output: zero structural diffs, zero
  message-text diffs, zero messages containing newlines.
- New regression tests pin single-line AG-TP-001 messages (multi-line
  injection match) and AG-SK-003 hook-command messages (multi-line command).
- Full suite green: 538 (config-convert 30, core 449, cli 59) + build, lint,
  typecheck, `git diff --check`.
