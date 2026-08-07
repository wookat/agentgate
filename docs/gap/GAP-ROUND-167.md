# GAP-ROUND-167 — OpenCode plugins vs known-malware advisories

Date: 2026-08-08 · Round type: follow-up on rounds 165/166 boundary

## Gap

Rounds 165/166 flag unpinned OpenCode plugin specs, but pinning does
not help against a package that is malicious in every version.
MCP server packages already get OSV.dev known-malware (AG-SC-002)
and MCPA database (AG-SC-003) checks; startup-executed plugins are
the same class of code and were not advisory-checked at all.

## Change

`opencodePluginRefs` (core) extracts npm package refs (name +
pinned version) from OpenCode `plugin` arrays; `scan` feeds them
into the same OSV/MCPA pipelines as server package refs, with an
`OpenCode plugin "spec"` context in messages. Git-URL and local
plugin specs are not registry packages and are excluded.

## Real corpus (round-165 corpus re-scan)

- cemalturkcan/opencode-pair — 5 npm plugin refs queried: no OSV
  malware or MCPA advisories match today (honest: 0 findings, the
  wiring is verified by unit tests plus the query being issued).
- Other three repos — no npm plugin specs; unchanged results.

## Honest boundaries

- Version ranges inside plugin specs are treated like unpinned
  (advisories with version ranges score as "unpinned" severity),
  same as server specs.
- OSV coverage of agent-plugin malware is nascent; the check's
  value grows as those advisories appear.

## Routine checks

- Advisory watch: no uncovered public MCP advisories in this sweep.
- Competitors: no relevant capability movement observed.

## Evidence

- Full suite green: core 241, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
