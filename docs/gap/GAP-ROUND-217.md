# GAP-ROUND-217 — advisory sweep: three new MCPA entries

## Sweep (real run, no fabricated data)

`node api/scripts/watch.mjs` (WATCH_DAYS=30) against GHSA/OSV surfaced three uncovered
public advisories; all three were verified against the primary sources and ingested:

- **MCPA-2026-0018** — n8n-MCP cross-tenant access to workflow version backups in
  multi-tenant HTTP deployments (CVE-2026-54052 / GHSA-j6r7-6fhx-77wx, critical,
  CVSS 9.9, npm `n8n-mcp` fixed 2.56.1). Snapshots include full node definitions with
  credential references and authorization headers → type `credential-leak`.
- **MCPA-2026-0019** — n8n-MCP incorrect authorization exposes default-scope workflow
  version backups in multi-tenant HTTP mode (CVE-2026-55608 / GHSA-2cf7-hpwf-47h9,
  medium, CVSS 4.2, npm `n8n-mcp` fixed 2.57.4).
- **MCPA-2026-0020** — HKUDS nanobot improper access controls in the MCP `enabledTools`
  scope handler (CVE-2026-19244 / GHSA-qwp6-wxvx-2jc8, PyPI `nanobot-ai` fixed 0.3.0,
  type `overprivileged`). GHSA carries no package mapping; the PyPI name `nanobot-ai`
  was independently confirmed (HKUDS nanobot README, versions ending at 0.3.0 matching
  the advisory's fix statement; PyPI `nanobot` is an unrelated robotics package).
  Severity recorded as `low` per GitHub's label (CVSS v4 2.0); the CVSS v3.1 4.7 vector
  is included for reference.

## Consistency

- `advisories/` (34 files) → `node api/scripts/validate.mjs` all valid.
- `api/src/data.json` rebuilt via `node api/scripts/build-data.mjs` (34).
- Core bundled DB rebuilt via `node packages/core/scripts/bundle-advisories.mjs` (34).
- End-to-end: `agentgate advisory check n8n-mcp -e npm` → MCPA-2026-0018/0019 (+ existing
  0002); `agentgate advisory check nanobot-ai` → MCPA-2026-0020.

## Honest boundaries

- Nanobot's affected range is recorded as `introduced 0, fixed 0.3.0` per the advisory's
  "upgrading to 0.3.0 is sufficient"; the interim 0.2.2 release has no public fix claim.
- The two n8n-mcp entries only fire for deployments configured through scanned MCP
  configs referencing the npm package; server-side multi-tenant HTTP deployment mode
  cannot be detected from client configs.

## Validation

- `pnpm build` / `pnpm lint` / `pnpm typecheck` green.
- Tests: core 317, cli 47, config-convert 24 — all green.
- Self-scan: 19 findings — unchanged.
