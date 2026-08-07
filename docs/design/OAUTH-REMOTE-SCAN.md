# OAuth for remote live scanning — design

Status: **proposal** (Round 107). Scope: `scan --live`, `lock`, `diff`, `ci`
against remote (`url`) MCP servers that require OAuth instead of a static
bearer token.

## Problem

Since 0.21.0 AgentGate connects to remote servers via Streamable HTTP/SSE and
authenticates with static `headers` only. Since 0.21.1 a 401/403 tells the
user to configure a token — but a growing class of hosted servers (GitHub MCP,
Sentry, Linear, …) prefer or require the MCP OAuth flow (OAuth 2.1 +
authorization-code + PKCE, with RFC 9728 protected-resource metadata
discovery and RFC 7591 dynamic client registration). Today those servers are
unscannable without the user manually minting a PAT — the honest "Interactive
OAuth flows are not supported" error.

## Constraints

1. **CI must stay non-interactive.** `agentgate ci` can never open a browser.
2. **No secrets in the lockfile or repo.** Tokens live outside the project
   tree.
3. **Reuse the official SDK.** `@modelcontextprotocol/sdk` already implements
   the whole client side (`auth()`, `OAuthClientProvider`,
   `StreamableHTTPClientTransport({ authProvider })`, including discovery,
   PKCE, dynamic registration, refresh, and `UnauthorizedError` signaling).
   We implement only the provider (storage + browser redirect), not the
   protocol.

## Proposed design

### New: `agentgate auth login <server-name|url>` (interactive, local dev)

1. Resolve the server URL from discovered/explicit config.
2. Run the SDK flow with a loopback redirect (`http://127.0.0.1:<random>/cb`):
   `redirectToAuthorization` opens the system browser; a one-shot local HTTP
   listener captures the code; `auth()` exchanges it (PKCE).
3. Client info + tokens (incl. refresh token) are stored per server-origin in
   `~/.config/agentgate/oauth.json` (0600, XDG-respecting; never in the
   project directory).

`agentgate auth status` / `agentgate auth logout <name>` round it out.

### Live scanning picks tokens up transparently

`fetchToolSurface` gains an optional `authProvider` (built from the token
store). Order of precedence per server: configured `headers` → cached OAuth
tokens → anonymous. On 401 with cached tokens the SDK refreshes
automatically; if refresh fails, the auth-hint error (0.21.1) says
`run agentgate auth login <name>` instead of only suggesting headers.

### CI stays static

Docs recommendation stays: mint a service token and pass it via `headers`
with env interpolation. If a cached-token file is present on a runner it
works, but `agentgate ci` never initiates the interactive flow — a 401 there
keeps failing fast with the actionable error.

## Alternatives considered

- **Shell out to `mcp-remote` as an auth broker** — extra dependency, opaque
  token storage, and it solves proxying (stdio↔remote), not scanning.
- **Client-credentials only** — simpler but most hosted MCP servers today
  ship authorization-code + PKCE first; would not unlock GitHub MCP.
- **Do nothing** — comparison-page position ("remote live scanning") erodes
  as the hosted-server share grows.

## Effort & sequencing

1. Token store + provider + `auth login/status/logout` (cli), ~1 round.
2. `fetchToolSurface` authProvider wiring + 401 hint update (core), ~1 round.
3. e2e with a local OAuth-enabled fixture server (SDK ships server-side auth
   demo code), docs + comparison update, ~1 round.

No changes to lockfile format, rules, or output contracts.
