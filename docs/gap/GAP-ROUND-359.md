# GAP-ROUND-359 — fresh-corpus precision: interleaved dummies, testdata/, Firebase configs, defensive headers, commented-out config

Date: 2026-08-03

## Method

1. Routine client version-window check (all nine tracked clients).
2. Fresh 135-repo corpus from agent-surface GitHub searches (dedup against r343/r353/r356 corpora), scanned with the current CLI (529 findings).
3. Every critical (13) and every high AG-CL-001 (7) / AG-SS-001 (3) finding manually verified against the repo source.

## Version windows

No changes: Claude Code v2.1.226, Gemini CLI v0.54.4, Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, Cline (npm CLI) 3.0.52.

## Verified true positives (kept)

- 13 AG-RC-001 curl|sh criticals: real installer/bootstrap scripts (verified executable surfaces).
- `mdlmarkham_TailOpsMCP/scripts/install/lib/platform-detect.sh`: live `curl http://169.254.169.254/...` cloud-provider probes — stays high.
- `ssdeanx_AgentStack/.kilocode/mcp.json`: real Qdrant Cloud API JWT hardcoded in MCP config (disabled server, still a leaked credential) — stays high.

## Verified false positives (fixed)

| Finding | Evidence | Fix |
|---|---|---|
| `snyk-labs_mcp-server-npm-goof` ghp_A1bC2dE3fH4iJ5kL6… ×2 high | letters walk the alphabet, digits count 1-9-0 in lockstep — demo filler | AG-CL-001 `isInterleavedRun` placeholder (monotone letter steps 1–2 + counting digit sequence) |
| `cbomkit_cbomkit-theia` `testdata/secrets/**` ×3 high | deliberate secret-scanner test fixtures | `testdata/` added to the test-path list |
| `refugies-info_karfur` `google-services.json` high | Firebase client API key, client-distributable by design (security = Firebase rules) | google-services.json / GoogleService-Info.plist graded low |
| `mdlmarkham_TailOpsMCP/src/utils/netsec.py` high | module docstring: "Implements URL/host allowlists to prevent: - SSRF attacks"; METADATA_IPS is a block-list constant, defensive comment outside the ±11-line window | AG-SS-001 header check (first 12 lines, preventive phrasing required) |
| `lj020326_ansible-datacenter` cloud-init defaults high | `#   metadata_urls: [...]` is a commented-out example line | commented-line grading (low); shebang / curl / wget lines excluded |

## Guardrails verified

- First header-check draft (bare `\bSSRF\b`) wrongly downgraded 8 SSRF-**exploitation** agent scripts in the r343 corpus (`.claude/skills/exploiting-server-side-request-forgery/...`); narrowed to require preventive phrasing (prevent/protect/mitigat/guard/block/deny + SSRF/metadata, or "allowlists ... to prevent") — those stay high.
- Commented-line grading excludes shebang-prefixed and curl/wget-containing lines (the TailOpsMCP one-physical-line install script keeps its high).

## Head-to-head (r357b code → r359 code)

- r359 corpus: exactly the 8 verified FPs change (3 removed placeholders + 5 high→low); everything else byte-identical.
- r356/r353/r343 corpora: only monotone interleaved dummy tokens in test files drop (all manually verified: ghp_abcdefghijklmnop…, ghp_1234567890abcdef…, etc.); zero severity changes, zero new findings.

## Tests

Two new regression tests pin both directions (dummies skipped / testdata + Firebase low / random-shape ghp stays high; defensive-header + commented-config low / curl probe stays high). Full suite green.
