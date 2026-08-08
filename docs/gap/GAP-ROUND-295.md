# GAP-ROUND-295 — advisory routine sweep (last: round 291)

Round type: advisory intake. Result: **no new database entries**; three
resurfacing GHSA false positives moved to the watch ignore list.

## GHSA vulnerability window

`node api/scripts/watch.mjs --dry-run` surfaced the same three low-severity
candidates as round 291 (they stay inside the 8-day window):

| GHSA | CVE | Project | Registry recheck (this round) |
| --- | --- | --- | --- |
| GHSA-6cmv-x2ph-3gc2 | CVE-2026-19287 | abrinsmead/mindpilot-mcp | npm 404, PyPI 404 |
| GHSA-4p6x-rj5h-hg93 | CVE-2026-19288 | astralisone/rive-mcp-server-core | npm 404, PyPI 404 |
| GHSA-rrf2-j3h9-99wg | CVE-2026-19282 | andreahaku/llm_memory_mcp | npm 404, PyPI 404 (both `llm_memory_mcp` and `llm-memory-mcp`) |

All three remain GitHub-only projects with no registry mapping — the same
mapping bar as rounds 261/267/281. Round 291 rejected them but did not add
them to `advisories/watch-ignore.json`, so every sweep re-surfaces them.
Fixed this round: ids + rationale added; `--dry-run` now reports
"No uncovered MCP-related advisories found."

## Malware namespace window

- npm: fresh OSV `all.zip` (219,308 MAL entries) diffed against the round-291
  snapshot — **0 brand-new MAL ids** since that sweep; nothing to triage.
- PyPI: OSV `all.zip`, 96 MAL entries modified on/after 2026-07-25, 2
  MCP/agent-vocabulary candidates:
  - `mcp-search-server` — already covered as MCPA-2026-0005 (round 12).
  - `trtllm-subdir-test` — dependency-confusion beacon (sentinel version
    99999.0.1, install-time GET to a bare-IP callback), OSV categorises it
    PROBABLY_PENTEST; not an MCP/agent package, delegated to general scanners
    per the established bar. Rejected.

## Consistency check

Advisory count unchanged at 91 (bundled database; production endpoints were
verified three-ways at 91 after #430).

## Boundaries

- PyPI has no snapshot-diff baseline like npm (first PyPI zip kept this round
  under `~/corpora/r295/`); future sweeps can diff instead of window-filter.
