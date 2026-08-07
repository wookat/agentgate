# GAP-ROUND-165 — OpenCode npm plugins are startup-executed supply chain (AG-SC-001)

Date: 2026-08-08 · Round type: coverage gap (official-docs-verified)

## Gap

OpenCode plugins (official docs, opencode.ai/docs/plugins): "npm
plugins are installed automatically using Bun at startup" from the
`plugin` array in `opencode.json` — arbitrary JS that hooks the agent
loop, fetched and executed on every launch for everyone who opens the
project. This is the same rug-pull surface AG-SC-001 already covers
for `npx pkg` MCP servers, but plugin specs were not checked at all.

## Change

`AG-SC-001.checkSource` handles `opencode.json`/`opencode.jsonc`:
each string entry in `plugin` that is an npm spec without an exact
pinned version reports medium (same severity and rationale as
unpinned server packages). Local plugin paths (`./…`, `*.ts`/`*.js`)
and URL specs are not treated as npm installs.

## Real corpus

- cemalturkcan/opencode-pair — example config with 5 unpinned npm
  plugins (opencode-pair, opencode-pty, @mohak34/opencode-notifier,
  @zenobius/opencode-skillful, @franlol/opencode-md-table-formatter):
  5 medium true positives.
- LokiMetaSmith/llama-cluster-upbringing-script,
  bonigarcia/context-engineering — `superpowers@git+https://…` git
  URL specs: skipped (URL specs are not npm installs; see boundary).
- alibaba/loongsuite-pilot — no plugin array: clean.
- GitHub code search: 4,832 opencode.json files mention "plugin";
  1,312 opencode.jsonc files.

## Honest boundaries

- `git+https://…` plugin specs without a commit pin are also
  mutable upstream code but are skipped in this round — flagging
  them needs a distinct message/remediation (pin `#<sha>`);
  candidate follow-up.
- Version ranges that npm would accept (e.g. `^1.0.0`) inside the
  spec report as unpinned, matching existing AG-SC-001 semantics.
- Plugin package names are not yet cross-checked against OSV/MCPA
  advisories (AG-SC-002/003 today only cover launched MCP server
  packages); candidate follow-up.

## Routine checks

- Advisory watch: no uncovered public MCP advisories in this sweep.
- Competitors: no relevant capability movement observed.

## Evidence

- Full suite green: core 239, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
