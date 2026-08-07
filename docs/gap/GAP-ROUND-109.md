# GAP-ROUND-109 — OAuth round 2/3: live scans pick up cached tokens

Date: 2026-08-07 · Round type: capability (per OAUTH-REMOTE-SCAN.md sequencing)

## What shipped

- `fetchToolSurface` accepts an `authProvider` (official SDK
  `OAuthClientProvider`); the CLI wires in a non-interactive provider backed
  by the `auth login` token store, keyed by server origin.
- Credential precedence, as designed: configured static `headers` → cached
  OAuth tokens → anonymous. The provider is only consulted when no headers
  are configured.
- 401/403 hints upgraded: no credentials → suggests `agentgate auth login
  <name>` or static headers; cached tokens rejected → suggests logging in
  again; rejected headers hint unchanged. The stale "Interactive OAuth flows
  are not supported" copy is gone (CLI + troubleshooting docs).
- Non-interactive guarantee: the scan-path provider has no redirect URL; a
  token the SDK cannot refresh surfaces as an auth error, never a browser.

## Verified (real runs)

- New core fixture: Streamable HTTP MCP server requiring
  `Authorization: Bearer good-token`. e2e: valid cached token → tools listed;
  rejected token → "cached OAuth tokens were rejected — run `agentgate auth
  login …`"; headers take precedence over a (bad) provider token.
- CLI e2e: `scan --live` with no credentials prints the auth-login hint;
  after storing tokens (as `auth login` does), `lock` pins the remote
  surface with no hint. Store written under `AGENTGATE_CONFIG_DIR`.
- Full suite green: 192 core / 45 cli / 21 config-convert; lint/typecheck/build clean.

## Found and fixed this round

- SDK detail: a 401 with an unusable cached token surfaces as
  "Either provider.prepareTokenRequest() or authorizationCode is required"
  (transport demands interactive re-auth), not only `UnauthorizedError` —
  `isAuthError` now recognizes both.

## Not in this round (by design)

- Token refresh happens implicitly via the SDK when a refresh token exists;
  no real-provider (GitHub MCP) end-to-end with pre-registered client ID yet
  — needs a human-owned OAuth app; round 3/3 with docs + comparison update.
