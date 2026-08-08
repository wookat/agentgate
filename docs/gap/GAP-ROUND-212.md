# GAP-ROUND-212 — docs catch-up: client-list drift

Recorded in GAP-ROUND-209/210 as an open boundary: the discovery client
lists in README/homepage/quick-start stopped at Amazon Q Developer while the
scanner gained Qwen Code (round 195), GitHub Copilot CLI (rounds 201–202),
and JetBrains Junie (round 209).

## What changed (docs only)

Added "Qwen Code, GitHub Copilot CLI, JetBrains Junie" to every *discovery*
client list:

- `README.md` — quick-start blurb, scan comment, cross-platform section.
- `packages/cli/README.md` — `agentgate scan` bullet (npm package page).
- `website/src/pages/index.astro` — homepage "Install" step.
- `website/src/content/docs/docs/quick-start.md`
- `website/src/content/docs/docs/guides/troubleshooting.md`

Deliberately NOT changed: the `config convert` supported-client list
(README + convert docs) — Qwen Code/Copilot CLI/Junie are not convert
targets; that list is accurate as-is.

Already current (updated in their own rounds): `docs/cli/scan.md` supported
clients, `guides/faq.md`, `guides/skills.md`.

## Validation

- `pnpm lint` green; website `astro build` green.
- No code changes; no changeset (docs/marketing copy only).

## Remaining drift (honest)

- OpenHands (round 211) is a skill/source face, not an MCP discovery client —
  correctly absent from these MCP client lists; it is documented in
  `guides/skills.md`.
- Comparison and introduction pages carry no per-client enumerations —
  verified, no drift there.
