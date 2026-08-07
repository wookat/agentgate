# mcp-agentgate-core

## 0.21.0

### Minor Changes

- a3c6fe8: `scan --live`, `lock`, `diff`, and `ci` now connect to remote MCP servers (`url` configs) via Streamable HTTP with an SSE fallback for legacy servers, passing configured `headers`. Remote tool surfaces are scanned for poisoning and pinned in the lockfile just like stdio servers; previously every remote server was skipped as "analyzed statically only".

### Patch Changes

- e0fbced: `deps` no longer flags imports resolved through a `deno.json`/`deno.jsonc` import map as hallucinated npm packages: map keys (e.g. JSR `@std/*` specifiers) are treated as declared. Fixes 3 critical false positives on honojs/hono.
- d00c2ce: `deps` Python import scanning: well-known import names map to their PyPI distributions (yaml→pyyaml, git→gitpython, PIL→pillow, …), Python 3.14 stdlib modules (annotationlib, compression) are recognized, and any directory containing .py files counts as a local namespace package. Fixes 3 critical false positives on tiangolo/fastapi.

## 0.20.0

### Minor Changes

- 24011e5: `scan --live` correlates a server's `includeTools` allowlist against its actual tool surface: entries matching no live tool report a low AG-OP-001 finding (stale or typoed allowlist entries scope nothing).

## 0.19.0

### Minor Changes

- cad6f07: Discover Warp MCP configs (`~/.warp/.mcp.json`, project `.warp/.mcp.json`) and the generic other-agents convention (`~/.agents/.mcp.json`, project `.agents/.mcp.json`); `config convert` supports `warp` (standard `mcpServers`, `working_directory` ↔ cwd).
- 3402ce9: Parse the `includeTools` allowlist on skill-declared MCP servers (Amp convention) and report a low AG-OP-001 finding when a skill-declared server omits it, since the skill then exposes the server's full tool surface.

## 0.18.1

## 0.18.0

### Minor Changes

- 754deef: Discover Amp (Sourcegraph) MCP configs — the `amp.mcpServers` key in `~/.config/amp/settings.json` and workspace `.amp/settings.json` — and support `amp` in `config convert` (14 clients total).
- f9485e4: Extract MCP servers declared by agent skills — a sibling `mcp.json` or the `mcpServers` frontmatter field of `SKILL.md` (Amp convention, frontmatter shadows the sibling file) under `.agents/skills/`, `.claude/skills/`, and `~/.config/amp/skills/` — and run the full MCP config rule set over them.

## 0.17.0

### Minor Changes

- c6c0d55: Skill/instruction scanning (AG-SK rules) and `lock --skills` now cover Continue.dev workspace rules (`.continue/rules/*.md`), which are joined verbatim into the model's system message.

### Patch Changes

- b506be0: Skill scanning and `lock --skills` also cover Continue.dev workspace prompts (`.continue/prompts/*.md`), verified against Continue's own workspace-block loader source.

## 0.16.0

### Minor Changes

- 1f0f015: Client config discovery now also covers Continue.dev: the global `~/.continue/config.yaml` and every workspace `.continue/mcpServers/*.yaml` block file (`mcpServers` YAML lists with `name`/`command`/`args`/`env`/`url`/`type`) — 13 clients total.

## 0.15.0

### Minor Changes

- 51ea55e: Lockfile v2: `agentgate lock --skills [dir]` additionally pins every agent skill/instruction file's SHA-256 (same file set skill scanning covers), and `agentgate diff` / `agentgate ci` fail with `skill-added` / `skill-removed` / `skill-changed` drift entries when pinned files change. Lockfiles without `--skills` keep being written as version 1; readers accept both versions.
- a9a1841: Client config discovery now also covers Kiro (`~/.kiro/settings/mcp.json` + project `.kiro/settings/mcp.json`), Roo Code (VS Code globalStorage `mcp_settings.json` + project `.roo/mcp.json`), and Zed (`context_servers` in `settings.json`, JSONC comments and trailing commas tolerated) — 12 clients total.

### Patch Changes

- e52dea6: Bundled advisory database: add MCPA-2026-0015 — LudusMCP (npm: ludus-mcp) ≤1.0.24 command injection via the get_credential_from_user secret-dialog description (CVE-2026-19045, no fixed release yet).
- 028f4a4: Under GitHub Actions, `agentgate ci` now emits one error annotation per lockfile drift entry (skill drift entries carry the changed file's path, so they land inline on the PR diff). The no-drift message now reads "locked surface" instead of "tool surface" since v2 lockfiles can also pin skill files.
- d27704d: Bundled advisory database: add MCPA-2026-0016 (LudusMCP `ludus_cli_execute` command injection, CVE-2026-19047) and MCPA-2026-0017 (LudusMCP `ludus_environment_guides_search` path traversal, CVE-2026-19046), both affecting npm `ludus-mcp` <= 1.0.24 (31 advisories total).

## 0.14.0

### Minor Changes

- 099f46a: Skill scanning (AG-SK-001/002/003) now covers Windsurf rules and workflows (`.windsurf/rules/`, `.windsurf/workflows/`, `.windsurfrules`), Cline rules (`.clinerules/` directory or file, `.cursorrules`), and Cursor rule files (`.cursor/rules/*.mdc`) — all executed verbatim as agent instructions, same threat class as skills.
- d6d45a9: Skill scanning covers Gemini CLI custom commands (`.gemini/commands/**.toml`): prompt text is checked for hidden Unicode and injection patterns, and `!{...}` shell-injection blocks are analyzed like skill dynamic-context commands (AG-SK-003) — `curl | sh`, data exfiltration, and credential reads are flagged.

### Patch Changes

- b233367: AG-SK-001: a bare `<instructions>` or `<important>` tag in a skill file is reported at `low` instead of `critical` — skill files are instructions, so these tags are common prompt-template structure there, not a concealment channel. They stay `critical` in tool descriptions, `<system>`/`<secret>`/`<hidden>` stay `critical` everywhere, and a suspicious tag elsewhere in the same file still wins.

## 0.13.2

### Patch Changes

- 8108647: AG-SK-001 no longer lets an early fenced-code example mask a real prompt injection later in the same skill file: all matches per pattern are inspected and one outside fenced code (`critical`) wins over a quoted example (`low`).

## 0.13.1

## 0.13.0

### Patch Changes

- 8188b9b: AG-SK-001 prompt-injection matches that sit inside a fenced code block are now reported at `low` severity instead of `critical` — guardrail/security skills legitimately quote jailbreak strings as example data (both real-world false positives found in a 133-skill marketplace sweep were this case). Hidden-Unicode detection is unchanged and stays `critical` everywhere.

## 0.12.0

### Minor Changes

- f1538d0: Config discovery now covers Windsurf (`~/.codeium/windsurf/mcp_config.json`, legacy `~/.codeium/mcp_config.json`), Cline (`cline_mcp_settings.json` under the VS Code globalStorage dir), and Gemini CLI (`~/.gemini/settings.json` plus project-level `.gemini/settings.json`) — all `mcpServers`-format, per each client's official docs.

## 0.11.1

### Patch Changes

- 83e6289: Skill scanning covers more real-world layouts: `allowed-tools` YAML flow lists (`["Read", "Bash"]`) on a continuation line are now parsed (previously a silent miss), and slash-command / agent markdown under `skills/`, `commands/`, or `agents/` of agent config trees and Claude Code plugin directories (`plugins/<name>/...`) is scanned with the skill rules.
- ee9dd16: Scan UX: repo-only scans now summarize as "Scanned N source file(s), no MCP servers configured" instead of the confusing "0 server(s) across N file(s)", and AG-SK-002 findings carry the `allowed-tools` line number (better SARIF annotations).

## 0.11.0

### Minor Changes

- 1a4877b: New rule AG-SK-002: skill frontmatter that pre-approves dangerous unscoped tool grants via `allowed-tools` is flagged — unscoped `Bash` (high, unrestricted shell without a permission prompt), unscoped `Write`/`Edit` and `WebFetch`/`WebSearch` (medium). Scoped grants like `Bash(git add *)` are fine.
- 1a4877b: New rule AG-SK-003: dangerous load-time dynamic-context commands in skill files — inline `` !`command` `` placeholders and ``` ! fenced blocks run as shell commands the moment the skill loads. Piping a remote download into a shell is critical; sending data to a remote host or reading credential material (`~/.ssh`, `.aws/credentials`, `.env`) into the prompt is high. Benign context commands like  `` !`git diff HEAD` `` are not flagged.

## 0.10.0

### Minor Changes

- 2b2e94e: New rule AG-SK-001: repo scans now check agent skill files (`SKILL.md`, and markdown under `.agents/.claude/.cursor/.codex/.opencode` `skills/` trees) for hidden Unicode and prompt-injection patterns — skills are executed as agent instructions, so matches are critical.

## 0.9.0

## 0.8.0

### Minor Changes

- 47c8572: New `agentgate advisory` subcommand: `advisory check <pkg>[@version]` queries the MCPA advisory database for a single package (exit 1 on a match, usable as a pre-install gate) and `advisory list` prints the whole database — live API with bundled offline fallback, `--json` for scripting. The bundled advisory subset now carries the `published` date.

## 0.7.2

### Patch Changes

- 5448f0c: Advisory database: three new flyto-core entries — MCPA-2026-0012 (unauthenticated command execution via HTTP MCP execute_module, CVE-2026-55786), MCPA-2026-0013 (SSRF guard bypass via IPv6 transition addresses, CVE-2026-55787), MCPA-2026-0014 (2026-07-30 batch: unauthenticated callback SSRF with runner-secret exfiltration and four related guard bypasses, CVE-2026-67424..67428). Also adds PYSEC/MAL mirror ids as aliases to seven existing advisories so cross-referencing tools and the advisory-watch sweep recognize them. 28 advisories bundled.

## 0.7.1

### Patch Changes

- 24a4e20: SARIF: per-rule `security-severity` defaults (was a flat 8.0 for every rule, skewing GitHub code scanning severity buckets) and stable `partialFingerprints` (`agentgateFindingKey/v1`) for cross-run finding tracking. CLI: `agentgate scan` now warns when no MCP client configs were discovered instead of printing a clean bill for an empty scan.
- eea7c0d: Advisory database: add MCPA-2026-0011 — AWS Labs DocumentDB MCP Server (`awslabs.documentdb-mcp-server` on PyPI) read-only mode bypass via write-capable aggregation pipeline stages (CVE-2026-18954, fixed in 1.0.12).

## 0.7.0

### Minor Changes

- 861e050: SARIF output fixes: report the real CLI version in `tool.driver.version` (was hardcoded 0.1.0) and emit repository-relative artifact URIs (required by GitHub code scanning; absolute paths previously broke alert file mapping). `toSarif` now takes a `SarifOptions` object (`toolVersion`, `baseDir`). Advisory database: add MCPA-2025-0014 (malicious npm package `mcp-server-everything`, OSV MAL-2025-46986).

## 0.6.2

### Patch Changes

- 4b28ae8: Add proper package-level READMEs so the npm registry pages document install, commands, exit codes, and links (previously the CLI package had no README on npm).

## 0.6.1

## 0.6.0

### Minor Changes

- 6fef750: `agentgate scan` now refreshes the MCPA advisory database from the live AgentGate advisory API before matching (AG-SC-003), so advisories published after your CLI release are still caught. The bundled copy remains the offline fallback — an unreachable API degrades to a single warning and the scan continues on bundled data. New core export `fetchLiveMcpaAdvisories()`; override the endpoint with `AGENTGATE_ADVISORY_API`.

### Patch Changes

- 36d5469: PyPI servers launched with PEP 508 range specs (`uvx pkg>=1.0`, `~=`, extras like `pkg[extra]`) now have their bare package name extracted for advisory matching — previously the range operator stayed in the name and MCPA/OSV advisories could never match. `uvx gemini-bridge>=1.0` now reports the MCPA-2026-0007 advisory with pin advice in addition to the unpinned warning.

## 0.5.5

### Patch Changes

- ef032b1: Advisory DB: add MCPA-2026-0010 — malicious PyPI packages impersonating popular AI libraries as MCP servers (openai-mcp, langchain-core-mcp, tiktoken-mcp, instructor-mcp; OSV MAL-2026-5317/5318/5320/5326). Critical AG-SC-003 finding even fully offline.

## 0.5.4

### Patch Changes

- 1b2ad5a: AG-SC-001 pin advice now uses the runner's syntax: `pkg==1.2.3` for uvx/pipx (PyPI), `pkg@1.2.3` for npx/pnpx/bunx — instead of always suggesting npm-style `@1.2.3` (which produced nonsense like `pkg==1.0@1.2.3`).

## 0.5.3

### Patch Changes

- 825e8d2: Advisory DB: add MCPA-2026-0009 — ten malicious npm packages squatting official MCP reference server names (mcp-server-fetch/-git/-github/…, OSV MAL-2026-5476..5485). Configs launching these names now get a critical AG-SC-003 finding even fully offline.

## 0.5.2

## 0.5.1

### Patch Changes

- ec46e9c: Advisory DB: add MCPA-2026-0007 (gemini-bridge arbitrary file read, CVE-2026-54785) and MCPA-2026-0008 (flyto-core arbitrary file write, CVE-2026-67429). Fix: PyPI servers pinned with PEP 508 `==` (e.g. `uvx pkg==1.2.0`) are now parsed as pinned name+version, so advisory matching and AG-SC-001 pin advice work for uvx/pipx launches.

## 0.5.0

## 0.4.0

### Minor Changes

- e69fe1b: `agentgate scan` cross-checks configured server packages against the bundled AgentGate MCP advisory database (`MCPA-*`) — new `AG-SC-003` finding covering RCE/SSRF/path-traversal/auth advisories beyond malware, with SemVer range comparison for pinned versions; works fully offline. New core exports `MCPA_ADVISORIES`, `matchMcpaAdvisories()`, `scoreMcpaMatches()`. Also fixed: `agentgate --version` reported a hardcoded `0.1.0`.

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
- 6eb8e25: Repo-scan rules now receive posix-style relative paths on every OS, so test/fixture-path heuristics work on Windows.

## 0.2.1

### Patch Changes

- e77f876: `deps` false-positive elimination and output polish (benchmark round 1 vs npm audit / osv-scanner / socket CLI): first-party Python modules and imports inside comments/docstrings are no longer reported; nonexistent imports found only under test/example paths downgrade to `low`; unparseable manifests now warn loudly (stderr + report `warnings[]`) instead of passing silently; findings tables print per-rule doc links; SARIF rules carry `helpUri`; finding targets mark import-only refs with an `(import)` suffix.
- 08184ba: Round 2 benchmark (vs mcp-scan / Snyk Agent Scan, microsoft/vscode as the real-world subject):

  - `scan --live` now lists the stdio commands it is about to start and asks for confirmation; non-interactive sessions must pass `--yes` (nothing is started otherwise)
  - a static scan that skips stdio servers warns that their live tool surface was not inspected instead of reporting a clean bill
  - rule recall: third-person tool descriptions ("Executes arbitrary shell commands") are now matched by the RCE, overprivileged and SSRF rules
  - rule precision on real repos (vscode: 478 → 89 findings): `.exec(` is no longer a code-execution primitive, a bare `child_process` mention needs a nearby exec/spawn call, `curl|sh` in non-executable files is medium, and emoji ZWJ/flag/Nerd-Font/BOM characters are no longer "hidden instructions" (zero-width → low, Trojan-Source bidi → high, now with codepoint and line)
  - `deps` collapses a fully unreachable registry into one warning instead of one finding per package

## 0.2.0

### Minor Changes

- 6598a8b: New `agentgate deps` command: detect AI-hallucinated (slopsquatted) and typosquatted dependencies across npm and PyPI. Collects names from package.json / requirements\*.txt / pyproject.toml and source imports, verifies existence against live registries, risk-scores existing packages (rules AG-DP-001..005), and gates with `--fail-on` — table/JSON/SARIF output, `--offline` degradation, GitHub Action + pre-commit integration.
