# GAP-ROUND-16 — offline coverage for MCP reference-server typosquats

Round type: maintenance (advisory database expansion).

## Gap

When the network is unavailable, the OSV-backed malware checks (AG-SC-002 /
AG-DP-006) degrade to a warning — and the bundled MCPA database contained no
malicious-package entries, so a fully offline scan missed even the most
MCP-specific malware: npm packages squatting the official reference server
names that MCP configs commonly launch via `npx mcp-server-*`.

## Fix

**MCPA-2026-0009** — the June 2026 campaign of ten unscoped npm packages
squatting official MCP reference servers (`mcp-server-fetch`, `-git`,
`-github`, `-figma`, `-notion`, `-postgres`, `-redis`, `-sentry`,
`-sequential-thinking`, `-supabase`), each with a postinstall/main/bin payload
exfiltrating host data to a hardcoded workers.dev endpoint (OSV
MAL-2026-5476..5485, source amazon-inspector). The legitimate servers live
under the `@modelcontextprotocol` scope or on PyPI, so every version of the
unscoped npm names is treated as malicious (package-wide range).

Verified: `npx -y mcp-server-github` config now reports AG-SC-003 critical
from the bundled DB (offline) in addition to the online AG-SC-002 hit.

Also swept GHSA 2026-08-02..05 for MCP-related advisories: ArcadeDB MCP
CVEs (Maven — not launchable via the package runners `scan` inspects) and the
Flowise SSRF bypass (same affected/fixed range as MCPA-2026-0006, already
matched) — none added.

## Remaining known gaps

- Bundled malware coverage is curated, not exhaustive — OSV online checks
  remain the primary malware source; the bundle is an offline backstop for
  MCP-specific campaigns.
- Advisory API worker deployment (route B).
