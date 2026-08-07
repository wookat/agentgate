# GAP-ROUND-110 — OAuth round 3/3: docs + comparison

Date: 2026-08-07 · Round type: docs/UX (per OAUTH-REMOTE-SCAN.md sequencing)

## What shipped

- New website guide "OAuth for remote servers" (`/docs/guides/remote-oauth/`):
  login/status/logout, `--client-id` for providers without dynamic
  registration, token storage location + permissions, credential precedence
  (headers → cached tokens → anonymous), CI non-interactive guidance.
- Comparison page: new "OAuth login for hosted servers" row. Fresh evidence:
  thynkQ mcp-scan 2.0.2 re-run today against a config pointing at the real
  GitHub MCP endpoint — 13ms "scan", never connects, so OAuth is trivially
  out of scope for it. snyk-agent-scan stays "unknown — unverifiable without
  a token" (no fabricated cells).
- READMEs: `agentgate auth` added to the root quick-start block and the CLI
  package command list.
- Website builds clean: 64 pages.

## Explicitly not claimed

- No end-to-end login against a real OAuth provider (GitHub MCP requires a
  human-owned pre-registered OAuth app); the protocol path is covered by the
  local fixture e2e from rounds 108/109. The docs say "OAuth 2.1 + PKCE",
  which is what the SDK implements and what the fixture verifies.

## Remaining gaps (candidates for next rounds)

- Real-provider e2e once a pre-registered client ID is available.
- `auth login` docs page is English-only, like the rest of the site.
- Advisory watch + competitor sweep due again in the next routine round.
