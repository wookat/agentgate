# GAP-ROUND-90 — data checkpoint (rounds 81–89)

Date: 2026-08-07

All numbers below are real measurements taken on 2026-08-07; commands noted
inline.

## Shipping velocity (rounds 81–89)

- 9 feature/fix PRs merged: #148, #149, #151, #152, #154, #155, #156, #157,
  #159 (all ordinary non-stacked PRs, CI green before merge).
- 4 releases published and regression-tested in clean environments:
  v0.17.0, v0.18.0, v0.18.1 (+ v0.16.0 closed out at the start of the
  window). Current: mcp-agentgate@0.18.1, core@0.18.1, config-convert@0.5.0.

## Coverage

- Client discovery: 13 → 14 (Amp added round-85); `config convert`
  supports 14 clients.
- New scan surfaces: Continue.dev rules + prompts (81/83), skill-declared
  MCP servers — Amp frontmatter/`mcp.json` convention (86).
- Advisory DB: 31 advisories (`ls advisories | grep -c '^MCPA-'`); live
  feed serves 31 items; `advisory check ludus-mcp@1.0.24` hits 3 (live).
- Advisory watch: word-edge matching (82), `--draft` prefill (84), triage
  commands in the weekly issue (88). Today's sweep: zero uncovered.

## Performance (real runs, this machine)

- Self-scan: 0.17s for the repo (16 findings, dogfood baseline unchanged).
- claude-code-templates (4,314 files, 906 SKILL.md): 1.2s, 148 findings.

## Quality data points

- FP sweep round-88: skill-server extraction produced zero false positives
  on real marketplaces (convention not yet used in the wild).
- Report-quality fixes shipped from real-run observations: scannedFiles
  dedupe (87), per-rule footer counts (89).

## Adoption (upper-bound caveat: includes our own CI)

npm last-month downloads (`api.npmjs.org`, 2026-07-07 → 2026-08-05):
- mcp-agentgate: 1,668 (flat vs round-80)
- mcp-agentgate-core: 1,751 (flat)
- mcp-agentgate-config-convert: 200

Natural adoption remains the weakest axis — unchanged since round-70:
distribution (marketplace listings, launch/announcement) is the biggest
non-code gap and needs a deliberate decision from the owner.

## Competitors (checked this window)

- thynkQ mcp-scan (npm) 2.0.2 — unchanged since round-72 head-to-head.
- socket 1.1.154 — unchanged.
- snyk-agent-scan (PyPI) 0.5.16 — unchanged.
- osv-scanner v2.4.0 — unchanged.

## Standing gaps

1. Distribution/adoption (non-code, owner decision needed).
2. `includeTools` allowlists in skill server entries uninterpreted.
3. No `--draft` for OSV-only ids in advisory watch.
4. Warp, ChatGPT Desktop, Plandex client conventions still unverified.
