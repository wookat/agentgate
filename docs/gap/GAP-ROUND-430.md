# GAP-ROUND-430 — routine windows + r429 residual verification (honest no-defect round)

Date: 2026-08-03. Scanner: `main@d627f6c` (0.67.58).

## Advisory windows

- **Authenticated watch** (`api/scripts/watch.mjs` with GITHUB_TOKEN):
  "No uncovered MCP-related advisories found." Zero uncovered.
- **OSV npm**: ETag `"53128261faf337a1aa51e8c5812805fd"` — identical to
  the r428 snapshot object (no change since r428's empty diff vs r422).
- **OSV PyPI**: ETag `"b4c2b2138b4bedcbee06b632a0cedc56"` — unchanged
  since r426.
- **Client release window**: all nine monitored clients unchanged from
  r428 (claude-code v2.1.227, codex 0.147.0, gemini-cli v0.54.4,
  qwen-code v0.21.9, crush v0.88.1, copilot-cli v1.0.79, zed v1.14.2,
  opencode v1.18.16, goose v1.45.0).

## Production consistency

Website 200; advisory API 109; website feed (`items`) 109; npm
latest → 0.67.58. All consistent.

## r429 residual sampling

- AG-CL-001 low: test-path fixtures (adversarial.mjs, test_*.py),
  Firebase `google-services.json` web config, local `eyJ…` anon JWT —
  all graded quiet per r352/r359/r364 rules. Correct.
- AG-SK-001 low: instruction-override / hidden-tag / poisoning-marker
  phrases inside fenced examples and structural tags. Correct.
- AG-SS-001 low: defensive/blocking contexts (preflight probes, OAuth
  fetch guards, research allowlists) per r347/r413/r415. Correct.
- r429's three singleton slow-burns (REPLACE-valued placeholder comments,
  checker-script self-test vectors, security-education bidi table) —
  no second sample surfaced this round; remain deferred.

## Outcome

Honest no-defect round. No code change, no changeset.

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. GitGuardian +
local lint green (docs-only change).
