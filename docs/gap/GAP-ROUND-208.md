# GAP-ROUND-208 — bare `plugin.json` manifests (Open Plugin Spec first lookup)

## Face

The Open Plugin Spec / Copilot CLI plugin reference lists two manifest lookup
locations: `.plugin/plugin.json` (rounds 205–206) and a **bare `plugin.json` at the
plugin root**. Round-205 recorded the bare location as a boundary because the
filename is too generic to treat as a plugin root outright (Grafana panels, Obsidian
plugins, and many other ecosystems use `plugin.json`).

## Real-corpus evidence

- `microsoft/azure-skills` (official Microsoft plugin repo) uses a **repo-root
  `plugin.json`** with `"mcpServers": "./.mcp.json"` and `"hooks":
  "./hooks/copilot-hooks.json"` — the bare layout in the wild.
- `github/awesome-copilot` ships 130+ `plugins/<name>/plugin.json` **bare** manifests
  (no `.plugin/` dir); none currently declare `hooks`/`mcpServers` keys, so they must
  stay quiet.

## What changed

Shape-gated coverage instead of path-based matching (round-188 precedent):

1. **Discovery**: a bare `plugin.json` at the project root or in a walked plugin dir
   has its `mcpServers` field resolved through the existing manifest handler (inline
   object or plugin-root-relative path refs) — only when the key exists, so
   other-ecosystem manifests produce nothing.
2. **Classification**: the round-188 custom-path shape fallback now also extracts
   flat-event Copilot hooks (`event → [{ type: "command", bash/powershell/command }]`),
   so a bare manifest's inline hooks are classified by AG-SK-003. The `type:
   "command"` gate keeps npm-script-style `hooks: { build: "tsc" }` maps quiet.

## Corpus verification

- `microsoft/azure-skills`: still 3 servers, findings unchanged (root `.mcp.json`
  was already discovered; the manifest path-ref now resolves to the same file and
  dedupes).
- `github/awesome-copilot`: 0 new findings from 130+ bare manifests.
- Grafana/Obsidian-style fixtures (`{ id, main }`, `hooks: { build: "tsc" }`): quiet.

## Boundaries (recorded honestly)

- A bare manifest's inline `lspServers`/`monitors` are not extracted from the
  manifest itself (named-file locations still are); no wild example found.
- A bare-manifest plugin root does not mark sibling `skills/commands/agents`
  markdown as skill files unless an existing path shape matches (`SKILL.md` matches
  anywhere; `plugins/<name>/…` matches the marketplace layout).
- Sibling `.mcp.json` next to a bare nested manifest is only picked up via an
  explicit `mcpServers` path ref, not implicitly.

## Validation

- `pnpm build && pnpm lint && pnpm typecheck && pnpm test`: green
  (core 298 / cli 47 / config-convert 24).
- Self-scan: 18 findings (unchanged).
