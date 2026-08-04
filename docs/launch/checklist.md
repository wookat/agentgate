# Launch checklist (route C → total lead)

> Owner of every EXECUTE step: total lead (SOP-03). Route C prepares content only.

## Pre-launch gates (all must be true before any post)

- [x] Route A: `mcp-agentgate` published on npm (`mcp-agentgate@0.1.0`, 2026-08-04);
      `npx mcp-agentgate@0.1.0` verified working
- [ ] Route B: docs site (https://agentgate.zalize.com) + advisory DB + Workers API live
- [x] README quickstart commands re-verified against the shipped CLI (PR #29)
- [ ] docs/COMPARISON.md re-verified against shipped v0.1 (replace "planned" markers)
- [x] Demo GIF recorded from the real CLI (asciinema+agg) and embedded in README
      (docs/assets/demo.gif; regen steps in docs/assets/README.md)
- [ ] Tag `v0.1.0` release with release notes
- [ ] GitHub Action marketplace decision executed (root action.yml copy vs dedicated repo)
      and Action published to Marketplace
- [ ] pre-commit hook verified against the tagged rev

## Launch sequence (suggested)

1. Day 0: tag release, publish npm + Action, soft-share in MCP Discord/Discussions
2. Day 1: Show HN (docs/launch/show-hn.md) — Tue–Thu 14:00–16:00 UTC
3. Day 2+: r/mcp, then other subreddits ≥2 days apart (docs/launch/reddit.md)
4. Day 3: V2EX 分享创造 (docs/launch/v2ex.md)
5. Week 2: awesome-list PRs after the repo shows real activity/stars (docs/launch/awesome-listings.md)

## During launch

- [ ] Maintainer on comment duty for first 3h of each post
- [ ] Track issues opened by new users; label `launch-feedback`
- [ ] Do not astroturf votes; do not repost the same content across channels same-day

## Post-launch (feeds SOP-05 operations loop)

- [ ] Collect feedback themes weekly → prioritized fixes
- [ ] Update COMPARISON.md when competitors ship notable changes
- [ ] Track: GitHub stars, npm downloads, Action usage, advisory DB API hits
