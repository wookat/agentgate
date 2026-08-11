# GAP-ROUND-434 — routine advisory windows + r433 residual verification

Date: 2026-08-04. Scanner: `main@02fb3f2` (0.67.59 + r433 docs).

## Advisory windows

- **Authenticated watch** (`api/scripts/watch.mjs` with a live GitHub
  token): "No uncovered MCP-related advisories found." — zero uncovered.
- **OSV npm**: ETag `"53128261faf337a1aa51e8c5812805fd"` — identical to
  r430/r432; MAL set unchanged, no diff needed.
- **OSV PyPI**: ETag changed
  (`"b4c2b213…"` → `"4e707918abb80988f7ea8a7c95797b8e"`). Full MAL diff
  against the r426 snapshot: 11,642 → 11,643, exactly **one** new record —
  MAL-2026-13728 (`dlmm`, host-info exfiltration on install, flagged
  PROBABLY_PENTEST). Zero MCP/agent/client keywords; out of MCPA scope.
  Snapshot saved at `~/corpora/osv-r434/`.
- **Client release window**: all nine monitored clients unchanged from
  r432 (claude-code v2.1.227, codex 0.147.0, gemini-cli v0.54.4,
  qwen-code v0.21.9, crush v0.88.1, copilot-cli v1.0.79, zed v1.14.2,
  opencode v1.18.16, goose v1.45.0 — stable channels; nightlies/pre-
  releases excluded as usual).

## Production consistency

Website 200; advisory API 109; website feed (`items`) 109; npm
latest → 0.67.59. Consistent.

## r433 residual verification

- **bkn-foundry quoted-string criticals** (r433 deferred singleton):
  searched every retained corpus round for the shape — shell files whose
  log/info/diagnostic function calls quote a `curl … | sh` string. Eight
  candidate repos matched textually; rescanning all of them with the
  current CLI shows every AG-RC-001 critical among them lands on a
  **genuine executed pipe** (Determinate Nix, ollama, just, omegon
  bootstrap, devtunnel, herdr installers), and the one echoed-hint file
  (rafex mcp-install.sh) already reports low via the comment-line rule.
  No second independent repo exhibits the bkn-foundry inert-quoted-string
  critical; it remains a one-repo slow-burn.
- Other r433 singletons (knotica `uvx --from ${CLAUDE_PLUGIN_ROOT}`
  wording, pipixia classifier) — no second sample this round; deferred.

## Outcome

Honest no-defect round: no new advisory to publish, no client-surface
change, no shape reaching the two-independent-repo bar. No code change,
no changeset.

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. GitGuardian +
local lint green (docs-only change).
