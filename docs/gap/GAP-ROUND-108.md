# GAP-ROUND-108 — OAuth round 1/3: `agentgate auth login/status/logout`

Date: 2026-08-07 · Round type: capability (per OAUTH-REMOTE-SCAN.md sequencing)

## What shipped

- `agentgate auth login <name|url>`: full OAuth 2.1 flow via the official
  SDK's `auth()` — RFC 8414 metadata discovery, RFC 7591 dynamic client
  registration (or `--client-id` for providers without it), PKCE,
  system-browser redirect, one-shot loopback callback on a random
  `127.0.0.1` port.
- `agentgate auth status` / `auth logout <name|url>`.
- Token store: `~/.config/agentgate/oauth.json` (XDG- and
  `AGENTGATE_CONFIG_DIR`-aware), file mode `0600`, keyed by server origin.
  Never in the project tree; nothing to commit.

## Verified (real runs)

- e2e test: a local, spec-shaped OAuth authorization server (metadata +
  registration + PKCE-verified token endpoint); the test plays the user
  agent following the 302 to the CLI callback. Full round trip persists
  access/refresh tokens; PKCE mismatch is rejected; store file is `0600`.
- Real endpoint: `auth login https://api.githubcopilot.com/mcp` fails with
  `does not support dynamic client registration — pre-register an OAuth app
  with the provider and pass its ID via --client-id` (GitHub's MCP AS
  advertises no registration endpoint). Honest, actionable; no fake success.
- Full suite green: 188 core / 44 cli / 21 config-convert.

## Not in this round (by design)

- Live scans do **not** pick up stored tokens yet — round 2/3 wires
  `fetchToolSurface` to an authProvider (headers → cached tokens →
  anonymous) and updates the 401 hint to suggest `agentgate auth login`.
- Docs/comparison updates land in round 3/3 with the e2e-complete feature.

## Caveat

- Providers that require pre-registered client IDs *and* fixed redirect
  URIs (no loopback wildcard) may reject the random-port callback; the
  error from the AS is surfaced verbatim. To be revisited with real
  provider evidence in round 3.
