# GAP-ROUND-113 — auth login UX: headers-precedence warning

Date: 2026-08-07 · Round type: UX walkthrough

## Gap found (real walkthrough)

Credential precedence is headers → cached OAuth tokens → anonymous. A user
who runs `agentgate auth login <name>` against a server that *also* has
static `headers` in its config gets a successful login — and then live scans
silently keep using the (possibly stale) headers, never the fresh tokens.
Nothing at login time explained why the login "didn't work".

## What shipped

- `auth login <server-name>` prints a yellow warning when the resolved
  server config carries static headers, naming the header keys (values are
  never echoed) and explaining the precedence. URL-target logins are
  unaffected (no config entry to inspect).
- Test: config with `headers.Authorization` → warning naming the key.

## Perf spot-check (routine, real run)

- Self-scan (`scan .`, 0.23.0 worktree build): 0.21s, findings unchanged
  (dogfood baseline holds).

## Remaining gaps

- `auth status` could cross-reference discovered configs and flag origins
  shadowed by static headers; deferred until there's a real report — the
  login-time warning covers the confusing moment.
