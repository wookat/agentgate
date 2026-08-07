# GAP-ROUND-102 — Actionable auth errors for remote live scanning

Date: 2026-08-07 · Round type: CLI UX (follow-up to GAP-ROUND-99 limitation)

## What was found (real evidence)

GAP-ROUND-99 recorded that token-protected remote servers fail with a raw
server error. Verified against the real GitHub MCP endpoint
(`https://api.githubcopilot.com/mcp`) before the fix:

```
live scan skipped for "github": Streamable HTTP error: Error POSTing to
endpoint: bad request: missing required Authorization header
```

Correct but unactionable: nothing tells the user *where* to put the token in
an AgentGate-scanned config. Worse, a 401/403 also triggered the SSE fallback
attempt — a second doomed request against an endpoint that already said the
credentials are missing/invalid.

## Fix

`packages/core/src/live.ts`: `StreamableHTTPError` with code 401/403 skips the
SSE fallback and rethrows with a hint —

- no `headers` configured → shows the exact snippet to add
  (`"headers": { "Authorization": "Bearer …" }`) and notes interactive OAuth
  flows are not supported;
- `headers` configured → names the rejected header key(s) (never values) and
  suggests checking token value/scope.

## Verification (real runs)

- GitHub MCP endpoint after the fix:
  `… missing required Authorization header — no auth headers are configured —
  add the required token under "headers" in the server config (e.g. "headers":
  { "Authorization": "Bearer …" }). Interactive OAuth flows are not
  supported.`
- New core tests with a local 401 HTTP server: no-headers hint and
  rejected-headers hint (header key named, value never echoed). live.test.ts
  5/5.
- Full suite green: build/lint/typecheck, tests 188 core / 41 cli / 21
  config-convert.

## Known limitations (unchanged)

- Interactive OAuth flows remain unsupported (static headers only) — now
  stated in the error itself.
- Servers that gate auth behind a non-401/403 response (as some proxies do)
  still surface the raw error.
