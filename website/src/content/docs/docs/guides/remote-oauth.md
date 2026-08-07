---
title: OAuth for remote servers
description: Log in to OAuth-protected hosted MCP servers with agentgate auth login so live scans and lockfiles cover them — no tokens in your repo.
---

Hosted MCP servers increasingly require OAuth instead of static API tokens.
`agentgate auth` runs the standard OAuth 2.1 authorization-code flow (with
PKCE) against a remote (`url`) server, caches the tokens outside your project
tree, and live scans pick them up automatically.

```bash
agentgate auth login <server-name|url>   # opens your browser once
agentgate scan --live                    # uses the cached tokens
agentgate lock                           # pins the remote tool surface
```

## Logging in

```bash
# By configured server name (resolved from your discovered MCP configs):
agentgate auth login github

# Or directly by URL:
agentgate auth login https://example.com/mcp
```

The command discovers the server's authorization endpoints, registers a
client dynamically when the provider supports it, opens your system browser,
and finishes over a one-shot loopback callback on `127.0.0.1`. If the browser
can't be opened, the authorization URL is printed so you can visit it
manually.

For providers **without dynamic client registration**, pre-register an OAuth
app with the provider and pass its client ID:

```bash
agentgate auth login https://example.com/mcp --client-id <your-app-client-id>
```

## Where tokens live

Tokens are stored per server origin in
`~/.config/agentgate/oauth.json` (respecting `XDG_CONFIG_HOME`, or
`AGENTGATE_CONFIG_DIR` if set), with file mode `0600`. Nothing is written
into your project, so there is never a token to accidentally commit.

```bash
agentgate auth status          # list saved logins and token expiry
agentgate auth logout <name>   # remove a server's saved tokens
```

## How live scans use credentials

For each remote server, live scans (`scan --live`, `lock`, `diff`, `ci`) pick
credentials in this order:

1. **Static `headers` in the server config** — always win when present.
2. **Cached OAuth tokens** from `agentgate auth login`, matched by origin.
3. **Anonymous** — public servers need no credentials.

Expired access tokens are refreshed transparently when the provider issued a
refresh token. If the cached tokens are rejected outright, the scan reports
an actionable error suggesting `agentgate auth login <name>` — it never opens
a browser on its own.

## CI stays non-interactive

`agentgate ci` (and every scan) will never start a browser flow. For CI,
either configure a static token under `headers` in the server config (via a
secret-injected environment file) or provision the token store ahead of time
on the runner. A missing or rejected credential fails loudly with the exact
next step.
