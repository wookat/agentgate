# GAP-ROUND-166 — git-URL OpenCode plugin specs without commit pins

Date: 2026-08-08 · Round type: follow-up on round-165 boundary

## Gap

Round-165 skipped URL plugin specs. But the real corpus showed the
pattern is in active use: two of four sampled repos load
`superpowers@git+https://github.com/obra/superpowers.git` — a plugin
fetched from a moving branch and executed at startup. That is the
same mutable-upstream exposure as an unpinned npm spec, arguably
worse (no registry audit trail, force-pushable history).

## Change

`AG-SC-001` OpenCode plugin handling now classifies URL specs:
`#<sha>` commit-pinned git specs pass; otherwise medium with a
pin-a-commit remediation. npm-spec handling is unchanged.

## Real corpus (round-165 corpus re-scan)

- LokiMetaSmith/llama-cluster-upbringing-script and
  bonigarcia/context-engineering — unpinned superpowers git spec:
  1 medium true positive each (was 0).
- cemalturkcan/opencode-pair — unchanged 5 medium npm true positives.
- alibaba/loongsuite-pilot — unchanged clean.

## Honest boundaries

- Branch/tag refs after `#` (e.g. `#main`, `#v1.2`) are still mutable
  but currently pass only when they look like a 7-40 char hex sha;
  `#main` does not match and reports — correct direction.
  A tag like `#deadbeef`-shaped could pass as a sha; acceptable.
- Plugin package names still not cross-checked against OSV/MCPA
  advisories (candidate, unchanged from round-165).

## Routine checks

- Advisory watch: no uncovered public MCP advisories in this sweep.
- Competitors: no relevant capability movement observed.

## Evidence

- Full suite green: core 240, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
