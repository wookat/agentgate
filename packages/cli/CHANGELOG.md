# mcp-agentgate

## 0.16.0

### Minor Changes

- 1f0f015: Client config discovery now also covers Continue.dev: the global `~/.continue/config.yaml` and every workspace `.continue/mcpServers/*.yaml` block file (`mcpServers` YAML lists with `name`/`command`/`args`/`env`/`url`/`type`) — 13 clients total.
- f943c78: `config convert` supports `continue` (Continue.dev): parses the YAML `mcpServers` list from `~/.continue/config.yaml` or `.continue/mcpServers/*.yaml` blocks, and renders a standalone YAML block document (save under `.continue/mcpServers/` or merge into your config.yaml).

### Patch Changes

- Updated dependencies [1f0f015]
- Updated dependencies [f943c78]
  - mcp-agentgate-core@0.16.0
  - mcp-agentgate-config-convert@0.4.0

## 0.15.0

### Minor Changes

- 51ea55e: Lockfile v2: `agentgate lock --skills [dir]` additionally pins every agent skill/instruction file's SHA-256 (same file set skill scanning covers), and `agentgate diff` / `agentgate ci` fail with `skill-added` / `skill-removed` / `skill-changed` drift entries when pinned files change. Lockfiles without `--skills` keep being written as version 1; readers accept both versions.
- a9a1841: Client config discovery now also covers Kiro (`~/.kiro/settings/mcp.json` + project `.kiro/settings/mcp.json`), Roo Code (VS Code globalStorage `mcp_settings.json` + project `.roo/mcp.json`), and Zed (`context_servers` in `settings.json`, JSONC comments and trailing commas tolerated) — 12 clients total.
- a9a1841: `config convert` supports three more clients: `kiro` and `roo-code` (standard `mcpServers`) and `zed` (`context_servers` inside `settings.json`, JSONC comments/trailing commas tolerated on parse; output is a standalone `context_servers` document to merge into your settings).

### Patch Changes

- e52dea6: Bundled advisory database: add MCPA-2026-0015 — LudusMCP (npm: ludus-mcp) ≤1.0.24 command injection via the get_credential_from_user secret-dialog description (CVE-2026-19045, no fixed release yet).
- ffec128: Table output wraps long file paths in the Target column mid-word instead of truncating them with an ellipsis, so the full path is always visible (messages still wrap on word boundaries).
- 028f4a4: Under GitHub Actions, `agentgate ci` now emits one error annotation per lockfile drift entry (skill drift entries carry the changed file's path, so they land inline on the PR diff). The no-drift message now reads "locked surface" instead of "tool surface" since v2 lockfiles can also pin skill files.
- d27704d: Bundled advisory database: add MCPA-2026-0016 (LudusMCP `ludus_cli_execute` command injection, CVE-2026-19047) and MCPA-2026-0017 (LudusMCP `ludus_environment_guides_search` path traversal, CVE-2026-19046), both affecting npm `ludus-mcp` <= 1.0.24 (31 advisories total).
- Updated dependencies [e52dea6]
- Updated dependencies [51ea55e]
- Updated dependencies [028f4a4]
- Updated dependencies [d27704d]
- Updated dependencies [a9a1841]
- Updated dependencies [a9a1841]
  - mcp-agentgate-core@0.15.0
  - mcp-agentgate-config-convert@0.3.0

## 0.14.0

### Minor Changes

- 099f46a: Skill scanning (AG-SK-001/002/003) now covers Windsurf rules and workflows (`.windsurf/rules/`, `.windsurf/workflows/`, `.windsurfrules`), Cline rules (`.clinerules/` directory or file, `.cursorrules`), and Cursor rule files (`.cursor/rules/*.mdc`) — all executed verbatim as agent instructions, same threat class as skills.
- d6d45a9: Skill scanning covers Gemini CLI custom commands (`.gemini/commands/**.toml`): prompt text is checked for hidden Unicode and injection patterns, and `!{...}` shell-injection blocks are analyzed like skill dynamic-context commands (AG-SK-003) — `curl | sh`, data exfiltration, and credential reads are flagged.

### Patch Changes

- b233367: AG-SK-001: a bare `<instructions>` or `<important>` tag in a skill file is reported at `low` instead of `critical` — skill files are instructions, so these tags are common prompt-template structure there, not a concealment channel. They stay `critical` in tool descriptions, `<system>`/`<secret>`/`<hidden>` stay `critical` everywhere, and a suspicious tag elsewhere in the same file still wins.
- Updated dependencies [099f46a]
- Updated dependencies [d6d45a9]
- Updated dependencies [b233367]
  - mcp-agentgate-core@0.14.0

## 0.13.2

### Patch Changes

- 8108647: AG-SK-001 no longer lets an early fenced-code example mask a real prompt injection later in the same skill file: all matches per pattern are inspected and one outside fenced code (`critical`) wins over a quoted example (`low`).
- Updated dependencies [8108647]
  - mcp-agentgate-core@0.13.2

## 0.13.1

### Patch Changes

- a50fa73: `deps` (table format) also emits GitHub Actions workflow-command annotations under `GITHUB_ACTIONS=true`, matching `scan`/`ci` from the previous release.
  - mcp-agentgate-core@0.13.1

## 0.13.0

### Minor Changes

- 2a7b052: `scan` (table format) and `ci` emit GitHub Actions workflow-command annotations (`::error file=…,line=…::`) — one per finding, critical/high as errors, medium as warnings, low/info as notices — when `GITHUB_ACTIONS=true`, so findings surface inline on the PR diff without needing SARIF upload. JSON/SARIF stdout is never mixed with annotations.

### Patch Changes

- 8188b9b: AG-SK-001 prompt-injection matches that sit inside a fenced code block are now reported at `low` severity instead of `critical` — guardrail/security skills legitimately quote jailbreak strings as example data (both real-world false positives found in a 133-skill marketplace sweep were this case). Hidden-Unicode detection is unchanged and stays `critical` everywhere.
- Updated dependencies [8188b9b]
  - mcp-agentgate-core@0.13.0

## 0.12.0

### Minor Changes

- f1538d0: Config discovery now covers Windsurf (`~/.codeium/windsurf/mcp_config.json`, legacy `~/.codeium/mcp_config.json`), Cline (`cline_mcp_settings.json` under the VS Code globalStorage dir), and Gemini CLI (`~/.gemini/settings.json` plus project-level `.gemini/settings.json`) — all `mcpServers`-format, per each client's official docs.
- c58fbd7: `config convert` supports three new client formats: `windsurf` (remote servers via `serverUrl`), `cline` (`disabled` flag mapped to enabled state, `autoApprove` warned as lossy), and `gemini-cli` (`url` = SSE vs `httpUrl` = streamable HTTP preserved in both directions). Default-path auto-discovery picks up the new clients too.

### Patch Changes

- Updated dependencies [f1538d0]
- Updated dependencies [c58fbd7]
  - mcp-agentgate-core@0.12.0
  - mcp-agentgate-config-convert@0.2.0

## 0.11.1

### Patch Changes

- 83e6289: Skill scanning covers more real-world layouts: `allowed-tools` YAML flow lists (`["Read", "Bash"]`) on a continuation line are now parsed (previously a silent miss), and slash-command / agent markdown under `skills/`, `commands/`, or `agents/` of agent config trees and Claude Code plugin directories (`plugins/<name>/...`) is scanned with the skill rules.
- ee9dd16: Scan UX: repo-only scans now summarize as "Scanned N source file(s), no MCP servers configured" instead of the confusing "0 server(s) across N file(s)", and AG-SK-002 findings carry the `allowed-tools` line number (better SARIF annotations).
- Updated dependencies [83e6289]
- Updated dependencies [ee9dd16]
  - mcp-agentgate-core@0.11.1

## 0.11.0

### Minor Changes

- 1a4877b: New rule AG-SK-002: skill frontmatter that pre-approves dangerous unscoped tool grants via `allowed-tools` is flagged — unscoped `Bash` (high, unrestricted shell without a permission prompt), unscoped `Write`/`Edit` and `WebFetch`/`WebSearch` (medium). Scoped grants like `Bash(git add *)` are fine.
- 1a4877b: New rule AG-SK-003: dangerous load-time dynamic-context commands in skill files — inline `` !`command` `` placeholders and ``` ! fenced blocks run as shell commands the moment the skill loads. Piping a remote download into a shell is critical; sending data to a remote host or reading credential material (`~/.ssh`, `.aws/credentials`, `.env`) into the prompt is high. Benign context commands like  `` !`git diff HEAD` `` are not flagged.

### Patch Changes

- Updated dependencies [1a4877b]
- Updated dependencies [1a4877b]
  - mcp-agentgate-core@0.11.0

## 0.10.0

### Minor Changes

- 2b2e94e: New rule AG-SK-001: repo scans now check agent skill files (`SKILL.md`, and markdown under `.agents/.claude/.cursor/.codex/.opencode` `skills/` trees) for hidden Unicode and prompt-injection patterns — skills are executed as agent instructions, so matches are critical.

### Patch Changes

- Updated dependencies [2b2e94e]
  - mcp-agentgate-core@0.10.0

## 0.9.0

### Minor Changes

- c84cc76: `agentgate advisory check` no longer requires `-e` for PyPI packages: when the ecosystem flag is omitted, both npm and PyPI are checked (each JSON match now carries its `ecosystem`; `package.ecosystem` is `null` when unset).

### Patch Changes

- mcp-agentgate-core@0.9.0

## 0.8.0

### Minor Changes

- 47c8572: New `agentgate advisory` subcommand: `advisory check <pkg>[@version]` queries the MCPA advisory database for a single package (exit 1 on a match, usable as a pre-install gate) and `advisory list` prints the whole database — live API with bundled offline fallback, `--json` for scripting. The bundled advisory subset now carries the `published` date.

### Patch Changes

- Updated dependencies [47c8572]
  - mcp-agentgate-core@0.8.0

## 0.7.2

### Patch Changes

- 5448f0c: Advisory database: three new flyto-core entries — MCPA-2026-0012 (unauthenticated command execution via HTTP MCP execute_module, CVE-2026-55786), MCPA-2026-0013 (SSRF guard bypass via IPv6 transition addresses, CVE-2026-55787), MCPA-2026-0014 (2026-07-30 batch: unauthenticated callback SSRF with runner-secret exfiltration and four related guard bypasses, CVE-2026-67424..67428). Also adds PYSEC/MAL mirror ids as aliases to seven existing advisories so cross-referencing tools and the advisory-watch sweep recognize them. 28 advisories bundled.
- Updated dependencies [5448f0c]
  - mcp-agentgate-core@0.7.2

## 0.7.1

### Patch Changes

- 24a4e20: SARIF: per-rule `security-severity` defaults (was a flat 8.0 for every rule, skewing GitHub code scanning severity buckets) and stable `partialFingerprints` (`agentgateFindingKey/v1`) for cross-run finding tracking. CLI: `agentgate scan` now warns when no MCP client configs were discovered instead of printing a clean bill for an empty scan.
- eea7c0d: Advisory database: add MCPA-2026-0011 — AWS Labs DocumentDB MCP Server (`awslabs.documentdb-mcp-server` on PyPI) read-only mode bypass via write-capable aggregation pipeline stages (CVE-2026-18954, fixed in 1.0.12).
- Updated dependencies [24a4e20]
- Updated dependencies [eea7c0d]
  - mcp-agentgate-core@0.7.1

## 0.7.0

### Patch Changes

- 861e050: SARIF output fixes: report the real CLI version in `tool.driver.version` (was hardcoded 0.1.0) and emit repository-relative artifact URIs (required by GitHub code scanning; absolute paths previously broke alert file mapping). `toSarif` now takes a `SarifOptions` object (`toolVersion`, `baseDir`). Advisory database: add MCPA-2025-0014 (malicious npm package `mcp-server-everything`, OSV MAL-2025-46986).
- Updated dependencies [861e050]
  - mcp-agentgate-core@0.7.0

## 0.6.2

### Patch Changes

- 4b28ae8: Add proper package-level READMEs so the npm registry pages document install, commands, exit codes, and links (previously the CLI package had no README on npm).
- Updated dependencies [4b28ae8]
  - mcp-agentgate-core@0.6.2

## 0.6.1

### Patch Changes

- d99d857: Republish: the 0.6.0 npm artifact was published with unrewritten `workspace:*` dependencies and cannot be installed. No code changes.
  - mcp-agentgate-core@0.6.1

## 0.6.0

### Minor Changes

- 6fef750: `agentgate scan` now refreshes the MCPA advisory database from the live AgentGate advisory API before matching (AG-SC-003), so advisories published after your CLI release are still caught. The bundled copy remains the offline fallback — an unreachable API degrades to a single warning and the scan continues on bundled data. New core export `fetchLiveMcpaAdvisories()`; override the endpoint with `AGENTGATE_ADVISORY_API`.

### Patch Changes

- Updated dependencies [6fef750]
- Updated dependencies [36d5469]
  - mcp-agentgate-core@0.6.0

## 0.5.5

### Patch Changes

- ef032b1: Advisory DB: add MCPA-2026-0010 — malicious PyPI packages impersonating popular AI libraries as MCP servers (openai-mcp, langchain-core-mcp, tiktoken-mcp, instructor-mcp; OSV MAL-2026-5317/5318/5320/5326). Critical AG-SC-003 finding even fully offline.
- Updated dependencies [ef032b1]
  - mcp-agentgate-core@0.5.5

## 0.5.4

### Patch Changes

- Updated dependencies [1b2ad5a]
  - mcp-agentgate-core@0.5.4

## 0.5.3

### Patch Changes

- 825e8d2: Advisory DB: add MCPA-2026-0009 — ten malicious npm packages squatting official MCP reference server names (mcp-server-fetch/-git/-github/…, OSV MAL-2026-5476..5485). Configs launching these names now get a critical AG-SC-003 finding even fully offline.
- Updated dependencies [825e8d2]
  - mcp-agentgate-core@0.5.3

## 0.5.2

### Patch Changes

- 2f876c8: `agentgate config convert` now auto-discovers the source client's config at its default location (project-level first, then user-level) when `--in` is omitted and stdin is a terminal; piped stdin still wins.
  - mcp-agentgate-core@0.5.2

## 0.5.1

### Patch Changes

- ec46e9c: Advisory DB: add MCPA-2026-0007 (gemini-bridge arbitrary file read, CVE-2026-54785) and MCPA-2026-0008 (flyto-core arbitrary file write, CVE-2026-67429). Fix: PyPI servers pinned with PEP 508 `==` (e.g. `uvx pkg==1.2.0`) are now parsed as pinned name+version, so advisory matching and AG-SC-001 pin advice work for uvx/pipx launches.
- Updated dependencies [ec46e9c]
  - mcp-agentgate-core@0.5.1

## 0.5.0

### Minor Changes

- 528aecd: New `agentgate config convert` subcommand: convert MCP server configuration between client formats (Claude Desktop/Code, Cursor, VS Code, Codex, OpenCode) directly from the main CLI — same engine as the standalone `mcp-agentgate-config-convert` package, with lossy-conversion warnings on stderr.

### Patch Changes

- mcp-agentgate-core@0.5.0

## 0.4.0

### Minor Changes

- e69fe1b: `agentgate scan` cross-checks configured server packages against the bundled AgentGate MCP advisory database (`MCPA-*`) — new `AG-SC-003` finding covering RCE/SSRF/path-traversal/auth advisories beyond malware, with SemVer range comparison for pinned versions; works fully offline. New core exports `MCPA_ADVISORIES`, `matchMcpaAdvisories()`, `scoreMcpaMatches()`. Also fixed: `agentgate --version` reported a hardcoded `0.1.0`.

### Patch Changes

- Updated dependencies [e69fe1b]
  - mcp-agentgate-core@0.4.0

## 0.3.0

### Minor Changes

- 62546bd: Cross-server analysis: `scan --live` now analyzes every inspected server's tool surface together.

  - `AG-TF-001` toxic flows: tools that read private data + tools that send data out across different servers = exfiltration flow (medium); plus a tool ingesting untrusted external content = complete toxic flow (high)
  - `AG-XS-001` shadowing/hijack: duplicate tool names across servers (high); a tool instructing the agent about another server's tool (critical)
  - new core API `scanConfiguration(surfaces)` and rule hook `checkConfiguration`
  - fixed: the `$schema` meta-URL in zod-generated input schemas no longer gives every tool a network capability; sibilant third-person verbs ("Fetches", "Searches") now match capability patterns

- 1afb7d5: `agentgate deps` checks dependencies against OSV.dev known-malware advisories: a package with a `MAL-*` advisory (GitHub Advisory DB / OSV malicious-packages, including the malicious MCP-server package wave) is a critical `AG-DP-006` finding with the advisory link. Degrades to a warning offline. New core API `queryOsvMalware()` / `scoreAdvisories()`.
- 1afb7d5: `agentgate scan` checks configured server packages (launched via npx/pnpx/bunx/uvx/pipx) against OSV.dev known-malware advisories — new `AG-SC-002` finding, with pinned-version comparison for compromised-release advisories. New core export `serverPackageRef()`.

### Patch Changes

- 078003e: Repo scans report dynamic code-execution primitives (`eval(`, `new Function(`, child_process spawns) only in files that are part of an MCP server — that is where model-controlled input can reach them; flagging every one in ordinary application code buried the findings that matter (microsoft/vscode: 67 → 5 medium RCE findings, with a real catch surviving).
- b92eba7: Secret-shaped strings found in test/fixture/example paths are reported at `low` with a "likely a deliberate fake; confirm" note instead of `high` — redaction tests deliberately contain such strings (microsoft/vscode: 10 → 1 high credential findings, the survivor being a private-key marker in shipping code).
- b65046c: Known-malware advisory comparisons now resolve installed versions from lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` v1, `poetry.lock`, `uv.lock`) as well as `node_modules`, so compromised-release advisories get a definitive severity on uninstalled checkouts. New core export `loadResolvedVersions()`.
- Updated dependencies [62546bd]
- Updated dependencies [078003e]
- Updated dependencies [b92eba7]
- Updated dependencies [1afb7d5]
- Updated dependencies [1afb7d5]
- Updated dependencies [b65046c]
- Updated dependencies [6eb8e25]
  - mcp-agentgate-core@0.3.0

## 0.2.1

### Patch Changes

- e77f876: `deps` false-positive elimination and output polish (benchmark round 1 vs npm audit / osv-scanner / socket CLI): first-party Python modules and imports inside comments/docstrings are no longer reported; nonexistent imports found only under test/example paths downgrade to `low`; unparseable manifests now warn loudly (stderr + report `warnings[]`) instead of passing silently; findings tables print per-rule doc links; SARIF rules carry `helpUri`; finding targets mark import-only refs with an `(import)` suffix.
- 08184ba: Round 2 benchmark (vs mcp-scan / Snyk Agent Scan, microsoft/vscode as the real-world subject):

  - `scan --live` now lists the stdio commands it is about to start and asks for confirmation; non-interactive sessions must pass `--yes` (nothing is started otherwise)
  - a static scan that skips stdio servers warns that their live tool surface was not inspected instead of reporting a clean bill
  - rule recall: third-person tool descriptions ("Executes arbitrary shell commands") are now matched by the RCE, overprivileged and SSRF rules
  - rule precision on real repos (vscode: 478 → 89 findings): `.exec(` is no longer a code-execution primitive, a bare `child_process` mention needs a nearby exec/spawn call, `curl|sh` in non-executable files is medium, and emoji ZWJ/flag/Nerd-Font/BOM characters are no longer "hidden instructions" (zero-width → low, Trojan-Source bidi → high, now with codepoint and line)
  - `deps` collapses a fully unreachable registry into one warning instead of one finding per package

- Updated dependencies [e77f876]
- Updated dependencies [08184ba]
  - mcp-agentgate-core@0.2.1

## 0.2.0

### Minor Changes

- 6598a8b: New `agentgate deps` command: detect AI-hallucinated (slopsquatted) and typosquatted dependencies across npm and PyPI. Collects names from package.json / requirements\*.txt / pyproject.toml and source imports, verifies existence against live registries, risk-scores existing packages (rules AG-DP-001..005), and gates with `--fail-on` — table/JSON/SARIF output, `--offline` degradation, GitHub Action + pre-commit integration.

### Patch Changes

- Updated dependencies [6598a8b]
  - mcp-agentgate-core@0.2.0
