# GitHub Marketplace listing — AgentGate MCP Gate

Everything the repo can do is done: `/action.yml` sits at the repository root
(generated from `packages/action/action.yml`, drift-gated by
`scripts/check-action-sync.mjs`), with `name`, `description`, and `branding`
(shield / purple) set. The remaining steps require the repository **owner's
account** in the GitHub web UI:

1. Confirm the action name "AgentGate MCP Gate" is unique on the Marketplace
   (search https://github.com/marketplace?type=actions — rename in both
   `packages/action/action.yml` and the generated root copy if taken).
2. Ensure 2FA is enabled on the owner account (Marketplace requirement).
3. Draft a new release (or edit an existing one) at
   https://github.com/wookat/agentgate/releases/new — a "Publish this Action to
   the GitHub Marketplace" checkbox appears when a root `action.yml` with
   branding exists. Tick it, accept the GitHub Marketplace Developer Agreement
   (first time only).
4. Pick two categories — recommended: **Security** (primary), **Continuous
   integration** (secondary).
5. Publish the release. The listing goes live at
   https://github.com/marketplace/actions/agentgate-mcp-gate (slug derives from
   the action name).
6. After listing, verify `uses: wookat/agentgate@<tag>` resolves in a scratch
   workflow, then update README badges if desired
   (`https://img.shields.io/badge/Marketplace-AgentGate%20MCP%20Gate-blue`).

Maintenance rule: `packages/action/action.yml` is the source of truth; after any
edit run `node scripts/sync-root-action.mjs` (CI fails on drift). Marketplace
picks up changes at the next release tag.
