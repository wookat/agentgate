# GAP-ROUND-126 — Amazon Q Developer: MCP configs + project rules

Date: 2026-08-07 · Round type: coverage expansion (client 18 → 19)

## Gap found

Amazon Q Developer (IDE + CLI) is a major agent with both surfaces we
gate, and we covered neither:

- MCP configs (AWS official docs, mcp-ide.html + the Q CLI MCP blog):
  global `~/.aws/amazonq/mcp.json` and `~/.aws/amazonq/default.json`
  (IDE agent config; carries a top-level `mcpServers` map), workspace
  `.amazonq/mcp.json` and `.amazonq/default.json`.
- Project rules (docs.aws.amazon.com context-project-rules.html):
  Markdown files in `.amazonq/rules/`, subdirectories allowed —
  automatically loaded as chat context for every developer in the
  project. Verbatim instruction injection, same class as rounds
  118/121/122/123/125.

## What shipped

- Discovery: 4 new locations (client id `amazonq`), standard
  `mcpServers-json` parsing; 18 → 19 clients.
- `SKILL_FILE` matches `.amazonq/rules/**.md`; `.amazonq` added to the
  walked agent dot-dirs; `lock --skills` pins the rules automatically.
- Tests: global/project discovery fixtures; poisoned rules (root +
  subdir) report AG-SK-001 critical, benign S3-encryption rule reports
  nothing.
- Docs: client lists (README ×4, cli README, FAQ, troubleshooting,
  scan reference, quick-start, homepage) + skills guide.

## Deliberately NOT added (honest)

- `~/.aws/amazonq/cli-agents/*.json` and `agents/*.json` (named custom
  agents): per-agent JSON with `mcpServers` — needs directory globbing
  of agent files; deferred, noted here rather than half-shipped.
- Global `~/.aws/amazonq/rules` is not documented as a rules location;
  only project rules exist officially.

## Evidence

- Full suite green: core 207, cli 47, config-convert 23; website 65 pages.
