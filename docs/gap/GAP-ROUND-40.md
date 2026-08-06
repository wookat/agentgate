# GAP Report — Round 40 (website docs for `agentgate advisory`; usage data)

## Gap

The `agentgate advisory` subcommand shipped in 0.8.0 (and round 39 made
`check` dual-ecosystem) but the website CLI docs — the surface a prospective
user actually reads — had no page for it: `docs/cli/` covered
scan/lock/diff/ci/deps/config-convert only.

## Fixed

- New `website/src/content/docs/docs/cli/advisory.md` in the house style
  (usage, pre-install-gate examples with real advisory ids, options table,
  data-source semantics, honest boundaries) + sidebar entry after `deps`.

## Data check (this round)

- npm downloads (api.npmjs.org, last month): mcp-agentgate total 248, all on
  2026-08-04 (release day — likely mostly mirrors/bots, not organic usage).
  Honest read: distribution, not adoption, is the current bottleneck.

## Honest limits

- Docs page verified in a local production build; deployed with the next
  website redeploy.
