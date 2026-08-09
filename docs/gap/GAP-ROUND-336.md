# GAP-ROUND-336 — Agent Plugins v1.0.0 spec conformance verification (docs)

## Scope

Version window first: all nine tracked clients unchanged except cline
3.0.51 → 3.0.52 (tarball diff: only workspace-dependency bumps and a
schedules-doc README edit — no config-surface change). Codex checkout is at
upstream main tip with zero new core-plugins commits since r333. So this
round verifies the scanner head-on against the published Agent Plugins
v1.0.0 specification (agent-plugins.org, Working Draft; TSC: Amazon, Cursor,
Microsoft, OpenAI, Vercel), which rounds 333/334 modeled from the Codex
implementation rather than the spec text.

## Method

Built spec-exact fixtures straight from the normative examples and scanned
them end-to-end with the current build:

- root `plugin.json` with the canonical 1.0.0 `$schema` and closed manifest
  fields (§5);
- root `mcp.json` in the spec's closed-variant form (§7.2.1): required
  `$schema` + `mcpServers`, `type`-discriminated `stdio` /
  `streamable-http` / `sse` entries, plugin-relative `./bin/...` command,
  `${PLUGIN_ROOT}` / `${PLUGIN_DATA}` placeholders in `args`/`env`;
- `skills/<name>/SKILL.md` per the Agent Skills spec (§7.1), plus the
  agentskills.io frontmatter field list (`license`, `compatibility`,
  `metadata`, experimental `allowed-tools`).

## Results — full coverage, zero gaps found

- The `$schema`-gated root manifest activates the plugin gate: `skills/`
  markdown is text-scanned (poisoned SKILL.md → AG-SK-001 critical) and the
  implicit `mcp.json` is discovered.
- All three spec transports parse: unauthenticated `streamable-http`/`sse`
  remotes → AG-AM-001; `stdio` `npx` launches get pin (AG-SC-001) and
  advisory (AG-SC-002/003, verified with mcp-remote/mcp-echarts) checks;
  `${PLUGIN_ROOT}`/`${PLUGIN_DATA}` placeholders do not confuse extraction.
- A plugin-relative `./bin/...` command's bundled executable is scanned as
  exec surface (curl|sh body → AG-RC-001 critical) via the r326 bin/ gate.
- Spec-form handling was already pinned by regressions added in r333
  (scanner.test.ts / discovery.test.ts fixtures using the canonical
  `$schema`), so no new tests are needed.

## Boundaries (as-is, deliberate)

- §8.2 extension directories (top-level reverse-domain dirs like
  `com.example.client/hooks/`): the spec assigns them no portable semantics
  and Codex reads only manifest `extensions["com.openai"]` plus the
  `.codex-plugin/plugin.json` overlay (both covered). No shipping client
  reads a reverse-domain hooks directory today, so no rule is added — no
  fabricated semantics.
- §7.1 skills discovery is spec'd as immediate children of `skills/` only;
  we scan deeper descendants too. Additive visibility, kept intentionally.
- §6.1's closed component set (skills + MCP only) means `commands/agents/`
  in an Agent Plugins root have no spec semantics; our manifest-gated
  scanning of them (r319) tracks the Claude/Codex loaders, which do read
  them.

## Release backlog note

npm is at 0.67.9 while main has been versioned to 0.67.10 (#479, unpublished)
with three more patches pending; version PR #488 folds everything into
0.67.11 so one manual publish clears the backlog.
