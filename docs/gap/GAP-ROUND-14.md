# GAP-ROUND-14 — advisory expansion + PEP 508 `==` pin parsing

Round type: maintenance (advisory database expansion, normalized per round 10+).

## New advisories (verified against the GitHub Advisory API)

- **MCPA-2026-0007** — `gemini-bridge` (PyPI MCP server bridging Claude Code to
  the Gemini CLI): arbitrary local file read via `consult_gemini_with_files`
  inline mode, CVE-2026-54785 / GHSA-c5px-58j2-7fqp, >=1.0.0 <1.3.1, medium.
- **MCPA-2026-0008** — `flyto-core` (PyPI MCP-native agent execution engine):
  arbitrary file write via `image.download` `output_dir` bypass,
  CVE-2026-67429 / GHSA-2956-977x-2w3r, <2.26.7, critical (CVSS 10.0).

Also surveyed but not added: MCP Ruby SDK CVEs (rubygems — not launchable via
the package runners `scan` inspects), Flowise SSRF bypass CVE-2026-69257
(already covered by MCPA-2026-0006's <=3.1.2/3.1.3 range for the same release
line), Langflow/ArcadeDB/BigQuery-MCP items (unreviewed or not
registry-launchable).

Database: 21 entries, schema-valid; bundled data regenerated.

## Bug found while validating (P1, fixed)

`serverPackageRef`/`isPinned` only understood npm's `name@1.2.3` pin syntax.
A PyPI server pinned the PyPI way — `uvx gemini-bridge==1.2.0` — was treated
as an *unpinned* package literally named `gemini-bridge==1.2.0`: the advisory
match missed entirely and AG-SC-001 gave nonsense advice
("pin gemini-bridge==1.2.0@1.2.3"). PEP 508 `==` specs now parse into
name+version: pinned-affected versions get the advisory severity, pinned-fixed
versions are clean, and `>=`-style range specs are still flagged unpinned.

## Remaining known gaps

- Curated DB freshness = CLI release cadence (advisory API worker is route B).
- PEP 508 range specs (`pkg>=1.0`) are flagged unpinned but their name isn't
  normalized for advisory matching (rare in real MCP configs).
