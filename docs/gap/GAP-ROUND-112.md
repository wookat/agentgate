# GAP-ROUND-112 — docs walkthrough: auth command reference + drift catch-up

Date: 2026-08-07 · Round type: docs/UX walkthrough

## Gap found (real walkthrough)

After 0.23.0, `agentgate auth` was the only top-level command without a CLI
reference page — the sidebar listed scan/lock/diff/ci/deps/advisory/config
convert but not auth; the FAQ had no "how do I scan a server that requires
login" entry; quick-start and the homepage lock card didn't mention OAuth at
all. A new user landing on the docs had no path from "401" to `auth login`
except the troubleshooting page.

## What shipped

- New `/docs/cli/auth/` reference (login/status/logout, options table
  verified against `--help` output, token storage, scan precedence), added
  to the sidebar.
- FAQ: new "How do I scan a remote server that requires login?" entry.
- Quick-start: one-line pointer to the OAuth guide after `scan --live`.
- Homepage lock card mentions `agentgate auth login` for OAuth servers.
- Website builds clean (65 pages).

## Not claimed

- No behavior changes; pure docs. No changeset.
