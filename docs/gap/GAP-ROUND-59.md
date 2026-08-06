# GAP Report — Round 59 (routine sweep + annotations discoverability)

## Routine checks (real runs, 2026-08-07)

- Advisory watch (GHSA + OSV, authenticated): "No uncovered MCP-related
  advisories found." Bundled DB stays at 28 records.
- Competitor versions unchanged since round 54: socket 1.1.154,
  snyk-agent-scan 0.5.16 (PyPI), osv-scanner v2.4.0.

## Gap

The rounds 56/57 GitHub Actions annotations feature — a real differentiator
(inline PR findings with zero config, vs competitors requiring SARIF upload
or a GitHub App) — was documented only on the `agentgate ci` CLI reference
page. The CI integration guide and both READMEs still pitched SARIF upload
as the only way to surface findings on PRs.

## Fix (docs only)

- `docs/guides/ci`: GitHub Actions section notes annotations come free,
  linking to the reference section; SARIF upload repositioned as additional.
- `README.md` / `README.zh-CN.md`: one-line mention next to the action
  snippet.

No changeset (docs only, no package behavior change).
