# GAP-ROUND-251 — Advisory sweep (no new entries)

Date: 2026-08-08. Routine advisory verification round (previous: round 244).
Full GHSA window 2026-08-04..2026-08-09 swept (1,392 advisories, keyword +
manual triage). **Result: zero new database entries — every relevant
advisory is already covered, and every uncovered candidate fails the
package-mapping bar.** Recorded honestly rather than padding the database.

## Already covered (aliases verified in existing entries)

| GHSA | Maps to |
| --- | --- |
| GHSA-rm9r-9424-cccf (Flowise auth bypass ≤3.1.4) | MCPA-2026-0056 |
| GHSA-qvmw-v4w9-7c4j (Flowise IDOR ≤3.1.4) | MCPA-2026-0057 |
| GHSA-7q53-9j99-gg5c (Flowise missing authz ≤3.1.4) | MCPA-2026-0058 |
| GHSA-w95p-h69m-853r (DocumentDB MCP aggregation authz) | MCPA-2026-0011 |
| GHSA-qwp6-wxvx-2jc8 (HKUDS nanobot ≤0.2.1) | MCPA-2026-0020 |
| GHSA-f5cw-432q-pfqr (OpenHands ≤0.62.0) | MCPA-2026-0059 |

The 08-04 Flowise batch (20+ GHSAs) was ingested in rounds 238/244; the
deliberate remainder policy from GAP-ROUND-244 (same version range already
covered by critical entries) still stands.

## Not ingested — package-mapping bar failed (each verified directly)

- **godot-mcp** (CVE-2026-19044, command injection): npm `godot-mcp` is a
  *different project* (craigsteyn/godot-mcp; the CVE is against
  LeeSinLiang/godot-mcp, unpublished). No registry mapping.
- **@missionsquad/mcp-api** (CVE batch, RCE fixed 1.11.9 + SSRF fixed
  1.11.10): package name exists only in the repo's package.json — **not
  published to npm** (npm `mcp-api@0.0.1` is unrelated). Real fixes, no
  installable artifact to match; revisit if it publishes.
- **ssh-mcp-server** (CVE-2026-19039): maintainer disputes ("local/trusted
  tool" threat model), rolling release with no version ranges, and the npm
  `ssh-mcp-server` package's provenance to that repo could not be
  established. Out under the existing disputed/no-range policy.
- **la-forge-mcp / poco-agent / NanoClaw**: not on npm or PyPI.
- **IBM Langflow OSS batch (5), LangGraph checkpoint libs, llama.cpp, Ruby
  JSON**: platform products / non-scan-surface libraries — outside DB scope
  per the standing owner decision (rounds 228/235).

## State

Database stays at 73 entries, three-way consistent (repo / API / feed —
re-verified this round during the v0.56.0 close-out).
