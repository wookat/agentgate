# OpenSSF Best Practices Badge — self-assessment (passing level)

Self-assessment against the [passing criteria](https://www.bestpractices.dev/en/criteria/0),
prepared 2026-08 for submission to https://www.bestpractices.dev. Statuses:
**Met** / **Unmet** (with owner) / **N/A**. Re-verify each row at submission time.

## Basics

| Criterion | Status | Evidence / action |
|---|---|---|
| `description_good` — describes what the software does | Met | README.md intro + scan/lock/gate/advise table |
| `interact` — how to obtain, provide feedback, contribute | Met | README quickstart, SUPPORT.md, CONTRIBUTING.md |
| `contribution` — contribution process documented | Met | CONTRIBUTING.md (PR #16) |
| `contribution_requirements` — code contribution requirements | Met | CONTRIBUTING.md: tests, lint, spec-in-same-PR |
| `floss_license` / `license_location` — OSI license in LICENSE | Met | Apache-2.0 in /LICENSE |
| `documentation_basics` — basic user docs | Met | README + docs site https://agentgate.zalize.com (route B) |
| `documentation_interface` — external interface docs | Met | CLI `--help`, docs/spec/ (lockfile schema, config-convert contract) |
| `sites_https` — project sites use HTTPS | Met | GitHub + agentgate.zalize.com (Cloudflare) |
| `discussion` — searchable discussion mechanism | **Unmet** | Enable GitHub Discussions (repo settings — owner action, see checklist) |
| `english` — English supported | Met | English-first docs |
| `maintained` | Met | Active development, weekly triage commitment in SUPPORT.md |

## Change control

| Criterion | Status | Evidence / action |
|---|---|---|
| `repo_public` / `repo_track` / `repo_distributed` | Met | Public GitHub repo, full history, git |
| `repo_interim` — interim versions available | Met | main branch + from-source install documented |
| `version_unique` / `version_semver` | Met | semver, `packageManager` pinned; publish prep in PR #11 |
| `version_tags` — releases tagged | Met | `v0.1.0` tagged and released (2026-08-04) |
| `release_notes` — human-readable release notes | Met | https://github.com/wookat/agentgate/releases/tag/v0.1.0 (template in .github/release.yml) |
| `release_notes_vulns` — vulns identified in release notes | Met (policy) | Committed in SECURITY policy; applies from first advisory |

## Reporting

| Criterion | Status | Evidence / action |
|---|---|---|
| `report_process` / `report_tracker` | Met | GitHub issues with templates (PR #16) |
| `report_responses` — respond to majority of bugs (past 2–12 mo) | Met | All issues to date triaged |
| `enhancement_responses` | Met | Feature template + roadmap label |
| `report_archive` — archive of reports | Met | GitHub issues |
| `vulnerability_report_process` — how to report vulns | Met | SECURITY.md (landed): private reporting link, 48h ack / 7d fix commitment |
| `vulnerability_report_private` — private reporting supported | **Unmet** | SECURITY.md links GitHub private vulnerability reporting — the repo setting must still be enabled (owner action, checklist #3) |
| `vulnerability_report_response` — response ≤ 14 days | Met (policy) | Committed in SECURITY.md once landed |

## Quality

| Criterion | Status | Evidence / action |
|---|---|---|
| `build` / `build_common_tools` | Met | `pnpm build` (tsc), standard tooling |
| `build_floss_tools` | Met | Node/pnpm/tsc all FLOSS |
| `test` — automated test suite | Met | vitest across workspace, run in CI (ci.yml) |
| `test_invocation` — standard way to run tests | Met | `pnpm test` |
| `test_most` / `test_continuous_integration` | Met | CI on every PR; coverage gate ≥80% is route A MATURITY item |
| `test_policy` / `tests_are_added` — tests for new functionality | Met | CONTRIBUTING.md + PR template checkbox |
| `tests_documented_added` | Met | CONTRIBUTING.md |
| `warnings` / `warnings_fixed` — warning flags enabled | Met | ESLint + `tsc --noEmit` in CI, zero-warning baseline |
| `warnings_strict` | Met | TypeScript strict mode |

## Security

| Criterion | Status | Evidence / action |
|---|---|---|
| `know_secure_design` / `know_common_errors` | Met | Project is a security tool; threat model doc is route B MATURITY item |
| `crypto_published` / `crypto_call` / `crypto_floss` | N/A → Met | Only sha-256 hashing via Node `crypto` for lockfile pinning |
| `crypto_keylength` / `crypto_working` / `crypto_weaknesses` | Met | SHA-256; no broken algorithms |
| `crypto_password_storage` | N/A | No password storage |
| `crypto_random` | N/A | No security-relevant randomness |
| `delivery_mitm` — MITM-resistant delivery | Met | `mcp-agentgate@0.1.0` published on npm over HTTPS |
| `delivery_unsigned` | Met | npm integrity hashes |
| `vulnerabilities_fixed_60_days` | Met (policy) | No known vulns; ≤60d commitment in SECURITY.md |
| `vulnerabilities_critical_fixed` | Met (policy) | Same |
| `no_leaked_credentials` | Met | GitGuardian check on every PR |

## Analysis

| Criterion | Status | Evidence / action |
|---|---|---|
| `static_analysis` | Met | ESLint + typescript-eslint + tsc strict in CI |
| `static_analysis_common_vulnerabilities` | Met | GitGuardian secrets scanning; CodeQL recommended (owner enable — checklist) |
| `static_analysis_fixed` | Met | Zero-error CI gate |
| `static_analysis_often` | Met | Every PR |
| `dynamic_analysis` | Met (suggested-level) | Test suite exercises real config parsing/conversion; fuzzing not yet (suggested criterion only) |
| `dynamic_analysis_fixed` | Met (policy) | Standard bug process |

## Owner-action checklist (needs GitHub/bestpractices.dev account — total lead)

1. **bestpractices.dev**: sign in with the `wookat` GitHub account → "Add project"
   → select `wookat/agentgate` → paste the statuses above into the form → save.
   Badge markdown to add to both READMEs once a project ID is issued:
   `[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/<ID>/badge)](https://www.bestpractices.dev/projects/<ID>)`
2. **Repo settings → General → Features**: enable *Discussions* (fixes `discussion`).
3. **Repo settings → Security**: enable *Private vulnerability reporting* and
   *Dependabot alerts* (pairs with SECURITY.md; fixes `vulnerability_report_private`).
4. **Repo settings → Code security**: enable *CodeQL default setup* (strengthens
   `static_analysis_common_vulnerabilities`).
5. ~~At v0.1.0: push tag, publish GitHub Release with notes~~ — done 2026-08-04
   (`version_tags`, `release_notes` now Met).
6. ~~Re-check vulnerability rows after SECURITY.md merges~~ — SECURITY.md landed;
   `vulnerability_report_process` now Met. Submit the form.

Remaining Unmet items (`discussion`, `vulnerability_report_private`) are covered by
owner actions #2 and #3 above — after those plus the bestpractices.dev submission,
the project meets 100% of passing criteria.
