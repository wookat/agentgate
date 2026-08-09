# GAP-ROUND-333 — Agent Plugins spec manifests (agent-plugins.org root plugin.json)

## Advisory window (routine check, honest zero)

- Automated GHSA/malware watch (`WATCH_DAYS=8`, authenticated): **no uncovered MCP-related advisories**.
- OSV exports unchanged since the r315 snapshots: npm ETag `"9f8ab64045409092a3a3c5dc6caf8bb7"`, PyPI ETag `"0006edede6e8963cd556edfff403bb89"`; npm MAL count 219,308, new-ID diff 0.
- Client version window: all nine tracked clients unchanged; goose v1.45.0, Codex rust-v0.147.0.

No advisory was added — nothing verifiable surfaced.

## Upstream semantics (openai/codex, verified in source)

Codex resolves plugin manifests by checking a **root-level `plugin.json`** before the
`.codex-plugin/`-style metadata directories. A root `plugin.json` whose `$schema` starts with
`https://agent-plugins.org/schemas/` is an **Agent Plugins spec** manifest — the portable
cross-client plugin format:

- Implicit component defaults resolve relative to the plugin root: `./skills`, and bundled MCP
  servers at **`./mcp.json`** (`DEFAULT_MCP_CONFIG_FILE`).
- Per-client overlays live under `extensions`; Codex applies the `com.openai` namespace as a
  legacy manifest (`apply_codex_agent_plugin_extension` copies `paths.apps`/`paths.hooks`), so a
  `hooks` overlay takes the same path/inline hooks-file forms covered in rounds 293/332.
- `apps` declarations were also inspected: they parse to `{ name, connector_id, category }`
  records (connector metadata only — no commands, prompts, or URLs), so no rule was added for
  them; inferring risk from the field name alone would be speculation.

## Gap

The scanner's plugin gates only recognized metadata-directory manifests
(`.claude-plugin/plugin.json` et al.) and marketplace source roots. A repo shipping only a root
Agent Plugins `plugin.json`:

1. was **not a plugin root** — its `skills/` (and other component/bin) trees were invisible to
   text scanning and `lock --skills` unless another convention happened to match;
2. its implicit bundled `./mcp.json` was never discovered for pin/advisory checks (except at the
   repo root, where generic discovery already caught it);
3. a malicious `extensions["com.openai"].hooks` inline hooks-file was invisible to AG-SK-003.

## Fix

- `scanner.ts`: `isPluginRoot` also accepts a root `plugin.json` whose `$schema` starts with the
  agent-plugins.org prefix (parsed, not filename-matched — generic `plugin.json` files such as
  Jenkins plugins never gate).
- `discovery.ts`: `pluginManifestServerLocations` treats an Agent Plugins manifest without an
  `mcpServers` field as declaring `./mcp.json` (path containment unchanged).
- `skill-poisoning.ts` (AG-SK-003): unwraps `extensions["com.openai"].hooks` on Agent Plugins
  manifests through the same inline/list hooks-file classifier.

## Wild-corpus evidence (exact counts)

GitHub code search: 160 root-level `plugin.json` files referencing `agent-plugins.org/schemas`.
13 repos cloned (github/awesome-copilot, saadeghi/daisyui, sickn33/agentic-awesome-skills +
10 root-manifest repos). Head-to-head vs published 0.67.9:

- `neondatabase/agent-skills`: **+5 previously invisible skill files** (0 findings — benign).
- `stbenjam/skillsaw` (a scanner-test project whose fixtures exercise the spec): **+3 files,
  +15 findings**, all inside `tests/fixtures/agent-plugins/*` — the implicit `mcp.json` fixtures
  now resolve end-to-end (AG-AM-001/AG-SC-001 on the fixture servers) and the inline-hooks
  fixture classifies critical. All hits verified true against the fixture intent.
- Remaining 11 repos: zero diff (their trees were already covered by co-present conventions).

Regression tests pin: Agent Plugins root gating (skills scanned + extension hook critical),
generic bare `plugin.json` never gates, implicit `./mcp.json` discovery for nested plugin roots,
and no discovery next to non-spec manifests.
