# GAP Report — Round 64 (LudusMCP advisory + routine sweep)

## Routine sweep (2026-08-06, real runs)

- advisory watch (GHSA/OSV, 8 days): **one uncovered MCP advisory** —
  GHSA-5ccg-4qw3-g338 / CVE-2026-19045, LudusMCP ≤1.0.24 command injection
  in `SecretDialog.showSecretDialog` (`get_credential_from_user`), published
  2026-08-06, no fixed release. Verified against the GHSA API: npm package
  is `ludus-mcp`, latest is exactly 1.0.24 (vulnerable), CVSS 3.1 5.3.
- Competitors unchanged: socket 1.1.154, snyk-agent-scan 0.5.16,
  osv-scanner v2.4.0.
- Real GHA annotation verified in the live dogfood job on main
  (`##[notice]docs/assets/demo-mcp.json: Possible hardcoded secret…`).

## Fix

- New advisory `MCPA-2026-0015` (type `rce-vectors`, medium, range
  introduced 0 / last_affected 1.0.24 since no fix exists), schema-validated;
  bundled DB regenerated (28 → 29); comparison page count updated.

## Verified

- `advisory check ludus-mcp@1.0.24 --offline` → 1 match, exit 1;
  `ludus-mcp@1.0.25` → clean (no such release yet; range honesty check).
- Full checks green: build, lint, typecheck, 159 core + 36 cli + 12 convert.
