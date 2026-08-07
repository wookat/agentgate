---
title: agentgate auth
description: Manage OAuth logins for remote MCP servers — log in once in a browser, and live scans use the cached tokens automatically.
---

Manage OAuth logins for remote (`url`) MCP servers. See the
[OAuth guide](/docs/guides/remote-oauth/) for the full workflow.

```bash
agentgate auth login <server-name|url> [options]
agentgate auth status
agentgate auth logout <server-name|url>
```

## `auth login`

Runs the standard OAuth 2.1 authorization-code flow with PKCE: discovers the
server's authorization endpoints, registers a client dynamically when
supported, opens your system browser, and completes over a loopback callback
on `127.0.0.1`. Tokens are cached per server origin — one login covers every
server on the same host.

| Option | Description |
|---|---|
| `-c, --config <file>` | explicit MCP client config file (skips auto-discovery) |
| `-t, --timeout <ms>` | how long to wait for the browser callback (default `120000`) |
| `--client-id <id>` | pre-registered OAuth client ID, for providers without dynamic client registration |

The `<server>` argument is either a server name from your discovered MCP
configs or a URL directly. Stdio (`command`) servers are rejected with an
explanatory error — OAuth only applies to remote servers.

## `auth status`

Lists saved logins with their origin, expiry, and whether a refresh token is
present. Never prints token values.

## `auth logout`

Removes the saved OAuth state (tokens + client registration) for a server's
origin.

## Token storage

State lives in `~/.config/agentgate/oauth.json` (respects `XDG_CONFIG_HOME`;
override entirely with `AGENTGATE_CONFIG_DIR`), directory `0700`, file
`0600`. Nothing is written into your project tree.

## How scans use the tokens

Live scans (`scan --live`, `lock`, `diff`, `ci`) automatically use cached
tokens for matching origins, with this precedence: configured static
`headers` → cached OAuth tokens → anonymous. Scans never open a browser —
a rejected or unrefreshable token surfaces as an error suggesting
`agentgate auth login <name>`.
