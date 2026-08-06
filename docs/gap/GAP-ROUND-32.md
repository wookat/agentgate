# GAP Report — Round 32 (advisory data: flyto-core batch + mirror-id aliases)

Driven by the round-31 sweep's live output.

## Added (all publicly verified via GHSA/OSV APIs)

- **MCPA-2026-0012** — flyto-core unauthenticated command execution via HTTP MCP
  `execute_module` (CVE-2026-55786 / GHSA-h9f9-h6gm-wc85, CVSS 8.4, 2.26.2 ≤ v < 2.26.4).
- **MCPA-2026-0013** — flyto-core SSRF guard bypass via IPv6 transition
  addresses (CVE-2026-55787 / GHSA-794r-5rp2-fpg8, CVSS 7.1, < 2.26.3).
- **MCPA-2026-0014** — flyto-core 2026-07-30 batch (CVE-2026-67424..67428, five
  GHSAs, worst CVSS 9.3: unauthenticated `/run` callback_url SSRF with internal
  runner-secret exfiltration; all < 2.26.7). Grouped: same package, same fixed
  version, same disclosure date.

## Alias enrichment (same vulnerabilities, mirror ids)

PYSEC/MAL mirror ids added to MCPA-2025-0002/-0012, MCPA-2026-0001/-0007/-0008/-0010
after verifying each mirror's OSV `aliases` points at the already-covered CVE/MAL id.
This also quiets the round-31 sweep (alias-aware).

## Verified

- Schema: 28/28 valid; bundle + api data regenerated at 28.
- CLI: `uvx flyto-core==2.26.2` hits MCPA-2026-0008/-0012/-0013/-0014; `==2.26.7` clean.

## Honest limits

- MCPA-2026-0014 groups five CVEs into one entry; consumers wanting per-CVE
  granularity should follow the aliases to GHSA/OSV.
