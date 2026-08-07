# mcp-agentgate

**Scan, lock, and gate your MCP servers — `npm audit` + lockfile + CI drift gate for the MCP era.**

[![CI](https://github.com/wookat/agentgate/actions/workflows/ci.yml/badge.svg)](https://github.com/wookat/agentgate/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/mcp-agentgate)](https://www.npmjs.com/package/mcp-agentgate)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/wookat/agentgate/blob/main/LICENSE)

```bash
npx -y mcp-agentgate scan
```

Requires Node.js >= 22. Full documentation: <https://agentgate.zalize.com>

## What it does

- **`agentgate scan`** — audit every MCP server your clients (Claude Desktop / Claude Code / Cursor / VS Code / Codex / OpenCode / Windsurf / Cline / Gemini CLI / Kiro / Roo Code / Zed / Continue.dev / Amp / Warp / LM Studio / Trae) are configured to use; config paths are discovered automatically. Rules cover tool poisoning, credential leaks, overprivileged capability combos, missing auth, SSRF, RCE vectors, and supply-chain launch patterns. Configured server packages are cross-checked against [OSV.dev](https://osv.dev) known-malware advisories and the [AgentGate MCP advisory database](https://agentgate.zalize.com/advisories/) (bundled for offline use, refreshed from the live advisory API when online). Add `--live` to also connect to servers — stdio and remote (Streamable HTTP, with SSE fallback) — and audit their live tool surface (asks before starting stdio servers; `--yes` in CI).
- **`agentgate lock` / `diff` / `ci`** — pin the tool surface your agent sees — and optionally every agent skill/instruction file (`lock --skills`) — to a SHA-256 lockfile (`agentgate.lock`), then gate on drift: any changed tool name, description, schema, or pinned skill file fails CI (rug-pull protection).
- **`agentgate deps`** — hallucinated-dependency (slopsquatting) detection: flags dependencies that don't exist on the registry, typosquats, and known-malicious packages.
- **`agentgate config convert`** — convert MCP server configs between client formats (Cursor ↔ VS Code ↔ Claude ↔ Codex ↔ OpenCode).
- **`agentgate auth`** — log in to OAuth-protected remote (`url`) MCP servers (`auth login <name|url>`, OAuth 2.1 + PKCE, opens a browser once); tokens are cached per server origin outside the project tree and picked up automatically by live scans. `auth status` / `auth logout` manage saved logins. Static `headers` in the server config always take precedence; CI stays non-interactive.
- **`agentgate advisory`** — query the [MCPA advisory database](https://agentgate.zalize.com/advisories/) from the terminal: `advisory check <pkg>[@version]` exits 1 on a match (usable as a pre-install gate), `advisory list` shows the whole database; live API with bundled offline fallback, `--json` for scripting.

## Quick start

```bash
agentgate scan                                  # static config analysis, terminal table
agentgate scan --live                           # + live tool-surface audit
agentgate scan --format sarif -o report.sarif   # for GitHub code scanning
agentgate lock                                  # write agentgate.lock
agentgate lock --skills                         # also pin skill/instruction files (lockfile v2)
agentgate ci --fail-on high                     # CI gate: drift OR high-severity findings → exit 1
agentgate deps                                  # scan project dependencies for slopsquatting
agentgate advisory check mcp-remote@0.1.10      # ask the MCP advisory DB about one package
```

Exit codes: `0` clean, `1` gate failure (drift / findings at `--fail-on`), `2` usage or environment error.

## Links

- Documentation: <https://agentgate.zalize.com>
- Advisory database: <https://agentgate.zalize.com/advisories/>
- Source & issues: <https://github.com/wookat/agentgate>
- Rule reference: <https://agentgate.zalize.com/docs/rules/>
