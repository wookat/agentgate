# GAP-ROUND-15 — `config convert` default-path auto-discovery

Round type: maintenance follow-up. Closes the gap recorded in GAP-ROUND-13:
`config convert` required an explicit `--in` even though every supported client
has a well-known config location.

**Fix**: when `--in` is omitted and stdin is a terminal, the source client's
config is auto-discovered at its default location — project-level first
(`.cursor/mcp.json`, `.vscode/mcp.json`, `.mcp.json`, `opencode.json`), then
user-level (reusing core's `knownConfigLocations`, so per-OS paths match
`scan`'s discovery exactly). The resolved path is echoed to stderr. Piped
stdin still wins; a missing default gives a readable exit-2 error.

Validation (real TTY via `script`): `config convert --from cursor --to codex`
inside a project with `.cursor/mcp.json` reads and converts it;
`--from codex` with no codex config errors clearly. 26 CLI tests green.

## Remaining known gaps

- Advisory API worker deployment (route B).
- Curated advisory DB freshness = release cadence.
