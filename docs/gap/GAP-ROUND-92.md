# GAP-ROUND-92 — interpret `includeTools` on skill-declared servers

Date: 2026-08-07

## Gap (open since round-86)

Skill-declared MCP servers (round-86) parsed everything except
`includeTools`. Amp's manual documents it as a common field, "optional but
recommended": a tool-name/glob allowlist filtering which tools the server
exposes to the skill. A skill that omits it hands the agent the server's
*entire* tool surface — exactly the over-exposure our overprivileged
category exists for — and we said nothing.

## Fix

- `includeTools` is now parsed into `McpServerConfig` (string array,
  normalized in `normalizeEntry`, so both `mcp.json` and frontmatter forms
  carry it).
- AG-OP-001 reports **low** when a skill-declared server (`skill` /
  `amp-skill` client) has no non-empty `includeTools`. Non-skill clients
  are never flagged — the field is an Amp skill convention.
- Skills guide documents the new check.

Severity rationale: low — it is an over-exposure hygiene signal, not an
active compromise; the same server pinned and advisory-clean is still
usable, just broader than the skill needs.

## Evidence

- Rule tests: skill server without allowlist → low AG-OP-001; with
  allowlist → clean; cursor server without the field → clean.
- Full suite green locally (core 181 / cli 40 / config-convert 21).
- Routine sweep this round: advisory watch zero uncovered; competitors
  unchanged (mcp-scan 2.0.2, socket 1.1.154, snyk-agent-scan 0.5.16,
  osv-scanner v2.4.0).

## Still open (honest)

- `includeTools` globs are not matched against the live tool surface
  (that would require `--live` correlation of allowlist vs actual tools);
  today only presence/absence is interpreted.
- ChatGPT Desktop and Plandex conventions still unverified.
