# GAP-ROUND-99 — Remote MCP servers get live scanning + lockfile pinning

Date: 2026-08-07 · Round type: capability gap (real-world test driven)

## What was found (real evidence)

Remote MCP servers (`url` configs — the fastest-growing deployment style:
DeepWiki, GitHub MCP, Sentry, Linear, etc. all ship hosted Streamable HTTP
endpoints) were completely excluded from live analysis. Every remote server hit
this hard-coded branch in `gatherSurfaces`:

```
not a stdio server (remote transports are analyzed statically only)
```

Consequences, verified on a real config before the fix:

- `scan --live` skipped the server with a warning — tool poisoning in a hosted
  server's descriptions was invisible.
- `lock` exited 2 (`could not capture any tool surface; nothing to lock`) — no
  rug-pull protection at all for remote servers.
- `ci`/`diff` could not gate remote tool-surface drift.

This is exactly the gap competitors do cover (mcp-scan proxies remote servers),
and remote rug-pulls are *easier* than npm rug-pulls — the operator just changes
the hosted response, no package release needed.

## Fix

`packages/core/src/live.ts` — `fetchToolSurface` now picks a transport:

- `command` present → `StdioClientTransport` (unchanged behavior).
- `url` present → `StreamableHTTPClientTransport` first (current spec),
  falling back to `SSEClientTransport` for legacy remote servers; configured
  `headers` are passed via `requestInit` on both. The original Streamable HTTP
  error is reported if both fail.
- neither → explicit error.

`packages/cli/src/context.ts` no longer rejects `url` servers;
`packages/cli/src/commands/scan.ts` keeps spawn consent for stdio servers only
(remote servers are contacted without spawn consent — nothing runs locally), and
when consent is declined remote servers are still scanned.

## Verification (all real runs, built CLI)

Local e2e fixture (`toy-http-server.mjs`, official SDK
`StreamableHTTPServerTransport`, one transport per session):

- `scan --live` fetches the remote surface, no skip warning.
- `lock` pins the remote tool (`add`) in `agentgate.lock`.

Public production server `https://mcp.deepwiki.com/mcp`:

- `scan --live`: 0.28 s, surface fetched, 1 accurate finding (AG-AM-001 medium
  — no auth header configured), no warnings.
- `lock`: pinned 3 tools (`ask_question`, `read_wiki_contents`,
  `read_wiki_structure`).
- `ci --fail-on never` against that lockfile: `No drift` → exit 0.

Fixture debugging found two real SDK behaviors worth recording: stateless
`sessionIdGenerator: undefined` transports reject the *second* request
("Stateless transport cannot be reused across requests"), and a single stateful
transport rejects a second `initialize` ("Server already initialized") — the
fixture therefore creates one transport per session keyed by `mcp-session-id`,
which is the SDK's documented pattern.

Full checks: build/lint/typecheck green; tests 184 core + 40 cli (incl. 2 new:
neither-command-nor-url rejection, remote e2e) + 21 config-convert.

## Known limitations (honest)

- No OAuth flow: remote servers requiring interactive OAuth fail with an HTTP
  error; static `headers` (e.g. PAT bearer tokens) are the supported auth path.
  GitHub MCP (`api.githubcopilot.com/mcp`) returns 401 without a token — correct
  but unhelpful until we add token guidance (future round).
- SSE fallback is implemented per SDK semantics but only exercised against the
  Streamable HTTP fixture; no public SSE-only server was regression-tested this
  round.
- `scan` still reports AG-AM-001 for header-less remote servers even when the
  endpoint is intentionally public (documented rule behavior, not a new FP).
