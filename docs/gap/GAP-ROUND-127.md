# GAP-ROUND-127 — Amazon Q named custom agents (deferred item from round 126)

Date: 2026-08-07 · Round type: coverage completion

## Gap (recorded honestly in GAP-ROUND-126)

Amazon Q CLI's primary MCP configuration mechanism is now *named custom
agents* (the legacy mcp.json is opt-in via `useLegacyMcpJson`): per-agent
JSON files with a top-level `mcpServers` map, at

- global `~/.aws/amazonq/cli-agents/*.json`
- workspace `.amazonq/cli-agents/*.json`

(aws/amazon-q-developer-cli docs: agent-file-locations.md, agent-format.md;
the repo's own issue #2779 confirms these two paths as canonical.)
Round 126 only covered the legacy/IDE files, so a rogue MCP server smuggled
into an agent file was invisible.

## What shipped

- Directory globbing (same pattern as Continue.dev workspace blocks):
  every `cli-agents/*.json` in both scopes is discovered as client
  `amazonq` and parsed as standard `mcpServers-json` (agent files without
  an `mcpServers` field parse to zero servers, harmless).
- Test: global reviewer agent + workspace dev agent both discovered,
  non-JSON files ignored, servers parse (stdio + remote url).
- FAQ client-path list updated.

## Evidence

- Full suite green: core 208, cli 47, config-convert 23.
