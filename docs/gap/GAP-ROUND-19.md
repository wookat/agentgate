# GAP-ROUND-19 — stale public advisory surfaces + deploy automation

Round type: operations (found while checking the round-18 advisory's public
visibility).

## Gap

The public advisory surfaces had silently drifted from the repo:

- Website (`agentgate.zalize.com`): feed showed 15 advisories, pages for
  MCPA-2026-0003..0010 were 404 — every AG-SC-003 `detail` link for those
  advisories was broken. Last deploy predated round 10.
- Advisory API Worker (`agentgate-advisory-api`): live but serving 6
  advisories (deployed 2026-08-03, before rounds 10–18 landed).

Neither had any deploy automation — both were manual one-off deploys.

## Fix

1. Redeployed both from current main (done immediately, out of band):
   website now serves all 23 advisories (feed + per-advisory pages 200),
   Worker `/v1` reports `advisory_count: 23` and
   `/v1/query?name=openai-mcp&ecosystem=pypi` returns MCPA-2026-0010.
2. This PR adds `.github/workflows/deploy.yml`: on pushes to main touching
   `website/**`, `advisories/**`, or `api/**`, deploy the website to
   Cloudflare Pages and the advisory API Worker. Both jobs no-op with a
   warning until the `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` repo
   secrets are configured.

## Remaining known gaps

- Repo secrets must be added by someone with admin access for the automation
  to activate (account id: `ddff52d24ee44e21a021c15eaffcc86d`, Pages project
  `agentgate`, Worker `agentgate-advisory-api`).
- The CLI still uses only the bundled DB; consuming the live API is a future
  enhancement (spec: `docs/spec/advisory-api.md`).
