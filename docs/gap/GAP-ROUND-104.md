# GAP-ROUND-104 — Docs walkthrough: stale client lists + remote-server troubleshooting

Date: 2026-08-07 · Round type: docs UX walkthrough

## What was found (real walkthrough of the production docs)

After 0.21.0 shipped remote live scanning, a page-by-page docs walkthrough
found real drift:

1. **Stale client lists.** Auto-discovery covers 15 named clients plus the
   generic `.agents/.mcp.json` convention (verified against
   `packages/core/src/discovery.ts`), but:
   - FAQ and Troubleshooting still listed only the original 6 clients;
   - quick-start listed 9;
   - README/cli README listed 12 (missing Continue.dev, Amp, Warp).
2. **No remote-server troubleshooting.** The troubleshooting guide had a
   stdio timeout section only; nothing for the new
   `live scan skipped for "…"` failures on `url` servers (401/403 tokens,
   egress).
3. **FAQ safety answer incomplete.** "Does it execute server code?" didn't
   mention that `--live` now also contacts remote endpoints.

## Fix (docs only)

- FAQ, Troubleshooting, quick-start, README, packages/cli/README: client
  lists updated to the full current set.
- Troubleshooting: new remote (`url`) section — 401/403 → `headers` snippet
  (OAuth unsupported), egress notes, read-the-server-response-first advice.
- FAQ safety answer now covers remote contact alongside stdio spawning.

## Verification

- Client list cross-checked against `discovery.ts` push calls (15 named +
  `agents` + project-scoped `unknown` mcp.json).
- `pnpm --filter website build` green (63 pages).

## Remaining

- Homepage hero lists 13 named clients (omits OpenCode/Codex wording nuance)
  — cosmetic, revisit in the next website visual round.
