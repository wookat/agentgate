# GAP-ROUND-440 — routine windows + r439 residual verification

Routine advisory-watch round. Honest zero: no new advisories, no scanner
defects. Docs only.

## Advisory windows

- **Authenticated advisory watch** (GHSA + OSV, `api/scripts/watch.mjs`):
  "No uncovered MCP-related advisories found." Zero uncovered.
- **OSV npm**: ETag `"53128261faf337a1aa51e8c5812805fd"` — identical to
  r430/r432/r434/r436/r438; MAL set unchanged, no diff needed.
- **OSV PyPI**: ETag changed (`"5f9557…"` → `"92148681e65b28780e8a86383fdd087d"`).
  Full-snapshot MAL diff against the r436 baseline: 11,644 → 11,647, exactly
  3 new IDs, all reviewed and rejected for the MCPA database:
  - MAL-2026-13730 `euler-sdk` / MAL-2026-13731 `morpho-sdk` (kam193): install
    beacons exfiltrating basic host info, PROBABLY_PENTEST, zero MCP/agent
    keywords.
  - MAL-2026-13732 `joule-btp-extension` (ossf-package-analysis): squat on the
    SAP BTP/Joule name space contacting a known-bad domain; a generic PyPI
    squat, not an MCP server/client/agent-facing package — below the mapping
    bar (same rationale as the r434 dlmm rejection).
- **Client release window**: stable channels of all nine monitored clients
  unchanged from r438 (claude-code v2.1.227, codex rust-v0.147.0, gemini-cli
  v0.54.4, qwen-code v0.21.9, crush v0.88.1, copilot-cli v1.0.79, zed v1.14.2,
  opencode v1.18.16, goose v1.45.0). qwen-code published a new
  `live-host-v0.1.1` tag — a separate live-host artifact line, not the CLI;
  nightlies/pre-releases excluded as usual.

## Production consistency

Website 200; advisory API 110; website feed (`items`) 110; npm latest →
0.67.60 (0.67.61 versioned via #655, owner release from `main` pending —
expected to move latest after publication).

## r439 residual singletons (no second sample this round)

The five r439 singleton shapes (unquoted-YAML detection-rule scalar bidi,
escaped-quote error-message curl|bash, teaching failure catalog, canary
sentinel key, benchmark vulnerability corpus) remain single-repo; this round
introduced no new corpus and the advisory windows surfaced no second sample.
Still below the two-repo bar. Carried.

## Disclosure

GitHub Actions remains unavailable; checks above ran locally/against live
endpoints. No code changes, no changeset.
