# GAP-ROUND-107 — OAuth remote-scan design round

Date: 2026-08-07 · Round type: design (no code)

## Why now

GAP-99/102/106 all recorded the same top live-scan gap: hosted MCP servers
that require OAuth (GitHub MCP verified by real test in round 102) are
unscannable without a manually minted PAT. This round converts the gap into
an implementable design instead of another restatement.

## What was verified (real, this round)

- The installed official SDK (`@modelcontextprotocol/sdk@1.30.0`) already
  ships the full client-side OAuth machinery: `OAuthClientProvider`
  interface, `auth()` orchestration (discovery, PKCE, dynamic client
  registration, refresh, `invalidateCredentials`), and
  `StreamableHTTPClientTransport({ authProvider })`. Confirmed by reading
  `dist/esm/client/auth.d.ts` in the pinned package — we only need to
  implement storage + browser redirect.

## Output

`docs/design/OAUTH-REMOTE-SCAN.md`: `agentgate auth login/status/logout`
with loopback redirect and XDG token store; transparent token pickup in
`fetchToolSurface` (headers → cached tokens → anonymous); CI stays strictly
non-interactive; alternatives and 3-round sequencing.

## Remaining

- Implementation itself (3 rounds per the design).
- Decision point: none required — design follows CHARTER "提议即默认方案";
  will start round 1 of the sequence unless redirected.
