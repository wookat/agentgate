# GAP-ROUND-238 — advisory routine sweep (last: round-235)

Date: 2026-08-08. Sources: GitHub Security Advisory GraphQL API (1,200 most recent
global advisories, covering published >= 2026-07-08 — the full 30-day window),
cross-checked against the 58 MCPA entries in the repo before this round.

## Added (58 → 69, MCPA-2026-0045..0055)

All verified against the original vendor GHSA (repo-level security advisory) and,
where present, the fix commit/release.

| ID | Package | Issue | Fixed |
|----|---------|-------|-------|
| 0045 | pypi/serena-agent | Unauthenticated Flask dashboard on fixed port 24282; DNS rebinding → agent memory poisoning → RCE (CVE-2026-49471, upstream fix commit 016ccbe + v1.5.2 release verified) | 1.5.2 |
| 0046 | npm/@prompty/core | gray-matter `---js` frontmatter executes JavaScript when loading .prompty files (CVE-2026-53597; affects only the 2.0 prerelease line, introduced 2.0.0-alpha.1) | 2.0.0-beta.3 |
| 0047 | pypi/prompty, npm/@prompty/core, nuget/Prompty.Core | `${file:...}` frontmatter reference expansion allows arbitrary file read (CVE-2026-53598). The Rust crate is also affected but rust is outside the schema's ecosystems — recorded here, not in packages. | 2.0.0b2 / 2.0.0-beta.2 |
| 0048 | npm/flowise | Unauthenticated OAuth2 token-refresh endpoint returns access tokens (CVE-2026-70478, critical) | 3.1.3 |
| 0049 | npm/flowise(+components) | CSV Agent prompt-injection → RCE (CVE-2026-70477, critical) | 3.1.3 |
| 0050 | npm/flowise(+components) | Pyodide validator Unicode-homoglyph bypass → RCE (CVE-2026-70470, critical) | 3.1.3 |
| 0051 | npm/flowise(+components) | SQLite Record Manager node RCE (CVE-2026-69259, critical) | 3.1.3 |
| 0052 | npm/flowise(+components) | TypeORM DataSource RCE (CVE-2026-69251, critical) | 3.1.3 |
| 0053 | npm/flowise(+components) | CSVAgent RCE (CVE-2026-69256, critical) | 3.1.3 |
| 0054 | npm/flowise(+components) | NodeVM sandbox escape via nodeVMOptions override (CVE-2026-69254, critical) | 3.1.3 |
| 0055 | npm/flowise | Unauthenticated TTS endpoint abuses private chatflow TTS credentials (GHSA-8gj2-2cvc-6xx7, no CVE yet; distinct fixed version 3.1.4) | 3.1.4 |

## End-to-end verification (real CLI, bundled DB)

- `serena-agent@1.5.1` hits 0045; `@1.5.2` clean.
- `@prompty/core@2.0.0-beta.1` hits 0046+0047; `@2.0.0-beta.3` clean. `prompty@2.0.0b1` (PyPI) hits 0047.
- `flowise@3.1.2` hits 12 (4 pre-existing + 8 new); `@3.1.3` hits only 0055; `@3.1.4` clean.
- 69/69 schema validation passes (`api npm run validate`), api tests pass, core bundle regenerated.

## Deliberately not added (honest exclusions)

- **Flowise 2026-08-04 high/medium remainder (~15 GHSAs)**: same `<= 3.1.2 → 3.1.3`
  window as the criticals already recorded — scanning flowise@<=3.1.2 already flags
  the package at critical. Backlog if per-CVE completeness is wanted.
- **n8n core batch (2026-07-22, ~24 GHSAs)**: npm/n8n is a self-hosted platform, not
  a package discoverable from MCP/agent client configs (same reasoning as Langflow in
  round-228); n8n-mcp (which IS config-discoverable) already covered (0018/0019 + round-235).
- **vLLM (5 GHSAs), LangGraph checkpoint stores, dd-trace-java**: serving/framework
  libraries outside the scan surface.
- **Go ecosystem (ToolHive, yutu, nebula-mesh, woodpecker) and RubyGems (MCP Ruby SDK
  ×2)**: out of schema ecosystems per the standing scope decision (expand only after
  the corresponding scan surface is modeled).
- **safeinstall-cli** (npm agent-guard tool, detection-gap advisory): not referenced
  from MCP/agent configs; noted as a watch item.

## Notes

- MCPA-2026-0055 has no CVE assigned yet; alias to be appended when GitHub assigns one
  (same convention as the Dynatrace batch in round-228).
