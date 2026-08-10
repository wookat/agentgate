# GAP-ROUND-382 — routine windows + r381 residual verification (honest no-defect round)

Date: 2026-08-04. Baseline: main @ #567.

## Advisory window (clean)

- Authenticated watch re-run: no uncovered MCP-related advisories.
- OSV exports: npm all.zip ETag `63ab8220…` unchanged since round 379; PyPI ETag
  `df798022…` unchanged since round 374.
- Nine-client version window unchanged: Claude Code v2.1.226, Gemini CLI v0.54.4,
  Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code v0.21.8,
  Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52.
- Production consistency: repo 109 advisories, API 109, feed 109.
- npm: still the 2026-07-10 → 2026-08-08 window (11,996 CLI / 12,929 core);
  npm latest still 0.67.36 (0.67.37/0.67.38 versioned on main, publish pending).

## r381 residual verification

- 47 AG-RC-001 medium findings reviewed by class: shell-launched servers
  (`cmd -c` inline strings — rule semantics correct), dynamic-exec primitives
  (real `exec`/`execSync`/`eval`/`new Function` calls in plugin servers and test
  files — real execution sites, correctly medium), and non-executable curl|sh
  text warnings (documentation/constants — correctly medium with confirm wording).
- AG-SK-002 high sample (unscoped `Bash` in allowed-tools across skills/commands):
  all rule-semantics true positives.
- No new generalizable false-positive class found; no code change this round.

## Outcome

Docs-only checkpoint; no changeset. Next fresh-corpus round continues the loop.
