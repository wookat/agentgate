# GAP-ROUND-103 — SSE fallback exercised end-to-end (closes a GAP-ROUND-99 test gap)

Date: 2026-08-07 · Round type: test coverage

## What was found

GAP-ROUND-99 recorded honestly: "SSE fallback is implemented per SDK semantics
but only exercised against the Streamable HTTP fixture; no SSE-only server was
regression-tested this round." Until now nothing proved the fallback path
actually completes a handshake against a legacy server.

## Fix

New core fixture `test/fixtures/toy-sse-server.mjs`: a legacy MCP SSE server
built on the official SDK's `SSEServerTransport` that *rejects* Streamable
HTTP (`POST /mcp` → 405, like real legacy servers), serves `GET /mcp` as the
SSE stream, and accepts client messages on `POST /messages?sessionId=…`.

New test in `live.test.ts`: `fetchToolSurface` against the fixture URL must
fail the Streamable HTTP attempt, fall back to SSE, complete the handshake,
and list the `echo` tool with its description.

## Verification

- live.test.ts 4/4 locally (the new test passes only via the SSE path — the
  fixture's 405 makes the primary transport unusable).
- No production code changed; test + fixture only, no changeset.

## Remaining

- Still no *public* SSE-only production server in the regression set; the
  local SDK-backed fixture is the strongest reproducible stand-in.
