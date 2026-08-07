# GAP-ROUND-114 — v0.23.1 close-out + AG-CL-001 placeholder FPs

Date: 2026-08-07 · Round type: release close-out + FP sweep

## Release close-out (0.23.1)

- v0.23.1 tag + GitHub Release (round-111 store hardening patch).
- Website redeployed from main: `/docs/cli/auth/` reference + FAQ login
  entry (round-112) live in production.
- Note: the round-113 changeset (login header warning) merged after #188 was
  cut, so it is NOT in 0.23.1 — it rides the next patch PR together with
  this round's changeset.
- Clean-env regression (npx 0.23.1, fresh cache, isolated
  `AGENTGATE_CONFIG_DIR`): corrupted `oauth.json` (`garbage not json`) →
  `auth status` reports "No OAuth logins saved" instead of crashing; a
  `chmod 644` store is re-tightened to `0600` on the next write
  (verified via `auth logout`).

## FP sweep (real repos, this round)

- lastmile-ai/mcp-agent (735 source files): 3× AG-CL-001 low, all
  placeholders — `xoxb-your-bot-token` (commented example),
  `sk-my-anthropic-api-key` (test literal). Real FPs: the placeholder
  check (`your|example|dummy|…`) only guarded env/header values, not
  `checkSource`/args matches.
- Fix: apply `isPlaceholder()` to the matched value in `checkSource` and
  the args loop; extend the word list with `my|sample|fake`. mcp-agent
  now scans clean; the deliberate-fake AWS-key fixture test still fires.
- browserbase/mcp-server-browserbase (35 files): 0 findings before and
  after (no FP, no regression).

## Not claimed

- `test` was deliberately NOT added to the placeholder word list — real
  tokens can legitimately contain it and path-based downgrading already
  handles test trees.
