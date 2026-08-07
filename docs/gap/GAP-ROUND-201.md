# GAP-ROUND-201 — Copilot custom agent `mcp-servers` discovery

Date: 2026-08-08 · Round type: coverage (new surface)

## Official evidence

- GitHub Docs "About custom agents" / "Creating custom agents" /
  "Custom agents configuration": agent profiles are Markdown files with
  YAML frontmatter at `.github/agents/CUSTOM-AGENT-NAME.md` (repo level).
- The `mcp-servers` frontmatter property configures "additional MCP
  servers and tools that should be used by the custom agent" — a YAML
  form of the repo MCP JSON config; the `stdio` type maps to `local`.
- Entries carry `type`/`command`/`args`/`env`/`tools`, plus env/secret
  syntax `$VAR`, `${VAR}`, `${VAR:-default}`, `${{ secrets.X }}`,
  `${{ vars.X }}`.
- Copilot CLI and cloud agent both consume these profiles.

## What shipped

- Project discovery scans `.github/agents/*.md`; files whose frontmatter
  carries an `mcp-servers` map yield servers (client `copilot-agent`,
  new `agent-frontmatter-yaml` format) through the full config rule set
  and OSV/MCPA advisory checks, reusing the shared frontmatter extractor
  and `collectServers` normalizer.
- Profiles without `mcp-servers` are untouched (they already get skill
  scanning via the round-132 `.github/agents/*.md` surface).

## Surface / corpus evidence

- GitHub code search: 728 files matching `mcp-servers:` under
  `.github/agents/`.
- Real repos scanned (unmodified): spellshift/realm — profile declares a
  `custom-mcp` remote server behind `${{ secrets.TAVERN_URL }}` →
  AG-AM-001 low (unparseable URL, honest signal); github/gh-aw and
  lablup/backend.ai-webui mention `mcp-servers:` only in prose/fenced
  examples → correctly 0 findings.

## Boundaries (recorded, not modeled)

- Org/enterprise-level profiles (`.github`/`.github-private` repos) are
  covered only when that repo itself is scanned.
- `${{ secrets.X }}` values stay verbatim (placeholder-safe for
  AG-CL-001); repository-settings-level MCP config on GitHub.com is not
  a project-borne file and is out of scope.
- `tools` allowlists in profiles are not yet correlated (candidate).

## Validation

- Full suite green: core 280, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings, unchanged.
