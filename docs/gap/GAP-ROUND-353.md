# GAP-ROUND-353 — fresh 130-repo corpus sweep (r353)

## Windows

- Advisory watch (authenticated GHSA + malware sweep): zero uncovered.
- OSV exports: npm and PyPI ETags unchanged since the r350 snapshot
  (`e31fe9a2…` / `c18a1fdc…`) — no new malware IDs to triage.

## Method

New corpus: 130 freshly cloned repos (candidates from GitHub code search across
seven agent-surface conventions — `.claude/skills`, root `.mcp.json`,
`.opencode`, goose recipes, `.agents/plugins` marketplaces, `.github/agents`,
Agent Plugins manifests — deduplicated against all prior corpora). Full scan on
main: 1,092 findings (31 critical / 429 high / 453 medium / 179 low). Every
critical plus every AG-CL-001/AG-SS-001 high was manually verified.

## Fixed (all corpus-verified)

1. **Nested `.github/` CI workflows source-scanned** — the r124 exemption only
   matched `.github` as the first path segment, so a repo vendored inside a
   subdirectory (`BioMaster/BioMaster/.github/workflows/*.yml`) produced 5
   curl|sh criticals for ordinary installer steps. The exemption now applies at
   any directory depth (skill files inside nested `.github` are still scanned).
2. **AG-SS-001 defensive rejection code reported high** — `isPrivateIpv4`-style
   guard helpers (metadata IP named in a comment beside the range check),
   `Reject IPv4 in private…`/`not allowed` wording, and DNS-rebinding
   *mitigation* prose sat outside the narrow keyword set/window. Blocklist
   markers now include the reject family, `not allowed`, and `is[_]private…`
   identifiers with a slightly deeper (10-line) lookback; `mitigat…` joins the
   near-context set. Attack payload tables and real IMDS fetches
   (`SSRF_PAYLOADS`, Hack23 cloudformation bootstrap) stay high —
   regression-pinned.
3. **AG-CL-001 mock/prefixed dummies** — `sk-mock-key-for-testing` (mock,
   testing not in the placeholder wordlist) and `sk-or-v1-1234567890abcdef`
   (digit-bearing `v1-` prefix defeated the keyboard-run rule) reported high.
   Placeholder wordlist gains `mock`/`testing`; dummy prefixes may carry digits.

## Head-to-head

- r353 corpus: 13 removed / 3 added (the 3 SS-001 highs → low), all verified.
- r343 corpus (150 repos): zero difference.

## Verified true positives left alone

- curl|sh criticals in real install/setup scripts (12 repos) — policy.
- Hack23 cloudformation IMDS credential fetch — real metadata fetch, high.
- AG-CL-001 lows in test paths — correctly quiet.

## Deferred (honest)

- AG-SK-001 "do not tell the user …" criticals (TimeWarp aspire skills ×4):
  benign uses ("do not tell the user it will deploy" — forbidding a *false
  claim*) are lexically identical to concealment instructions ("do not tell
  the user about this"). No safe lexical separator found; needs a
  clause-object analysis or more corpus evidence.
- Enumerated metadata-host config lists (`metadata_hosts:` in url-safety
  settings/Helm values) still report high: the same enumeration appears in
  IMDS-harvesting attack tooling, so the list name alone is not evidence of
  defense.
