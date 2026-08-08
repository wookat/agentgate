# GAP-ROUND-267 — Advisory sweep (window 2026-07-27..08-03)

Date: 2026-08-03. Routine advisory sweep (previous: round 261). Database
74 → 77.

## GHSA vulnerability sweep

`api/scripts/watch.mjs` (8-day window) surfaced 3 GHSA advisories not in the
database. All 3 fail the package-mapping bar and are recorded in
`advisories/watch-ignore.json`:

- `GHSA-fjwc-rc47-268g` (CVE-2026-19266): Kirachon context-engine git-diff
  command injection. The project's package.json names
  `context-engine-mcp-server`, which is not published to npm; the npm and
  PyPI packages named `context-engine` are unrelated projects (verified via
  registry metadata).
- `GHSA-c8c4-xf97-vvc8` (CVE-2026-19263): INQUIRELAB mcp-bridge-api —
  rolling release, not in any registry (same bar as round 261).
- `GHSA-8cv7-xjpc-f5hw` (CVE-2026-19268): abdullah1854 MCPGateway —
  commit-ranged GitHub-only project, not in any registry.

## Malware namespace sweep

GitHub malware advisories published 2026-08-01..08-10 (1,324 entries) grepped
for MCP/agent-ecosystem names. Three ingested (all verified against the GHSA
description, OSV MAL entry, and the npm registry):

- **MCPA-2026-0061** `opencode-optimised-toolings` (GHSA-49cx-27xq-h4g2,
  MAL-2026-13452): malicious OpenCode *plugin* that silently replaces the
  user's `opencode` binary with a build from a non-publisher repo
  (github.com/anomalyco/opencode). GHSA flags 3.4.0/4.0.0/4.0.1 but the
  package is **still live on npm** (latest 6.2.0); the 6.2.0 tarball was
  unpacked and verified on 2026-08-03 to still ship the same self-patch
  pipeline (`packages/selfpatch/lib/pipeline.js` downloads
  `github.com/anomalyco/opencode/archive/...`), so the range is
  introduced:"0". This is exactly the surface rounds 165–167 model:
  opencode.json `plugin` npm specs are advisory-checked (AG-SC-002/003).
- **MCPA-2026-0062** `devplatform-react-mcp` (GHSA-mcm8-ccm7-f469,
  MAL-2026-13502): dropper disguised as a React MCP SDK; removed from npm.
- **MCPA-2026-0063** `agenthub-multiagent-mcp` (GHSA-gr2g-rx6h-9jh5,
  MAL-2026-13399): hardcoded C2 WebSocket drives Claude Code with
  `--dangerously-skip-permissions`; the worker is the package's core design,
  so introduced:"0".

Not ingested (honest scope): dependency-confusion squats of company-internal
names (@servicetitan/anvil2-mcp, @or-sdk/mcp-tools et al.) and generic
agent-named trojan apps users would not reference from MCP/agent configs
(remote-claude-daemon, claude-remote-agent, @cliphijack/santaclaude,
@guangnao/claude-cli, chatcc-agent, agenthub-ai, vanexa-agent variants…) —
these are app-level installs delegated to the live OSV malware check
(AG-SC-002/AG-DP-006 already match them when referenced).

## Validation

- `node api/scripts/validate.mjs`: 77 files valid.
- Bundled data rebuilt (`packages/core/src/advisories/data.ts`,
  `api/src/data.json`); advisory-count gate green after comparison page
  74 → 77.
- End-to-end: `advisory check` reports critical for
  opencode-optimised-toolings@6.2.0, agenthub-multiagent-mcp@1.57.0,
  devplatform-react-mcp@35.5.6.
- Full suite: `pnpm -r test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`,
  `git diff --check` green.

## Note for the maintainer

`opencode-optimised-toolings` is still installable from npm at 6.2.0 with the
binary-replacement behavior present. Consider reporting to npm security if
not already under review.
