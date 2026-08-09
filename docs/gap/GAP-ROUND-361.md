# GAP-ROUND-361 — release incident close-out + single-line finding messages

## Release incident (P0, closed)

`mcp-agentgate@0.67.23` was published to npm with literal `workspace:*`
dependency specifiers (published via `npm publish`, which does not rewrite
them; only `pnpm publish` does) and was uninstallable — clean-env
`npx mcp-agentgate@0.67.23` failed with `Unsupported URL Type "workspace:"`.
Caught by the routine post-release clean-environment regression.

- Stopgap: `latest` dist-tag rolled back to 0.67.20.
- Fix: 0.67.24 (#528) published correctly with `pnpm -r publish`; clean-env
  regression passed (poisoned SKILL.md critical + Bash pre-approval high +
  mcp-echarts advisory hit).
- Prevention: `docs/RELEASING.md` now mandates `pnpm publish` for manual
  publishes and a required clean-environment install verification after every
  publish, with a ready-to-run command and rollback instruction.

## Defect: multi-line snippets in finding messages

The `EVAL_RE` `child_process … exec(` branch matches across lines, and the
matched span was embedded verbatim into the finding message — r359 corpus had
9 AG-RC-001 messages containing raw newlines (r343: 40 RC + 20 SK-001), which
break findings-table row layout and read poorly in annotations/SARIF.

Fix: shared `snippet()` helper collapses whitespace runs to single spaces at
every message site that embeds a regex match span (AG-RC-001 dynamic-exec,
AG-SK-001 skill/Copilot-extension/goose-recipe/Kiro-hook injection messages).

Verification: full r359 corpus head-to-head — zero structural diffs
(rule/severity/file/line all byte-identical); only the affected messages
changed, and re-scan output contains zero messages with embedded newlines.
Regression tests pin both the AG-RC-001 and AG-SK-001 single-line behavior.

## Data

- Tests: 536 (config-convert 30, core 447, cli 59), all green.
- npm: latest → 0.67.24, dependencies resolved (core 0.67.24 /
  config-convert 0.14.0); production API/feed 104 each, site 200.
- Nine-client version window: unchanged (re-checked this round).
