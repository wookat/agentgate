# GAP-ROUND-150 — data checkpoint (rounds 141–149)

Date: 2026-08-08 · Round type: data checkpoint

## Shipping velocity

- 10 PRs merged (#236–#246, excl. version PRs), all ordinary feature
  branches, CI green before merge.
- 3 npm releases: 0.35.0 (rounds 141–144), 0.36.0 (145–146),
  0.37.0 (147–148) — each tagged, GitHub-released, and regression-
  tested from a clean npx cache.

## Coverage growth (all official-docs-verified, real-corpus-tested)

AG-SK-002 gained six checked-in agent permission surfaces:

| Surface | Rounds |
| --- | --- |
| OpenCode `permission` (incl. `websearch`, per-agent blocks) | 141–142 |
| Gemini CLI `tools.allowed` / `defaultApprovalMode` / `trust: true` | 143–144 |
| Roo Code `.roo/mcp.json` `alwaysAllow`/`autoApprove` | 145 |
| VS Code `chat.tools(.global).autoApprove` booleans | 146 |
| VS Code `chat.tools.terminal.autoApprove` per-command map | 147 |
| Zed `agent.always_allow_tool_actions` + `tool_permissions` | 148 |

## Quality data (honest)

- Real-corpus verification every round: true positives found in
  alumnium, telescope, kengp, dynamo-mcp, mcp-dotnet-samples,
  debbie.codes, remembrances-mcp; two real coverage gaps caught and
  fixed from corpus (websearch key, agent-level permission blocks).
- Round-149 FP sweep: microsoft/vscode, zed-industries/zed,
  TypeScript, react — 0 AG-SK-002 findings (vscode's own checked-in
  terminal.autoApprove map correctly clean).
- Tests 216→223 (core), 47 cli, 24 config-convert; self-scan baseline
  unchanged (155 files, 17 findings, ~0.22 s).
- Advisories: 31, consistent across repo / API / feed; advisory watch
  zero uncovered (checked rounds 148).
- Competitors: mcp-scan npm 2.0.2, invariant mcp-scan PyPI 0.4.3,
  socket 1.1.155 — no capability movement in the window.

## Adoption (unchanged concern)

- npm last-30-days downloads: 3,124 — still concentrated in our own
  activity windows. Distribution/marketing remains the top gap and is
  an owner-level decision.

## Ops note

- GitHub Actions deploy workflow skips Cloudflare deploys (no
  CLOUDFLARE_API_TOKEN secret in Actions); website deploys are done
  locally via wrangler. Round-150 caught a two-round staleness on the
  production rule docs because of this — flagged to owner.

## Next-round candidates

- VS Code `chat.tools.edits.autoApprove` glob map (only `true` on
  sensitive-file globs is dangerous; corpus so far only protective).
- Zed `mcp:<server>:<tool>` per-tool risk classification.
- Amazon Q `cli-agents` `allowedTools`/`toolsSettings` permission
  fields (not yet checked for over-permissioning).
