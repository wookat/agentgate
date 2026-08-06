# GAP Report — Round 35 (`agentgate advisory` — query the MCPA database from the CLI)

## Gap

The MCPA database (28 entries) was only reachable indirectly: through a scan
of a configured client, the website, or raw API calls. There was no way to ask
the obvious question — "is this MCP server package known-bad before I add it
to my config?" — from the terminal. Competitors cover the analogous flow
(`osv-scanner` can query a single package; `npm audit` gates installs); we had
the data but not the entry point.

## Fixed

New `agentgate advisory` subcommand (`packages/cli/src/commands/advisory.ts`):

- `advisory check <pkg>[@version]` (`-e npm|pypi`, default npm) matches via
  the existing `matchMcpaAdvisories` engine; exit `1` on any match, `0` clean —
  usable as a pre-install gate. Without a version, ranged matches are marked
  "not version-confirmed" (same semantics as scan).
- `advisory list` prints the whole database as a table, newest-first.
- Both merge the live advisory API over the bundled DB (5s timeout), degrade
  to bundled with a stderr warning, and honor `--offline` and `--json`.
- Bundled subset now carries `published` (`McpaAdvisory.published`, optional),
  regenerated via `bundle-advisories.mjs`.
- Docs: README/package README quick starts, `docs/spec/cli-contract.md` gains
  the `advisory check --json` schema and exit-code contract.

## Verified

- 6 new CLI tests (`packages/cli/test/advisory.test.ts`, offline/deterministic);
  full suite 145 core + 33 cli, lint/typecheck/build green.
- Live: `advisory check mcp-remote@0.1.10` → MCPA-2025-0001 exit 1;
  `@0.1.16` clean exit 0; `flyto-core@2.26.2 -e pypi` → 4 matches;
  `@2.26.7` clean; `openai-mcp --offline` → MCPA-2026-0010 from bundled DB.

## Honest limits

- `check` accepts one package per invocation; no manifest-wide mode (that is
  `deps`/`scan`'s job).
- Ecosystem must be given for PyPI (`-e pypi`); no auto-detection.
