# GAP-ROUND-418 — routine windows + r417 residual verification

Date: 2026-08-03. Scanner at main@b038de2 (post-#627, 0.67.55). Honest
no-defect round; no code change, no changeset.

## Advisory windows

- **Authenticated GHSA/OSV watch** (`api/scripts/watch.mjs` with token):
  "No uncovered MCP-related advisories found."
- **OSV npm**: ETag `0f1e3bf0…` — identical to r414/r416; MAL set unchanged.
- **OSV PyPI**: ETag `93f7c32e…` — identical to r414/r416; MAL set unchanged.
- **Client version window**: all unchanged from r416 — claude-code v2.1.227,
  codex 0.147.0, gemini-cli v0.54.4, qwen-code v0.21.9, crush v0.88.1,
  copilot-cli v1.0.79, zed v1.14.2 (opencode/goose: no new release).

## Production consistency

Website 200; advisory API 109; JSON feed items 109; repo `advisories/`
MCPA files 109 — all consistent.

## r417 residual sampling (per rule, in-source)

- **AG-SS-001 low**: test-path metadata reference (TappsMCP unit test),
  blocking/defensive contexts (agent-ssh-gateway event-hook guard, medusa
  detection-rule yaml) — downgrades semantically correct.
- **AG-TP-001 low**: U+202E in a hostile eval fixture (mur), stray BOM
  chars in source/data files (gzkit ledger.py, EcoSystemUmGrau tfidf
  json) — correct boundary-artifact/fixture grading.
- **AG-SK-001 low**: instruction-override patterns inside fenced code
  blocks (dawsonblock/Aaron ×2, raandree/CopilotAtelier security-review
  skill) — correct quoted-example grading.

## Deferred singletons (unchanged from r417, still 1 repo each)

medusa rule-description installer prose (AG-RC-001), medusa bidi controls
in executable rule regex/YAML pattern range (AG-TP-001), benign "sidenote"
skill prose (AG-SK-001), benchmark-fixture credentials (AG-CL-001).

## Release state

npm latest 0.67.55; no unconsumed changesets on main. GitHub Actions
remains down (account-level outage); degraded gate in effect.
