# GAP-ROUND-236 — Factory Droid plugin surface (2026-08-08)

Round type: close the round-232 boundary — Factory Droid plugins and marketplaces
(`enabledPlugins`/`extraKnownMarketplaces` were seen in the wild but not modeled).

## Official semantics verified

- docs.factory.ai `harness/plugins`: plugins carry `skills/`, `commands/`, `droids/`,
  `hooks/hooks.json`, and a bare `mcp.json` at the plugin root; metadata lives in
  `.factory-plugin/plugin.json`. Claude Code plugin layouts are auto-translated.
  `${DROID_PLUGIN_ROOT}` / `${CLAUDE_PLUGIN_ROOT}` expand to the plugin cache path.
- docs.factory.ai `enterprise/internal-plugin-marketplaces`: marketplaces are Git repos
  with `.factory-plugin/marketplace.json`; org settings use `extraKnownMarketplaces` +
  `enabledPlugins` (same schema as Claude Code / Copilot CLI settings).

## Changes

1. **Discovery**: `.factory-plugin/` joins the plugin-meta dirs — plugin roots found at
   any depth (≤4); Factory plugins' bare sibling `mcp.json` enters the server list;
   `${DROID_PLUGIN_ROOT}` path refs in manifests resolve; `.factory-plugin/marketplace.json`
   inline `mcpServers` entries are parsed like Claude marketplaces.
2. **AG-SK-003**: plugin manifests and marketplace catalogs under `.factory-plugin/`
   run the existing inline-hook classifier (`hooks/hooks.json` at plugin roots was already
   covered by the generic pattern).
3. **AG-SC-001**: `.factory/settings.json` (and `.local`) `enabledPlugins` from mutable
   `extraKnownMarketplaces` sources reported, sharing `checkClaudeMarketplaces`.
4. Scanner walks `.factory-plugin/` trees.

## Real-corpus verification

| Repo | Result |
| --- | --- |
| Factory-AI/factory-plugins (official marketplace, 8 plugins) | discovered, 0 servers (skills-only) — 0 FP |
| Factory-AI/cursed-plugins (dual `.factory-plugin`+`.claude-plugin`) | 0 FP |
| MeroZemory/oh-my-droid (plugin root w/ `.mcp.json` + `${DROID_PLUGIN_ROOT}` bridge) | 2 servers discovered; findings unchanged vs pre-round baseline |
| backnotprop/plannotator, nyldn/claude-octopus | findings identical to pre-round rules (no new-surface FP) |

Fixture TPs: bare `mcp.json` sibling discovery, marketplace inline servers,
`${DROID_PLUGIN_ROOT}` path refs, mutable-marketplace settings finding, inline plugin/
marketplace hook classification (curl|sh, irm|iex).

## Checks

- tests 346/47/24 all green; lint/typecheck green; self-scan 21 (unchanged).

## Boundaries (honest)

- `strictKnownMarketplaces` allowlists not interpreted (defensive control, not a risk signal).
- Plugin `droids/*.md` model/tool frontmatter risk not classified beyond existing AG-SK-001
  text scanning.
- Installed-plugin caches (user machine state) out of repo scope, as with Goose permissions.
