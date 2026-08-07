# GAP-ROUND-93 — `deps` gates by default

Date: 2026-08-07

## Gap (found by real CLI UX walkthrough)

`deps` is positioned everywhere as a *gate* — the action input calls it a
"hallucinated/typosquatted dependency gate", the pre-commit hook says the
same — yet `--fail-on` had no default. Real run: a project with two
critical AG-DP-001 findings (`langchian`, `fastapi-mcp-server` — both
nonexistent on npm) exited **0** under a bare `agentgate deps`. Anyone
wiring `command: deps` into CI without remembering `args: --fail-on high`
got a green build over hallucinated dependencies. `ci` already defaults
to `high`; `deps` silently didn't.

## Fix

- `deps --fail-on` now defaults to `high` (same default as `ci`).
- New `never` choice reports without gating (there was previously no way
  to express "report only" once a default exists).
- Docs updated: deps page option table + CI example, README quick start,
  action example drops the now-redundant flag. `scan` keeps its
  report-first behavior (no default) — it is the exploration command;
  `ci`/`deps` are the gates.

## Evidence

- Before (0.19.0): bare `deps` on the two-critical fixture → exit 0.
- After: same fixture → exit 1; `--fail-on never` → exit 0 with the same
  report; CLI tests updated to assert the default gate and the `never`
  escape hatch. Full suite green locally (core 181 / cli 40 /
  config-convert 21).

## Routine sweep (this round)

- advisory watch: zero uncovered MCP advisories.
- Competitors unchanged: mcp-scan 2.0.2, socket 1.1.154,
  snyk-agent-scan 0.5.16, osv-scanner v2.4.0.
- Production a11y spot check after round-91/92 doc changes: axe WCAG
  2A/2AA on homepage, skills guide, overprivileged rule page, and
  config-convert page — 0 violations in both themes.
- Plandex: no MCP config convention found (docs page 404, no MCP paths in
  the repo) — still not coverable. ChatGPT Desktop connectors remain
  cloud/GUI-managed, no local config file to discover.

## Still open (honest)

- Breaking-ish default change: users relying on bare `deps` exiting 0
  will see exit 1 once findings reach high — released as a minor with
  explicit release notes.
- `includeTools` globs still not correlated against live tool surfaces.
