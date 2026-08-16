# Growth dashboard

Weekly, honest, and small on purpose. Regenerate the raw numbers with:

```bash
GITHUB_TOKEN=<token> node scripts/growth-snapshot.mjs
```

## Counting rules (read before quoting any number)

1. **npm downloads are not users.** The raw `api.npmjs.org` counter includes
   registry mirrors, CI, and scrapers. Our v0.1.0 week is the proof: 6,490 raw
   downloads across a week in which the package had **zero** stars, zero issues
   and zero inbound links — and the per-version breakdown
   (`https://api.npmjs.org/versions/mcp-agentgate/last-week`) spreads those
   downloads almost evenly across *every* published version, including ones that
   were `latest` for minutes. Humans install `latest`; mirrors fetch everything.
   → Report **`latest`-version downloads** as the adoption proxy, and always
   alongside stars. Never quote the raw total in public material.
2. **Subtract self-produced traffic.** Our own release verification, the demo
   recordings and any `npx mcp-agentgate` in our workflows count as ours. Log
   each deliberate self-install in the week's row.
3. **Stars are the least gameable signal we have** at this stage, so they lead
   the table even though they are small.
4. **Unique visitors** come from GitHub Insights → Traffic (owner-only, 14-day
   retention — must be captured weekly or it is lost) and from the Cloudflare
   analytics for agentgate.zalize.com (route B).
5. Every row records what happened that week (posts, listings, releases), so a
   number without a cause is visibly a number without a cause.

## Baseline — week of 2026-08-16 (pre-promotion)

| Metric | Value | Source |
|---|---|---|
| GitHub stars | 0 | API, 2026-08-16 |
| Forks | 0 | API |
| Watchers | 0 | API |
| Open issues + PRs | 2 | API (both ours) |
| External contributors | 0 | — |
| npm downloads, 7d raw (`mcp-agentgate`) | 6,490 | api.npmjs.org — **mirror traffic, not users** (see rule 1) |
| npm downloads, 7d raw (`mcp-agentgate-config-convert`) | 508 | api.npmjs.org — same caveat |
| npm downloads of `0.1.0` in launch week | 4 | versions/last-week — this is the honest number |
| Unique visitors (repo) | not captured | needs owner GitHub Insights access |
| Unique visitors (agentgate.zalize.com) | not captured | needs Cloudflare analytics (route B) |
| Marketplace installs | not listed yet | docs/launch/marketplace.md |
| Awesome-list inclusions | 0 merged | docs/launch/awesome-listings.md |

**Verdict at baseline: real external users ≈ 0.** Everything above is either our
own traffic or automated mirrors. This is the number every promotion action is
measured against.

## Weekly log

| Week (Mon) | Stars | `latest` dl (7d) | Site UV | New listings / posts | Notes |
|---|---|---|---|---|---|
| 2026-08-16 | 0 | 4 (v0.1.0 launch week) | — | npm publish v0.1.0; GitHub topics set | Pre-promotion baseline |

## Targets (next 4 weeks, deliberately modest)

| Week | Stars | `latest` dl / week | Milestone |
|---|---|---|---|
| +1 | 25 | 50 | 2 awesome lists merged, Marketplace listed |
| +2 | 100 | 200 | Show HN or r/mcp post live |
| +3 | 150 | 400 | dev.to post + 1 inbound mention we didn't create |
| +4 | 250 | 700 | First external issue or PR from a real user |

The only target that actually matters is the last one: an external issue or PR
means someone ran it on their own machine and cared about the result.

## What to capture each week (5 minutes)

1. `GITHUB_TOKEN=… node scripts/growth-snapshot.mjs --append` — prints all
   metrics (including `latest`-version downloads) and appends a prefilled row to
   the Weekly log above
2. GitHub Insights → Traffic → unique visitors (screenshot; 14-day retention)
3. Cloudflare analytics for agentgate.zalize.com → unique visitors
4. Fill in the appended row, with the week's promotion actions in "New listings /
   posts". No row without its cause.
