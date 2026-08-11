# mcp-agentgate

## 0.67.60

### Patch Changes

- 6b7c799: AG-RC-001: mask curl|sh text inside print/log-helper message strings in shell scripts (`info "curl … | sh"`, `…_warn_or_fail "uses curl|sh"`, multi-line `fail "…"` messages with command substitutions) — the helper displays its argument, it does not execute it. Findings now attribute to the first genuinely live pipeline; `run 'curl … | bash'` wrapper idioms and real pipelines stay critical.
- Updated dependencies [6b7c799]
  - mcp-agentgate-core@0.67.60

## 0.67.59

### Patch Changes

- 67821c8: AG-SS-001 skips metadata-endpoint mentions on comment-only lines when choosing the reported occurrence: severity is decided by the first non-comment mention (a live fetch below a doc comment still reports high), and files where every mention is a comment report low with comment wording.
- Updated dependencies [67821c8]
  - mcp-agentgate-core@0.67.59

## 0.67.58

### Patch Changes

- 314981d: AG-RC-001: exempt GoReleaser configs (.goreleaser.yaml et al.) from source scanning — release-pipeline build automation whose release-notes text carries install one-liners, same rationale as other CI pipeline configs.
- Updated dependencies [314981d]
  - mcp-agentgate-core@0.67.58

## 0.67.57

### Patch Changes

- c33cc4f: AG-TP-001: hidden bidi/invisible characters embedded in defensive detection patterns — a regex character class listing the bidi range or a quoted rule-test fixture payload, with hidden-unicode attack prose in the surrounding window or detection-rule filename — are reported low instead of high. Hidden characters in ordinary source lines stay high.
- Updated dependencies [c33cc4f]
  - mcp-agentgate-core@0.67.57

## 0.67.56

### Patch Changes

- 13474e9: The "sidenote" poisoning marker now requires a directing verb ("pass/include/send … as/in a sidenote"), so typographic prose about sidenote page elements no longer reports AG-SK-001/AG-TP-001 findings. `conversation_history` detection is unchanged.
- Updated dependencies [13474e9]
  - mcp-agentgate-core@0.67.56

## 0.67.55

### Patch Changes

- bf6222a: AG-SS-001 defensive-context recognition covers two more real shapes: URL-validator modules (validator/validate identifiers or allowlist wording near the metadata-IP literal) and underscore-bounded SSRF identifiers (`SSRF_CORPUS` adversarial-check tables, plus "must never" wording). Defensive allowlist validators and SSRF test corpora that list the metadata IP now grade low instead of high; exploitation scripts with no defensive wording keep grading high.
- bf65a52: AG-SS-001 defensive-context recognition covers boolean host-classifier predicates: when the metadata literal sits on an equality-comparison line (`host === "metadata.google.internal"`, or a `return false; // … cloud metadata` branch comment) with a boolean return in the near window and no fetch call on that line, the finding grades low. Code that dials the endpoint (urllib/requests/curl) keeps grading high.
- Updated dependencies [bf6222a]
- Updated dependencies [bf65a52]
  - mcp-agentgate-core@0.67.55

## 0.67.54

### Patch Changes

- 2ab08b6: AG-SS-001 defensive-context recognition covers two more real shapes: noun-first module headers ("SSRF Protection page — … IP blocking") and lowercase camelCase block identifiers (`blockCases`, `blockList` variants). Defensive SSRF-guard pages and blocklist test harnesses that reference the metadata IP now grade low instead of high; exploitation scripts with no defensive wording keep grading high.
- Updated dependencies [2ab08b6]
  - mcp-agentgate-core@0.67.54

## 0.67.53

### Patch Changes

- ccabdbd: AG-SK-001 fence tracking follows CommonMark closing-fence rules: a closing fence must use the same character, be at least the opener's length, and carry no info string. Shorter inner runs (or ones carrying a language tag) inside a longer fence no longer end the block, so quoted injection examples nested in `~~~~`-fenced untrusted-text blocks stay graded low instead of escalating to critical.
- Updated dependencies [ccabdbd]
  - mcp-agentgate-core@0.67.53

## 0.67.52

### Patch Changes

- a9e2b93: AG-TP-001 grades trojan-grade hidden Unicode characters low when they sit on a comment line whose surrounding prose discusses hidden-unicode attacks (bidi/RLO/homoglyph documentation in security tooling). Comment lines without attack prose, and code lines anywhere in the file, stay high — the scanner now surfaces the first non-defensive hit instead of stopping at the first hit.
- Updated dependencies [a9e2b93]
  - mcp-agentgate-core@0.67.52

## 0.67.51

### Patch Changes

- 2c56621: AG-SC-001 no longer flags marketplace plugin url-form sources with schemeless relative urls (`{"source": "url", "url": "./"}`) as mutable — repo-local content shipped with the catalog is the same trust boundary as a local path source. Remote-scheme url sources stay flagged.
- Updated dependencies [2c56621]
  - mcp-agentgate-core@0.67.51

## 0.67.50

### Patch Changes

- 4a5105d: Cover the Qoder plugin surface (`.qoder-plugin/`): plugin manifests (`plugin.json` hooks and bundled mcpServers), marketplace catalogs (`marketplace.json` mutable sources), manifest-gated component markdown, and the plugin root's `system-prompt.md` extension context — Qwen Code v0.21.9 installs Qoder plugins natively, so these files now run for Qwen users too.
- Updated dependencies [4a5105d]
  - mcp-agentgate-core@0.67.50

## 0.67.49

### Patch Changes

- 10e2f50: AG-SK-003 precision: hook commands that POST data only to a loopback address (`127.0.0.1`, `localhost`, `[::1]`) are no longer classified as sending data to a remote host — a local notifier daemon receives nothing off the machine. Commands with any remote URL, a mixed loopback+remote pair, or no URL literal (variable host) keep their previous high grade.
- Updated dependencies [10e2f50]
  - mcp-agentgate-core@0.67.49

## 0.67.48

### Patch Changes

- 5f498c1: AG-RC-001 precision: comment-line curl|sh mentions (`#`, `//`, and block-comment `*` continuations) in non-executable sources now report low with comment wording — a commented line never executes in any file class. Backtick inline-code spans quoting the idiom in Python sources (docstring/RST prose, where backticks are not syntax) also report low. Live command strings, real installer pipelines, and yaml block-scalar commands keep their previous grades.
- Updated dependencies [5f498c1]
  - mcp-agentgate-core@0.67.48

## 0.67.47

### Patch Changes

- f4b2b99: Round 393 precision: AG-RC-001 no longer reports hyphenated compound nouns in prose ("code-exec (…)", "olmo-eval (…)") as dynamic code-execution primitives, and AG-SC-001 pin advice for unpinned OpenCode/Kilo npm plugins strips the trailing tag so the example is a valid spec (`@scope/plugin@1.2.3`, not `@scope/plugin@latest@1.2.3`).
- Updated dependencies [f4b2b99]
  - mcp-agentgate-core@0.67.47

## 0.67.46

### Patch Changes

- 72d63b1: Round-391 fresh-corpus precision: AG-RC-001 treats TOML rule-test expectation keys (should*match/must_not_match) as pattern data and grades backtick-quoted curl|sh prose in yaml/toml data files as text; AG-SS-001 recognizes deny-named domain config (denied_domains/deniedDomains/\_DENY*) and guard wording as defensive context and grades evals/ trees quietly; AG-CL-001 grades nosec/fake-fixture-commented values and the canonical jwt.io token low.
- Updated dependencies [72d63b1]
  - mcp-agentgate-core@0.67.46

## 0.67.45

### Patch Changes

- 2b38f88: Fresh-corpus precision (round 389): AG-CL-001 skips secret-shaped values containing an 8+ ascending character run (keyboard-walk demo filler like `AKIA1234567890ABCDEF` or alphabet-run `ghp_ABCDEF…`); AG-SS-001 recognizes "cannot target" rejection wording as defensive context; AG-RC-001 masks quoted-string-only continuation-line arguments (diagnostic wrappers like `doctor_fail \` + `"curl … | sh"`), while interpreter/eval/ssh continuation chains stay live.
- Updated dependencies [2b38f88]
  - mcp-agentgate-core@0.67.45

## 0.67.44

### Patch Changes

- 08be4b8: Scan output consistency (round 388): findings from discovered config files (an `.mcp.json` server launched through a shell, an unpinned server spec) now report their `file` posix-relative to the scan root like repo-walk findings do, instead of as an absolute path; configs outside the scan root (user-level client configs) keep their absolute path.
  - mcp-agentgate-core@0.67.44

## 0.67.43

### Patch Changes

- 4e49a6f: Fresh-corpus precision (round 387): AG-RC-001 — dockerfile-named source files (`dockerfile.ts`, `sandbox-dockerfile.test.ts`) are no longer treated as executable Dockerfiles, a backslash-escaped pipe (`\|` in regex sources) is not a pipeline, `//` lines count as comments in C-family sources, and quoted curl|sh payload arguments in test-path scripts grade low; AG-SK-003 masks interpolation-free double-quoted echo strings (installer hints in error messages); AG-CL-001 grades demo-delimited filenames quietly; AG-SS-001 recognizes dangerous-named host denylists as defensive context.
- Updated dependencies [4e49a6f]
  - mcp-agentgate-core@0.67.43

## 0.67.42

### Patch Changes

- cc78a3b: Fresh-corpus precision: AG-RC-001 recognizes plural `patterns:` detection-rule lists; AG-CL-001 skips all-caps snake*case env placeholders and gitleaks JSON baselines; AG-SS-001 treats IOC-database headers as defensive; AG-TP-001 grades `test*_`/`_\_test` filenames quietly.
- Updated dependencies [cc78a3b]
  - mcp-agentgate-core@0.67.42

## 0.67.41

### Patch Changes

- d608273: AG-RC-001 precision: bare `curl|bash` category labels, regex alternations, and sentence-crossing command lists no longer report as remote-exec pipelines; live installers, `| bash -`, and data-pipe exclusions are regression-pinned.
- Updated dependencies [d608273]
  - mcp-agentgate-core@0.67.41

## 0.67.40

### Patch Changes

- f4db397: AG-SK-001/TP-001 precision: an instrumental credential in the exfiltration-instruction pattern ("you must send HTTPS requests directly with a Bearer Token") is the authentication idiom of API docs — a with/using article directly before the credential qualifier no longer matches. Real exfiltration phrasings (naming the credential as the payload) keep their severity.
- Updated dependencies [f4db397]
  - mcp-agentgate-core@0.67.40

## 0.67.39

### Patch Changes

- 892311f: AG-CL-001 precision: server configs in test/fixture trees report their hardcoded fake credentials as low with fixture wording; hyphen/underscore-delimited `test`/`selfcheck` filename tokens (integration-test-_.mjs, selfcheck-_.mjs) count as test paths; redaction test vectors (a `[REDACTED` mask on the same line, or redact-named utility files) grade low. Non-fixture configs and opaque secrets keep their original severities.
- Updated dependencies [892311f]
  - mcp-agentgate-core@0.67.39

## 0.67.38

### Patch Changes

- c96cedd: Advisory MCPA-2026-0095: @copilot-mcp/apex (npm) postinstall dropper — remote loader.sh piped into zsh plus an unverified staged binary, impersonating the @copilot-mcp scope (108 → 109).
- Updated dependencies [c96cedd]
  - mcp-agentgate-core@0.67.38

## 0.67.37

### Patch Changes

- ef32fd5: Round 378 precision: AG-SK-001 grades poisoning markers used as bare code identifiers (e.g. `self.conversation_history = []` in embedded example code) low, and AG-RC-001 grades curl|sh text inside detection-rule rows (list items carrying a `pattern:`/`re:`/`regex:` field, including their `message:` text) low as defensive rule data.
- Updated dependencies [ef32fd5]
  - mcp-agentgate-core@0.67.37

## 0.67.36

### Patch Changes

- d74769a: Round 377 advisories: MCPA-2026-0093 (KoboldCPP-MCP-Server / npm server-koboldai SSRF, CVE-2026-19373) and MCPA-2026-0094 (article-scraper-mcp PyPI SSRF, CVE-2026-19375) — 106 → 108.
- Updated dependencies [d74769a]
  - mcp-agentgate-core@0.67.36

## 0.67.35

### Patch Changes

- dfe38a4: Round 376 precision: AG-RC-001 recognizes deny/guard pattern tables declared by assignment (`const denyBashPatterns = [`, `DANGEROUS = [`) as deny-list data, scanning past rule-table entry fields (`name:`/`re:`/`pattern:`) to the enclosing declaration.
- Updated dependencies [dfe38a4]
  - mcp-agentgate-core@0.67.35

## 0.67.34

### Patch Changes

- 441ebf5: Round 375 fresh-corpus precision: AG-RC-001 treats `matches:`/`not_matches:` pattern-table keys as deny-list data, excludes `| python -m <module>` local-module pipes, and grades commented curl|sh in plugin bin/ executables with comment wording; AG-CL-001 skips secret-shaped URL path slugs; AG-SK-001 recognizes line-wrapped template placeholders and relative-clause "that do not tell the user" prose; AG-SS-001 recognizes `_is_link_local` guard declarations, `refused` inflections, and camelCase ssrfGuard identifiers as defensive context.
- Updated dependencies [441ebf5]
  - mcp-agentgate-core@0.67.34

## 0.67.33

### Patch Changes

- Updated dependencies [b26fa9a]
  - mcp-agentgate-core@0.67.33

## 0.67.32

### Patch Changes

- Updated dependencies [4d18a26]
  - mcp-agentgate-core@0.67.32

## 0.67.31

### Patch Changes

- 4e1a884: AG-RC-001 grades curl|sh text warnings low when the match sits in the value of an example-marked key (`bad_example:` payloads, `"examples": [...]` arrays) in non-executable files, with example-specific wording; live pipelines in executable files are unaffected.
- Updated dependencies [4e1a884]
  - mcp-agentgate-core@0.67.31

## 0.67.30

### Patch Changes

- faf6c4b: Round 371 fresh-corpus precision: AG-RC-001 grades curl|sh entries under deny/block-list keys low and masks multi-line data strings (test payload assignments, installer error-message text) in shell scripts while keeping live pipelines critical; AG-CL-001 recognizes compound example keys (bad_example:) and self-describing demo JWTs; AG-SS-001 treats safe-fetch wrapper invocations and metadata-exclusion review guidance as defensive context.
- Updated dependencies [faf6c4b]
  - mcp-agentgate-core@0.67.30

## 0.67.29

### Patch Changes

- Updated dependencies [1d9b5c9]
  - mcp-agentgate-core@0.67.29

## 0.67.28

### Patch Changes

- Updated dependencies [8c2620d]
  - mcp-agentgate-core@0.67.28

## 0.67.27

### Patch Changes

- Updated dependencies [b51b3b7]
  - mcp-agentgate-core@0.67.27

## 0.67.26

### Patch Changes

- Updated dependencies [d4b6257]
- Updated dependencies [975c1fd]
  - mcp-agentgate-core@0.67.26

## 0.67.25

### Patch Changes

- Updated dependencies [a531b93]
- Updated dependencies [78e18b2]
  - mcp-agentgate-core@0.67.25

## 0.67.24

### Patch Changes

- Republish: mcp-agentgate@0.67.23 was published with unresolved `workspace:*` dependency specifiers (published with `npm publish` instead of `pnpm publish`), making the CLI package uninstallable. 0.67.24 is the same code published correctly; the `latest` dist-tag was rolled back to 0.67.20 in the interim.
- Updated dependencies
  - mcp-agentgate-core@0.67.24

## 0.67.23

### Patch Changes

- Updated dependencies [eab7739]
  - mcp-agentgate-core@0.67.23

## 0.67.22

### Patch Changes

- Updated dependencies [6a386dc]
- Updated dependencies [ba9bab5]
  - mcp-agentgate-core@0.67.22

## 0.67.21

### Patch Changes

- Updated dependencies [8880fcb]
  - mcp-agentgate-core@0.67.21

## 0.67.20

### Patch Changes

- Updated dependencies [ede438f]
  - mcp-agentgate-core@0.67.20

## 0.67.19

### Patch Changes

- Updated dependencies [d7ac4fc]
- Updated dependencies [e05a506]
  - mcp-agentgate-core@0.67.19

## 0.67.18

### Patch Changes

- Updated dependencies [a833b47]
  - mcp-agentgate-core@0.67.18

## 0.67.17

### Patch Changes

- Updated dependencies [6c0a889]
- Updated dependencies [7ef4990]
- Updated dependencies [9ce7589]
  - mcp-agentgate-core@0.67.17

## 0.67.16

### Patch Changes

- Updated dependencies [a138203]
- Updated dependencies [4171a62]
  - mcp-agentgate-core@0.67.16

## 0.67.15

### Patch Changes

- Updated dependencies [cdf5d71]
  - mcp-agentgate-core@0.67.15

## 0.67.14

### Patch Changes

- Updated dependencies [1d76a64]
- Updated dependencies [3474434]
  - mcp-agentgate-core@0.67.14

## 0.67.13

### Patch Changes

- 0148d48: Lockfiles written by `lock` now record the real CLI version in `generatedBy`
  (e.g. `mcp-agentgate@0.67.12`) instead of the hardcoded `mcp-agentgate@0.1.0`
  left over from the first release. `generatedBy` is informational and not part
  of drift comparison, so existing lockfiles keep verifying unchanged.
- Updated dependencies [0148d48]
- Updated dependencies [3d1d7a7]
  - mcp-agentgate-core@0.67.13

## 0.67.12

### Patch Changes

- 090af4e: SARIF artifact URIs are now always valid relative references: when a scanned
  target lies outside the working directory, URIs are relativized against the
  scan target (scan) or checked directory (deps) as a fallback, and any file
  matching no base is emitted as a `file://` URI instead of a slash-leading
  relative reference (SARIF1004).
- e97955a: GitHub Actions annotations relativize absolute `file=` paths under the
  working directory so findings and drift entries map onto the PR diff when a
  target was scanned by absolute path; paths outside the workspace are left
  unchanged.
- e652db2: Advisory database: add MCPA-2026-0087 — skill-ninja-mcp-server
  skill-management tools path traversal (CVE-2026-19328), covering the npm
  package (fixed in 0.1.1) and the @iflow-mcp/aktsmm-skill-ninja-mcp-server
  republish that only ships the vulnerable 0.1.0 build (100 → 101 entries).
- Updated dependencies [090af4e]
- Updated dependencies [e652db2]
  - mcp-agentgate-core@0.67.12

## 0.67.11

### Patch Changes

- 1218f55: Agent Plugins spec manifests (a root-level `plugin.json` whose `$schema` points at agent-plugins.org) now gate plugin component scanning: their `skills/` and other component trees are text-scanned and lockable, the implicit bundled `./mcp.json` is discovered for pin/advisory checks, and inline hooks under `extensions["com.openai"].hooks` are classified by AG-SK-003. Generic bare `plugin.json` files (e.g. Jenkins plugins) never gate — the manifest is parsed and matched on its schema, not its filename.
- 04a1c31: Plugin discovery keeps descending past a bare `plugin.json` that resolves servers, so metadata-dir manifests (`.codex-plugin/` et al.) coexisting at the same root still contribute their bundled configs. AG-CL-001 also reports secret-shaped strings quietly in `test_*` / `*_test.*`-named script files, matching the existing test-path convention.
- bf03c8c: The findings table collapses 4+ rows identical except for the source config file into one row ("…and N more file(s)"), keeping reports readable when the same server config is copied across many directories. JSON/SARIF output and the summary counts still list every finding.
- Updated dependencies [1218f55]
- Updated dependencies [04a1c31]
  - mcp-agentgate-core@0.67.11

## 0.67.10

### Patch Changes

- 019c22a: Marketplace component-declaration parsing now covers Codex catalogs (`.agents/plugins/marketplace.json` and `api_marketplace.json`) and the Codex object-form local source (`{"source":"local","path":"./..."}`): entry-declared `skills`/`commands`/`agents`/`outputStyles` gate the source root even without a plugin manifest (Codex fallback-manifest semantics), and multiple catalogs in one repo are merged.
- c2f8155: Codex inline hooks-file forms are now visible to AG-SK-003: marketplace entries and plugin manifests carrying `hooks` as a single inline hooks-file object (`{ description?, hooks: { Event: [...] } }`) or a list of them are unwrapped before command classification. Discovery also follows path-form `mcpServers` on local-source marketplace entries (Codex fallback-manifest semantics), resolving refs inside the entry's source root so pin/advisory checks reach the referenced servers.
- Updated dependencies [019c22a]
- Updated dependencies [c2f8155]
  - mcp-agentgate-core@0.67.10

## 0.67.9

### Patch Changes

- ca9135f: Marketplace catalog entries with a local `source` now gate plugin component scanning: the entry's declared `skills`/`commands`/`agents`/`outputStyles` paths are followed (same resolver as plugin.json declarations) and the source root's conventional component dirs and `bin/` are scanned even when the plugin has no `plugin.json` at all (`strict: false` curated plugins).
- dc5abfc: Advisory database: add MCPA-2026-0086 — react-analyzer-mcp `analyze-project` path traversal (CVE-2026-19323), bundled database now 100 advisories.
- Updated dependencies [ca9135f]
- Updated dependencies [dc5abfc]
  - mcp-agentgate-core@0.67.9

## 0.67.8

### Patch Changes

- 953eb34: Plugin component scanning follows manifest-declared custom `commands`/`agents`/`skills` paths (files, directories, and glob patterns relative to the plugin root, per the Claude Code plugins reference), so markdown installed through non-conventional paths like `./ads/` or `./command/` is text-scanned and lockable; declarations escaping the plugin root are ignored.
- 0eeec7e: Output-style markdown is now scanned as model-facing instruction content: project-level `.claude/output-styles/*.md`, the plugin `output-styles/` component dir (manifest-gated, including marketplace `plugins/<name>/output-styles/`), and manifest-declared `outputStyles` paths — output styles inject directly into the system prompt, so poisoned styles report like poisoned skills and are lockable via `lock --skills`.
- 4820d85: Plugin `bin/` executables are now scanned (manifest-gated, any extension, binary blobs skipped): files under a plugin root's `bin/` join the Bash tool's PATH while the plugin is enabled, so AG-RC-001 treats extensionless bin scripts as executable — live `curl|sh` reports critical and dynamic code-execution primitives report medium with a plugin-bin label.
- 10b565c: AG-RC-001 flags plugin `bin/` entries that shadow core system commands (`git`, `curl`, `python`, …) on the Bash tool PATH as high — the classic PATH-hijack move; compiled binaries in plugin bin/ are no longer skipped, so name-based shadowing checks fire even when the content cannot be text-scanned.
- Updated dependencies [953eb34]
- Updated dependencies [0eeec7e]
- Updated dependencies [4820d85]
- Updated dependencies [10b565c]
  - mcp-agentgate-core@0.67.8

## 0.67.7

### Patch Changes

- 98ade17: Skill-scan standalone plugin repositories' component markdown: `commands/*.md`, `agents/*.md`, and `skills/*.md` under a directory carrying a plugin manifest (`.claude-plugin/`, `.plugin/`, `.factory-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `.goose-plugin/`) are now scanned for poisoning and pinnable via `lock --skills`. Gated on the manifest so generic `commands/`/`agents/` doc trees are unaffected.
- 9f4ec6f: AG-CL-001 treats boundary-delimited `test` and `demo` segments in secret-shaped values as placeholder markers (e.g. `xoxb-test-token` no longer reports as a hardcoded secret); real random-body tokens are unaffected.
- a863e81: The concealment-instruction injection pattern (`do not tell/show/… the user`) no longer fires on a directly quoted object (citing a phrase to avoid saying) or a same-sentence `only` alternative (selective presentation, e.g. "do not show the user the raw output; only the summary"); real concealment ("do not show the user this file") still reports critical.
- Updated dependencies [98ade17]
- Updated dependencies [9f4ec6f]
- Updated dependencies [a863e81]
  - mcp-agentgate-core@0.67.7

## 0.67.6

### Patch Changes

- bff9496: Scan the goose `.goose` project tree (skills, agents, recipes) and follow in-repo symlinks: symlinked skill files/dirs are now scanned (dir dedupe by realpath, cycle-safe; links escaping the repo are skipped). `allowed-tools` in `.goose/skills` is inert for goose and no longer reported as a grant.
- 8682ef7: Goose recipe precision: injection patterns quoted in code spans/fenced blocks/quotes inside recipe instructions now report low (quoted example) instead of critical, and a curl|sh string in recipe prose is no longer escalated as an executable launch vector (recipe-shaped YAML/JSON is prompt text; the medium text warning remains).
- 7686a07: Deterministic repo walk: directory entries are sorted, so scan/lock file ordering — and which alias path a realpath-deduped symlink tree is reported under — is stable across filesystems and platforms.
- 850fb99: Scan goose local memory files (`.goose/memory/*.txt`) for prompt poisoning and hidden Unicode (AG-SK-001) — committed memories become model context for everyone using the goose memory extension in the repo. They are also pinnable via `lock --skills`.
- 2f64bfb: Cover goose Open Plugin manifests: `.goose-plugin/plugin.json` is now walked and scanned like other plugin metadata dirs, and the Open Plugin Spec component form `mcpServers: { paths: [...], exclusive }` resolves referenced config documents (plus the plugin root's `.mcp.json` when not exclusive) for discovery, pin, and advisory checks.
- Updated dependencies [bff9496]
- Updated dependencies [8682ef7]
- Updated dependencies [7686a07]
- Updated dependencies [850fb99]
- Updated dependencies [2f64bfb]
  - mcp-agentgate-core@0.67.6

## 0.67.5

### Patch Changes

- 7b25fc5: Findings table: messages containing tokens wider than the Message column (source URLs, long package specs) now wrap mid-word instead of being truncated with "…", so the full remote-source URL of e.g. an AG-DP-007 finding stays visible. Ordinary messages keep word-boundary wrapping.
- 5f58db3: AG-SK-001 now scans string-literal `description:` fields in Copilot CLI extension files (`.github/extensions/*/extension.{mjs,cjs,js}` and plugin-shipped `com.github.copilot/extensions/`) for hidden Unicode and prompt-injection patterns — tool/canvas descriptions registered via `joinSession({tools, canvases})` are injected into the model's context, so poisoned description text is an instruction channel even when the extension code itself is benign.
- d7a7d84: Repo scans now walk the Crush `.crush/skills` project tree (one of Crush's four upstream project-skill conventions; the other three were already covered), so poisoned Crush skill files are scanned by AG-SK-001 and pinned by `lock --skills`. `allowed-tools:` frontmatter under `.crush/skills` is treated as inert (Crush's skill parser ignores it), so no AG-SK-002 noise is added.
- Updated dependencies [5f58db3]
- Updated dependencies [d7a7d84]
  - mcp-agentgate-core@0.67.5

## 0.67.4

### Patch Changes

- 1f1d957: Scan Copilot CLI extensions (`.github/extensions/<name>/extension.{mjs,cjs,js}` and plugin-shipped `com.github.copilot/extensions/`) as auto-executed startup surface: AG-RC-001 flags dynamic code-execution primitives and curl|sh launches in extension entrypoints, which run as forked Node processes on session start.
- 66a0a66: Advisory database 91 → 95: four in-the-wild npm packages that hijack local coding agents — `mangomind-agent` (rewrites the workspace OpenCode config to route model traffic through the author's endpoint, executes relay-supplied commands), `aclade-agent` (polls a hardcoded server for shell tasks, self-updates), `agenthub-ai` (autostart service driving the Claude Agent SDK from a hardcoded relay), and `claude-remote-agent` 0.1.0–0.2.0 (hardcoded default relay remote-driving a local Claude PTY session).
- ab678c3: Advisory database: add MCPA-2026-0082..0085 (@atom8n/inspector MCP Inspector impersonation reintroducing CVE-2025-49596, trimprompt obfuscated agent-shim beaconing, @addai/node remote agent-CLI harness with credential-store recon, @xiaohhhh1/canvas-agent hardcoded relay driving Codex/Claude with sandbox disabled) — 95 → 99 advisories.
- Updated dependencies [1f1d957]
- Updated dependencies [66a0a66]
- Updated dependencies [ab678c3]
  - mcp-agentgate-core@0.67.4

## 0.67.3

### Patch Changes

- 505a144: `agentgate deps` extends AG-DP-007 to npm override tables: `overrides` (including nested forms), `resolutions`, and `pnpm.overrides` entries that redirect a package to a git or URL source are now classified like other remote specifiers (unpinned git ref medium, non-registry archive URL high; full-SHA pins and registry tarball hosts exempt).
- 522b6fa: `agentgate deps` extends AG-DP-007 to lockfile-resolved remote sources: `package-lock.json` and `yarn.lock` entries whose `resolved` field points at a git remote or branch tarball (including `codeload.github.com` ref tarballs) are flagged when no manifest declares that remote source — the lockfile-poisoning shape. Commit-pinned refs, default registry hosts, and version-addressed registry-path tarballs on mirror/private registries stay silent.
- 9c7d70d: `agentgate deps` extends the lockfile-resolved AG-DP-007 check to `pnpm-lock.yaml` (v5/v6/v9): remote tarball and git-URL resolutions undeclared in any manifest are flagged like other remote sources. cnpm-style mirror tarball paths (`/name/download/[@scope/]name-version.tgz`) are recognized as version-addressed registry artifacts and stay silent, alongside the standard `/-/` form.
- 1ecc415: `agentgate deps` strips nested peer suffixes from pnpm-lock snapshot keys, so commit-pinned tarball resolutions are exempted correctly instead of reporting a false AG-DP-007 medium.
- Updated dependencies [505a144]
- Updated dependencies [522b6fa]
- Updated dependencies [9c7d70d]
- Updated dependencies [1ecc415]
  - mcp-agentgate-core@0.67.3

## 0.67.2

### Patch Changes

- c59e1d9: `agentgate deps` AG-DP-007 precision (wild-corpus sweep): also recognizes extras (`name[extra] @ url`), editable (`-e …#egg=name`), and bare-URL requirement lines (name from `#egg=` or the repo/archive path); commit-addressed forge archives (`…/archive/<40-char-sha>.zip`) are now exempt like SHA-pinned git specs.
- 2b225bf: `agentgate deps` extends AG-DP-007 to Poetry table-form dependencies: `{ git = "…", branch/tag/rev = "…" }` entries in `[tool.poetry.dependencies]`, `[tool.poetry.dev-dependencies]`, and `[tool.poetry.group.<g>.dependencies]` are classified like other remote specifiers (unpinned git ref medium, full-SHA `rev` exempt), `{ url = "…" }` entries are flagged as non-registry archive URLs (high, now including direct `.whl` wheel URLs), and git-only dependency names are no longer sent to PyPI registry lookup.
- e942cd4: `agentgate deps` extends AG-DP-007 to uv source overrides: `[tool.uv.sources]` entries that redirect a declared dependency to a git or URL source are now classified like other remote specifiers (unpinned/branch/tag git ref medium, full-SHA `rev` exempt, non-registry archive/wheel URL high), and redirected names are no longer sent to PyPI registry lookup.
- Updated dependencies [c59e1d9]
- Updated dependencies [2b225bf]
- Updated dependencies [e942cd4]
  - mcp-agentgate-core@0.67.2

## 0.67.1

### Patch Changes

- dacc4e9: Scan the two remaining Codex marketplace manifest paths: `.cursor-plugin/marketplace.json` and `.agents/plugins/api_marketplace.json` now get the same mutable-source (AG-SC-001), inline-hook (AG-SK-003), inline `mcpServers` discovery, and npm plugin advisory checks as the other marketplace catalogs.
- f10fdc0: `agentgate deps` flags dependencies installed from mutable remote sources (AG-DP-007): a git specifier without a full commit pin is medium, a non-registry archive URL is high; commit-pinned specs and registry tarball hosts are exempt. Works in `--offline` mode too.
- 599dca8: `agentgate deps` extends AG-DP-007 to Python PEP 508 direct references: `name @ git+https://…` and `name @ https://…archive.zip` requirements in `requirements*.txt` and `pyproject.toml` (including PEP 735 `[dependency-groups]`, now parsed for registry names too) are now classified like npm remote specifiers (unpinned git ref medium, non-registry archive URL high; full commit SHA exempt). Direct-URL names still count as declared, so their imports are not flagged as missing.
- Updated dependencies [dacc4e9]
- Updated dependencies [f10fdc0]
- Updated dependencies [599dca8]
  - mcp-agentgate-core@0.67.1

## 0.67.0

### Minor Changes

- 46fcb74: Cover the Codex Agent Plugins repository surface: discover MCP servers from `.codex-plugin/plugin.json` and `.cursor-plugin/plugin.json` manifests (inline `mcpServers` and sibling `.mcp.json`), scan repo plugin marketplaces at `.agents/plugins/marketplace.json` for mutable sources and inline hooks (AG-SC-001/AG-SK-003), classify inline Codex manifest hook lists, and skill-scan plugin trees under `.codex-plugin/`/`.cursor-plugin/`.

### Patch Changes

- 3565562: GitHub Actions annotations: cap at 10 per level (GitHub's per-step display limit) in severity order and add a summary annotation for the rest, instead of emitting hundreds of workflow commands that GitHub silently drops. Applies to scan/ci/deps finding annotations and lockfile drift annotations.
- 950d9b1: Advisories MCPA-2026-0074..0077: @cliphijack/santaclaude remote tmux keystroke injection, claw-subagent-service privileged self-updating IM-controlled service, claude-cup agent-driven credential inventory, code-analyzer-mcp launch-time recon + unrestricted run_command tool
- cd69235: AG-SC-001 classifies remote-source MCP server launch specs: git sources without a commit pin get git-specific advice (tags called out as movable), non-registry archive URLs (.tgz/.tar.gz/.zip) report high — the artifact behind the URL can be replaced in place with no version or provenance. Registry tarball hosts and commit-pinned specs are not flagged, and the low `-y` auto-confirm finding is only emitted alongside an unpinned spec.
- Updated dependencies [46fcb74]
- Updated dependencies [950d9b1]
- Updated dependencies [cd69235]
  - mcp-agentgate-core@0.67.0

## 0.66.0

### Minor Changes

- 1499751: Skill scanning covers Roo Code project slash commands (`.roo/commands/*.md`) and Kilo Code's newer command location (`.kilo/commands/*.md`) — poisoning and load-time command checks (AG-SK-001/003) now run on both.
- 4ef10a6: Cover the Kilo CLI (OpenCode fork) project tree: discover `kilo.json(c)` MCP configs (OpenCode schema, JSONC-tolerant) with AG-SK-002 permission checks and AG-SC-001/002/003 plugin checks; scan `.kilo`/`.kilocode` agent and mode markdown (frontmatter permissions + skill pipeline) and treat `.kilo`/`.kilocode` plugin files as startup-execution surface (AG-RC-001). Also downgrade curl|sh strings listed under deny/block-list keys to low (defensive control, not an execution vector).
- 206653d: `config convert` supports the Kilo CLI: new `kilo` client for `kilo.json(c)` (OpenCode schema); the `opencode` and `kilo` adapters are JSONC-tolerant; default-path auto-discovery splits the two Kilo surfaces by schema (`kilo` → `kilo.json(c)`, `kilocode` → mcp.json / mcp_settings.json).

### Patch Changes

- 4ef10a6: AG-SK-002 no longer flags `allowed-tools` frontmatter in Roo Code / Kilo Code command files (`.roo/commands`, `.kilo/commands`) — both hosts ignore that field (verified in upstream source), so a pasted grant is inert and was a false positive.
- 777ba35: Advisory database: 4 new entries (83 → 87) — anthropic-setup Claude Code base-URL hijack (MCPA-2026-0070, critical), remote-claude-daemon relay-driven `--dangerously-skip-permissions` execution (MCPA-2026-0071, critical), claude-token-tracker-mcp credential harvester posing as an MCP server (MCPA-2026-0072, critical), @guangnao/claude-cli concealed default-on hub relaying jobs through the local API key (MCPA-2026-0073, high).
- Updated dependencies [1499751]
- Updated dependencies [4ef10a6]
- Updated dependencies [4ef10a6]
- Updated dependencies [206653d]
- Updated dependencies [777ba35]
  - mcp-agentgate-core@0.66.0
  - mcp-agentgate-config-convert@0.14.0

## 0.65.4

### Patch Changes

- 2f4291e: Advisory database: 81 → 83. MCPA-2026-0068 — mcp-pdf-vision 1.1.0 command injection through pdfPath/sessionId reaching a pdftoppm shell exec (CVE-2026-19279, no fix, last_affected). MCPA-2026-0069 — opencode-engos-ai, an OpenCode-posing npm package whose postinstall installs an attacker-updatable non-publisher binary resolved at install time and symlinks it into /usr/bin (same campaign shape as MCPA-2026-0061; still live on npm, 1.21.8 tarball verified).
- Updated dependencies [2f4291e]
  - mcp-agentgate-core@0.65.4

## 0.65.3

### Patch Changes

- 319a411: Extend the round-277 duplicate suppression to Claude Code settings: `.claude/settings.json` / `settings.local.json` hook and command keys are named AG-SK-003 surfaces, so the generic AG-RC-001 curl|sh text warning there only duplicated the dedicated finding (observed in the wild: a settings hook installing deno via `curl | sh` reported twice).
- Updated dependencies [319a411]
  - mcp-agentgate-core@0.65.3

## 0.65.2

### Patch Changes

- e1d1188: Stop double-reporting curl|sh in Cursor hook/environment configs: `.cursor/hooks.json` and `.cursor/environment.json` are named AG-SK-003 surfaces whose command strings run through the risky-command classifier, so the generic AG-RC-001 "text contains a curl|sh pattern" warning on the same file only duplicated the more accurate finding. Wild corpus (296 real environment.json files): every flagged repo previously produced an identical medium duplicate next to the critical.
- Updated dependencies [e1d1188]
  - mcp-agentgate-core@0.65.2

## 0.65.1

### Patch Changes

- 09213e9: Advisories MCPA-2026-0066/0067: the Mini Shai-Hulud campaign compromised three popular MCP servers (@antv/mcp-server-antv 0.2.8, mcp-echarts 0.8.1, mcp-mermaid 0.5.1 — version-scoped, current releases are clean) and a malicious squat of the official Brave Search MCP server name (brave-search-mcp-server, all versions). Also add the GHSA mirror IDs of the June reference-server typosquat campaign as aliases on MCPA-2026-0009.
- Updated dependencies [09213e9]
  - mcp-agentgate-core@0.65.1

## 0.65.0

### Minor Changes

- 9a5e62d: Scan Cursor cloud-agent environment configs (`.cursor/environment.json`): the `install` script runs at Build creation and `start`/`terminals[].command` run when an agent boots, all sourced from the repo — dangerous commands are classified with the shared AG-SK-003 classifier, naming the config key. Also fix a false positive: `cp .env.example .env.local`-style template scaffolding no longer counts as reading .env secrets.

### Patch Changes

- Updated dependencies [9a5e62d]
  - mcp-agentgate-core@0.65.0

## 0.64.2

### Patch Changes

- f8149f1: Findings table shows the source config file under the target for server-scoped findings, so identical findings for the same server declared in several client configs (e.g. `.roo/mcp.json` + `.kilocode/mcp.json` + `.gemini/settings.json`) are distinguishable instead of looking like duplicate rows.
  - mcp-agentgate-core@0.64.2

## 0.64.1

### Patch Changes

- 16b2afa: Advisories MCPA-2026-0064/0065: llm-interceptor (npm MCP-server implant that self-registers in ~/.cursor/mcp.json and Claude Code hooks and exfiltrates AI-coding session transcripts) and agenttunnels (npm MCP bridge whose author-controlled endpoint can toggle off approval and push arbitrary shell commands/file writes). Both still live on npm; latest tarballs verified. Database 77 → 79.
- Updated dependencies [16b2afa]
  - mcp-agentgate-core@0.64.1

## 0.64.0

### Minor Changes

- c66555c: Kilo Code client coverage: discover project MCP configs (`.kilocode/mcp.json` + the newer `.kilo/mcp.json`) and the user-level VS Code globalStorage `mcp_settings.json`; classify `alwaysAllow`/`autoApprove` lists like Roo Code (AG-SK-002); scan Kilo project trees for poisoning — rules (`rules/`, `rules-<mode>/`, legacy `.kilocoderules`), workflows, custom modes (`.kilocodemodes`), and `system-prompt-<mode-slug>` overrides (AG-SK-001); `config convert` gains the `kilocode` client.

### Patch Changes

- Updated dependencies [c66555c]
  - mcp-agentgate-core@0.64.0
  - mcp-agentgate-config-convert@0.13.0

## 0.63.0

### Minor Changes

- 887ac7d: Scan the Cline `.cline/` project tree: `.cline/skills/**/SKILL.md` project skills are skill-scanned (AG-SK-001), and `.cline/plugins/` project plugin files (auto-loaded and executed by Cline at startup) are treated as startup exec surface by AG-RC-001 — curl|sh reports critical and dynamic code-execution primitives report medium without needing MCP markers. Previously the `.cline/` directory was not walked at all.

### Patch Changes

- 998a497: Advisory database 74 → 77: MCPA-2026-0061 opencode-optimised-toolings (malicious OpenCode plugin that replaces the opencode binary with a non-publisher build — still live on npm), MCPA-2026-0062 devplatform-react-mcp (dropper disguised as a React MCP SDK), MCPA-2026-0063 agenthub-multiagent-mcp (hardcoded C2 drives Claude Code with --dangerously-skip-permissions).
- Updated dependencies [887ac7d]
- Updated dependencies [998a497]
  - mcp-agentgate-core@0.63.0

## 0.62.1

### Patch Changes

- c77b8d8: `config convert`: `qwen-code` now uses Gemini CLI notation (Qwen Code is a Gemini CLI fork) — `httpUrl` parses as streamable HTTP and `url` as SSE, and remote servers render with the same fields; previously `httpUrl` remote servers were silently dropped.
- Updated dependencies [c77b8d8]
  - mcp-agentgate-config-convert@0.12.1
  - mcp-agentgate-core@0.62.1

## 0.62.0

### Minor Changes

- 2ed5e63: `config convert` supports five more clients with existing discovery surfaces: `factory` (Factory Droid `.factory/mcp.json`), `junie` (JetBrains Junie `.junie/mcp/mcp.json`), `qoder` (`.qoder/settings.json`), `qwen-code` (`.qwen/settings.json`) — all standard `mcpServers` notation — and `copilot-cli` (GitHub Copilot CLI `~/.copilot/mcp-config.json` / `.github/mcp.json`: `mcpServers` wrapper or bare project map, `type: local` normalized to stdio, `tools` allowlists and `timeout` warn as lossy).

### Patch Changes

- Updated dependencies [2ed5e63]
  - mcp-agentgate-config-convert@0.12.0
  - mcp-agentgate-core@0.62.0

## 0.61.0

### Minor Changes

- 5269c53: `config convert` supports `crush` (Charm): parse/render the `.crush.json` / `crush.json` `mcp` map with stdio/http/sse `type` semantics and the `disabled` flag; crush-only fields (`oauth`, `disabled_tools`, `enabled_tools`, `timeout`) warn as lossy.

### Patch Changes

- Updated dependencies [5269c53]
  - mcp-agentgate-config-convert@0.11.0
  - mcp-agentgate-core@0.61.0

## 0.60.1

### Patch Changes

- a347a97: Advisory database: add MCPA-2026-0060 — mcp-ui-probe (npm) ≤0.2.0 journey-storage path traversal (CVE-2026-19270), no fixed release (last_affected).
- Updated dependencies [a347a97]
  - mcp-agentgate-core@0.60.1

## 0.60.0

### Minor Changes

- df62f33: AG-SK-003 now classifies the Claude Code settings keys that run a command through the system shell automatically — `apiKeyHelper`, `awsAuthRefresh`, `awsCredentialExport`, and `statusLine.command` — with the shared dangerous-command classifier.

### Patch Changes

- Updated dependencies [df62f33]
  - mcp-agentgate-core@0.60.0

## 0.59.1

### Patch Changes

- 6c6e5a9: AG-RC-001 now matches only `.opencode/{plugin,plugins}/*.{ts,js}` as auto-executed OpenCode plugins — `.mjs`/`.cjs`/`.mts`/`.cts` files are not loaded by OpenCode's plugin glob and no longer get the startup-exec classification.
- Updated dependencies [6c6e5a9]
  - mcp-agentgate-core@0.59.1

## 0.59.0

### Minor Changes

- 3553120: AG-SC-001 now flags remote http(s) URLs in the OpenCode `instructions` array — the content is fetched and injected into the system prompt on every session, so the host can change it at any time (remote prompt injection / rug-pull).
- ca67218: AG-RC-001 now treats auto-executed OpenCode plugin files (`.opencode/{plugin,plugins}/*.{ts,js}`) as startup exec surface: curl|sh patterns there report critical, and dynamic code-execution primitives report medium without requiring MCP markers.

### Patch Changes

- Updated dependencies [3553120]
- Updated dependencies [ca67218]
  - mcp-agentgate-core@0.59.0

## 0.58.0

### Minor Changes

- aa57208: AG-SK-002 now interprets the deprecated OpenCode `tools` boolean map in agent/mode frontmatter and in opencode.json (top-level and per-agent), matching OpenCode's own normalization: `bash: true` → `permission.bash: allow` (high), `write`/`edit`/`patch: true` → `permission.edit: allow` (medium), `false` → deny (quiet), with explicit `permission` keys taking precedence.

### Patch Changes

- Updated dependencies [aa57208]
  - mcp-agentgate-core@0.58.0

## 0.57.0

### Minor Changes

- fdb93a7: Cover OpenCode's singular project directories: `.opencode/agent/`, `.opencode/command/`, and `.opencode/mode(s)/` markdown files are now scanned (AG-SK-001) and their `permission` frontmatter checked (AG-SK-002), matching OpenCode's own `{agent,agents}` / `{command,commands}` / `{mode,modes}` loader globs.

### Patch Changes

- Updated dependencies [fdb93a7]
  - mcp-agentgate-core@0.57.0

## 0.56.0

### Minor Changes

- 1ff33d7: Factory Droid client coverage: discover user-level `~/.factory/mcp.json` and project-level `.factory/mcp.json` (standard `mcpServers`, stdio/http/sse) through the full config rule set and advisory cross-check; classify hook commands in `.factory/hooks.json` (legacy `.factory/hooks/hooks.json`, or a `hooks` key in `.factory/settings.json`) with AG-SK-003; and scan `.factory/skills/**.md`, `.factory/commands/**.md`, and `.factory/droids/*.md` instruction files with AG-SK-001.
- e46f671: AG-SK-002 checks Factory Droid settings (`.factory/settings.json` and `settings.local.json`): dangerous `commandAllowlist` entries (shells, rm, curl, privilege escalation run without confirmation), high default autonomy (`sessionDefaultSettings.autonomyLevel: high` or legacy `autonomyMode: auto-high`), and `enableDroidShield: false` (disables secret scanning and git guardrails). The AG-SK-003 hook check also covers a `hooks` key in `settings.local.json`.
- c6fb840: Cover the Factory Droid plugin surface: discover MCP servers bundled by `.factory-plugin/` plugins (bare `mcp.json` at the plugin root, `${DROID_PLUGIN_ROOT}` path references, marketplace catalogs in `.factory-plugin/marketplace.json`), classify inline plugin/marketplace hooks (AG-SK-003), and flag plugins auto-enabled from mutable marketplace sources in `.factory/settings.json` (AG-SC-001).
- 615b65a: Google Antigravity client support: discover global `~/.gemini/config/mcp_config.json` and workspace `.agents/mcp_config.json` MCP configs (serverUrl normalized), classify `.agents/hooks.json` / `~/.gemini/config/hooks.json` hook commands (AG-SK-003), and scan workspace rules `.agents/rules/*.md` incl. legacy `.agent/rules` (AG-SK-001).
- 3755720: Scan Google Antigravity workflow files (`.agents/workflows/*.md`, legacy `.agent/workflows/*.md`) for prompt-injection/poisoning (AG-SK-001) — workflows run as /slash commands and feed trajectory-level agent instructions.
- 73acf28: `config convert` supports `antigravity` (Google Antigravity): parse/render `.agents/mcp_config.json` / `~/.gemini/config/mcp_config.json`, emitting remote servers with the official `serverUrl` field.
- 6466b7d: Scan Roo Code project custom modes (`.roomodes`, YAML or legacy JSON) for prompt-injection/poisoning (AG-SK-001) — a mode's roleDefinition/customInstructions text is injected into the system prompt for every request in that mode.
- d8bbd57: AG-SK-002 checks OpenCode agent markdown frontmatter permissions (`.opencode/agents/*.md`): catch-all `"*": allow` or `bash: allow` report high, unrestricted `edit`/`write`/`webfetch`/`websearch` allows report medium — same semantics as the existing `opencode.json` permission checks.

### Patch Changes

- 8eb30e9: Bundle advisories MCPA-2026-0028..0034: mcp-atlassian batch (unauthenticated SSRF via X-Atlassian-\*-Url headers CVE-2026-27826, DNS-rebinding TOCTOU bypass of that fix, two arbitrary server-side file reads via attachment-upload file_path — all fixed in 0.22.0) and MCP Python SDK batch (cross-session task access CVE-2026-52870, HTTP session requests served without principal verification CVE-2026-52869 — fixed 1.27.2; WebSocket transport missing Host/Origin validation CVE-2026-59950 — fixed 1.28.1).
- fee61f3: Bundle advisories MCPA-2026-0035..0044: meta-ads-mcp SSRF + auth bypass (CVE-2026-54549/54547), LangBot STDIO MCP config RCE (CVE-2026-54449), netlicensing-mcp unauthenticated server-key use (CVE-2026-54446), mcp-documentation-server unauthenticated Web UI on all interfaces (CVE-2026-54504), mcp-memory-keeper file read (CVE-2026-54561), gittensory-mcp access-control leak, phantom-audio arbitrary file write, PraisonAI unauthenticated MCP HTTP-stream default (CVE-2026-61427), and Dynatrace create_dynatrace_notebook approval-gate gap.
- 58771da: Deduplicate discovered config locations by path: a project-root `.mcp.json` reachable both as the claude-code location and via a plugin manifest's path ref (or a bare `mcp.json` doubling as a Factory plugin sibling) was scanned twice, duplicating its servers and findings.
- 7679e5c: Bundle advisories MCPA-2026-0045..0055: Serena dashboard DNS-rebinding RCE (CVE-2026-49471), Prompty JS-frontmatter execution and file-reference read (CVE-2026-53597/53598), and the Flowise 2026-08-04 critical batch (OAuth2 token-refresh leak, six RCE vectors, TTS endpoint auth gap fixed in 3.1.4).
- 6b42862: Advisory database: MCPA-2026-0056..0059 — Flowise post-sunset batch (unauthenticated OAuth2 credential refresh CVE-2026-70636, OpenAI Assistants cross-workspace IDOR CVE-2026-67622, document store missing authorization CVE-2026-67621; no fixed release — Flowise is sunset, ≤3.1.4 affected) and OpenHands resolver command injection (CVE-2026-19022, pypi openhands-ai ≤0.62.0).
- Updated dependencies [1ff33d7]
- Updated dependencies [e46f671]
- Updated dependencies [8eb30e9]
- Updated dependencies [fee61f3]
- Updated dependencies [c6fb840]
- Updated dependencies [58771da]
- Updated dependencies [7679e5c]
- Updated dependencies [615b65a]
- Updated dependencies [3755720]
- Updated dependencies [73acf28]
- Updated dependencies [6b42862]
- Updated dependencies [6466b7d]
- Updated dependencies [d8bbd57]
  - mcp-agentgate-core@0.56.0
  - mcp-agentgate-config-convert@0.10.0

## 0.55.0

### Minor Changes

- 7fd8474: Crush `crushrc` coverage: repo scans now include `crushrc`/`.crushrc` files (a Bash program Crush executes with shell privileges at startup) — source rules apply with executable-file severity (a piped remote download is critical, AG-RC-001), and risky `permissions allow` command lines (`bash` high, `edit`/`write` medium) are flagged (AG-SK-002).
- 5acac21: AG-SK-002 Crush allowed*tools classification covers scoped `tool:action` keys (e.g. `bash:execute` now reports as bash) and `mcp*<server>\_<tool>`MCP tool names whose tool part suggests shell execution, data mutation, or exfiltration (medium) — both in`crush.json` `permissions.allowed_tools`and crushrc`permissions allow` lines.

### Patch Changes

- a23207a: Advisory database: add MCPA-2026-0021 — HKUDS nanobot (PyPI `nanobot-ai`) < 0.2.1 SSRF in the `web_fetch` tool via 3xx redirects (CVE-2026-49138 / GHSA-434r-7c99-hwf3).
- 5fd9192: AG-SC-001 docker check only fires on the `docker run` / `docker container run` forms — CLI plugin subcommands like `docker mcp gateway run` no longer misreport their last word as an unpinned image.
- d44d0ca: Advisory database: 6 new entries — Dynatrace MCP Server unauthenticated HTTP tool invocation / workflow template injection / DQL injection (MCPA-2026-0022..0024, npm @dynatrace-oss/dynatrace-mcp-server, fixed 2.0.0/2.1.1) and Flowise sandbox escape RCE / CSV Agent Pyodide RCE / IPv4-mapped-IPv6 SSRF bypass (MCPA-2026-0025..0027, npm flowise + flowise-components, fixed 3.1.3).
- Updated dependencies [a23207a]
- Updated dependencies [7fd8474]
- Updated dependencies [5fd9192]
- Updated dependencies [d44d0ca]
- Updated dependencies [5acac21]
  - mcp-agentgate-core@0.55.0

## 0.54.0

### Minor Changes

- 474dfec: Goose subrecipe coverage: recipe scanning (AG-SK-001 injection/hidden Unicode, AG-SK-003 inline_python classification, AG-SC-002/003 inline_python dependency advisory checks) now gates on the documented recipe shape (title + description + instructions|prompt) for any YAML/JSON file, not just files named `recipe.yaml`/`recipe.json` — covering subrecipes referenced from a main recipe's `sub_recipes[].path` under arbitrary names (e.g. `subrecipes/security-analysis.yaml`).
- bc658b2: Goose subrecipe extension discovery: `sub_recipes[].path` references in the project-root recipe are now followed (resolved relative to the recipe's directory, per goose's own resolution; references outside the project or missing files are skipped), and the referenced subrecipes' `stdio`/`streamable_http`/`sse` extensions join the discovered server inventory for the full config rule set and advisory checks.
- 978dcc5: Goose recipe-library discovery: nested `recipe.yaml`/`recipe.json` files (any directory up to depth 4, skipping node_modules/dot-dirs) now get extension discovery like the project-root recipe, and each recipe's `sub_recipes[].path` references resolve relative to that recipe's own directory (goose's documented resolution) into subrecipe extension discovery.
- e6263a1: Crush (Charm) client support: discover MCP servers in the legacy JSON config (`~/.config/crush/crush.json`, project `.crush.json`/`crush.json` — JSONC `mcp` map with stdio/http/sse entries) and run the full config rule set plus advisory cross-checks on them; classify dangerous `hooks` event commands (AG-SK-003); flag risky `permissions.allowed_tools` pre-approvals (`bash` high, `edit`/`write` medium) (AG-SK-002).

### Patch Changes

- Updated dependencies [474dfec]
- Updated dependencies [bc658b2]
- Updated dependencies [978dcc5]
- Updated dependencies [e6263a1]
  - mcp-agentgate-core@0.54.0

## 0.53.0

### Minor Changes

- f509444: Goose recipe `inline_python` extensions (code executed via uvx for everyone who runs the recipe) are classified for dangerous idioms (AG-SK-003): shell download-and-execute strings, `exec`/`eval` of downloaded or base64-decoded content (critical), secret exfiltration via `requests.post(os.environ…)`, and credential-file reads (high).
- 49f567f: Goose recipe `inline_python` PyPI `dependencies` (installed by uvx and imported for everyone who runs the recipe) are checked against the OSV known-malware (AG-SC-002) and MCPA advisory (AG-SC-003) databases, with `name==version` pins compared against version-scoped advisories.

### Patch Changes

- 405374a: Bundled advisory database: add MCPA-2026-0018 (n8n-MCP cross-tenant workflow-version backup access, CVE-2026-54052, critical, fixed 2.56.1), MCPA-2026-0019 (n8n-MCP default-scope backup exposure in multi-tenant HTTP mode, CVE-2026-55608, medium, fixed 2.57.4), and MCPA-2026-0020 (HKUDS nanobot `enabledTools` scope bypass, CVE-2026-19244, low, PyPI `nanobot-ai` fixed 0.3.0) — 34 advisories total.
- be45212: Precision fixes from a real-corpus false-positive sweep: AG-RC-001 masks echo/printf string literals in shell scripts (help text quoting a curl|sh one-liner no longer reports; `$(…)` command substitutions stay live); AG-SS-001 reads one more surrounding line so a blocklist header comment above a metadata-IP entry is seen; AG-CL-001 treats underscore-delimited placeholder words (`sk-YOUR_OPENAI_KEY_HERE`) as placeholders; AG-TP-001 reports Trojan-Source bidi characters in test/fixture paths quietly (defensive fixtures).
- Updated dependencies [f509444]
- Updated dependencies [49f567f]
- Updated dependencies [405374a]
- Updated dependencies [be45212]
  - mcp-agentgate-core@0.53.0

## 0.52.0

### Minor Changes

- e9d150c: Cover the Open Plugin Spec's first lookup location — a bare `plugin.json` at the plugin root (repo root or a marketplace's `plugins/<name>/`): its `mcpServers` (inline or path-referenced) are discovered and advisory-checked, and inline flat-event Copilot hooks are classified via the existing shape detection. `plugin.json` files from unrelated ecosystems (Grafana, Obsidian) carry neither shape and stay quiet.
- 6a8153d: JetBrains Junie support: user-level `~/.junie/mcp/mcp.json` and project-level `.junie/mcp/mcp.json` MCP configs (shared by the IDE plugin and Junie CLI) are discovered and run through the full config rule set and advisory checks, and project guidelines (`.junie/guidelines.md`, auto-loaded into every Junie task) get AG-SK-001 injection/hidden-Unicode skill scanning.
- 783ec14: OpenHands repository customization: `.openhands/skills/**.md` and the legacy `.openhands/microagents/**.md` (auto-loaded as agent context, always or on keyword triggers) get AG-SK-001 injection/hidden-Unicode skill scanning, and the `.openhands` tree is now walked so `.openhands/setup.sh` (runs automatically at session start) is covered by the source-scan rules (AG-RC-001 et al.).
- a975ca8: Goose (Block) support: discover MCP extensions in the goose user config (`~/.config/goose/config.yaml`, Windows `%APPDATA%\Block\goose\config\config.yaml`) — `stdio` and remote (`streamable_http`/`sse`) extension types run the full config rule set plus advisory checks (goose-internal `builtin`/`platform`/`frontend`/`inline_python` types are skipped) — and scan `.goosehints` files (added to the system prompt for every request in their directory tree) for AG-SK-001 injection/hidden-Unicode poisoning.
- 3c952f3: Goose recipes: project-root `recipe.yaml`/`recipe.json` (gated on the documented recipe shape) are discovered — their `extensions` list (stdio/streamable_http/sse entries, started automatically for everyone who runs the recipe) runs the full config rule set and advisory checks — and the recipe `instructions`/`prompt`/`activities` text is scanned for prompt injection and hidden Unicode (AG-SK-001).

### Patch Changes

- Updated dependencies [e9d150c]
- Updated dependencies [6a8153d]
- Updated dependencies [783ec14]
- Updated dependencies [a975ca8]
- Updated dependencies [3c952f3]
  - mcp-agentgate-core@0.52.0

## 0.51.0

### Minor Changes

- effbcfd: Copilot CLI MCP configs: the user-level `~/.copilot/mcp-config.json` (written by `copilot mcp add` / `/mcp add`) and the project-level `.github/mcp.json` (`mcpServers` wrapper or bare top-level server map) are discovered and run through the full config rule set and advisory checks.
- 84cd735: Copilot CLI hooks: repo-level `.github/hooks/*.json` and user-level `.copilot/hooks/*.json` command hooks (both `bash` and `powershell` keys) run through the shared dangerous-command classification (AG-SK-003) — they execute automatically on lifecycle events for anyone who opens the repository in Copilot CLI.
- 50abc3f: Copilot CLI settings files (repo-level `.github/copilot/settings.json` + `settings.local.json`, user-level `.copilot/settings.json`) are now scanned: inline `hooks` commands go through the shared dangerous-command classification (AG-SK-003), and plugins auto-enabled via `enabledPlugins` from mutable `extraKnownMarketplaces` git sources report AG-SC-001 — repository settings apply to everyone who works in the repository.
- 7d20285: Copilot CLI plugin surfaces: marketplace catalogs at `.github/plugin/marketplace.json` and plugin manifests at `.plugin/plugin.json` / `.github/plugin/plugin.json` are now scanned — mutable plugin `source` entries (no `sha`/release `ref`) report AG-SC-001, inline `hooks` (flat Copilot event schema) go through the shared dangerous-command classification (AG-SK-003), and manifest `mcpServers` are discovered and advisory-checked like Claude Code plugins.
- b5ad266: Plugin LSP coverage extends to the Open Plugin Spec: `lsp-config/servers.json` files (Copilot CLI convention) are classified like `.lsp.json`, and the LSP command extractor now also reads the cross-platform `bash`/`powershell` launch-script keys — a dangerous command can hide in either platform's variant.

### Patch Changes

- 5595dbc: AG-SK-001 precision fixes from a Copilot-ecosystem corpus sweep: the exfiltration-instruction pattern now requires a sensitive target ("You MUST read the reference files" is ordinary skill-doc structure), "do not show the user X until Y" workflow gating is no longer concealment, and injection phrases quoted in double quotes as defensive examples ("ignore previous instructions") downgrade to low like inline code spans.
- Updated dependencies [effbcfd]
- Updated dependencies [84cd735]
- Updated dependencies [50abc3f]
- Updated dependencies [7d20285]
- Updated dependencies [b5ad266]
- Updated dependencies [5595dbc]
  - mcp-agentgate-core@0.51.0

## 0.50.0

### Minor Changes

- 101f737: Qwen Code agent surfaces: `hooks` in project `.qwen/settings.json` (same nested shape as Claude Code/Gemini CLI settings hooks, fire on lifecycle events) run through the shared dangerous-command classifier (AG-SK-003); `.qwen/agents/*.md` sub-agents, `.qwen/commands/**.md` custom commands (incl. deprecated `.qwen/commands/**.toml`), and `.qwen/skills`/`.qwen/commands` markdown get skill scanning (AG-SK-001 injection/hidden-Unicode + AG-SK-003 `!{...}` shell blocks).
- adf18de: Qwen Code extensions: `qwen-extension.json` manifests (project root + installed under `~/.qwen/extensions/<name>/`) are discovered and their `mcpServers` run through the full config rule set and advisory checks — extensions start these servers automatically for anyone who installs them.
- b5e2c64: Qwen Code context files: `QWEN.md`, `QWEN.local.md`, and `.qwen/rules/**.md` (auto-loaded into the model context every session) now get AG-SK-001 injection/hidden-Unicode checks and AG-SK-003 dynamic-context command classification.
- 9727d24: Copilot custom agents: `.github/agents/*.md` agent profiles with an `mcp-servers` frontmatter map (official Copilot CLI / cloud agent custom-agent format) are discovered and their servers run through the full config rule set and advisory checks — the servers start for anyone who runs the agent.

### Patch Changes

- f62fab4: Precision fixes from a flagship-repo false-positive sweep: AG-SS-001 reads surrounding comment lines (and guard/validate vocabulary) for the defensive downgrade; AG-SK-001 treats inline code spans (`...`) as quoted like fenced blocks; AG-RC-001 downgrades curl|sh matches on `#`-comment lines and ignores quoted-heredoc usage banners in shell scripts (a live match is still preferred over a commented one).
- Updated dependencies [101f737]
- Updated dependencies [adf18de]
- Updated dependencies [b5e2c64]
- Updated dependencies [f62fab4]
- Updated dependencies [9727d24]
  - mcp-agentgate-core@0.50.0

## 0.49.0

### Minor Changes

- 13e58c0: npm-distributed marketplace plugins (`source: "npm"` entries in `.claude-plugin/marketplace.json`) are now cross-checked against OSV.dev known-malware advisories and the AgentGate MCP advisory database, the same pipeline as runner-launched server packages and OpenCode plugins. Exact pinned versions are compared against version-scoped advisories.
- 305f081: Gemini CLI surfaces: extension manifests (`gemini-extension.json` at the project root or under `~/.gemini/extensions/<name>/`) are discovered and their `mcpServers` get the full config rule set + advisory checks; `hooks` in `.gemini/settings.json` (same nested shape as Claude Code settings hooks) run through the shared dangerous-command classifier (AG-SK-003).
- 3c70deb: Gemini CLI extension custom commands: `commands/**.toml` at an extension root (shipped with the extension and exposed as slash commands for everyone who installs it) now get the same skill scanning as `.gemini/commands/**.toml` — prompt-injection/hidden-Unicode checks (AG-SK-001) and dangerous `!{...}` shell-block classification (AG-SK-003).
- c17a517: Qwen Code support: MCP configs in `~/.qwen/settings.json` and project `.qwen/settings.json` are discovered (full config rule set + advisory checks), and AG-SK-002 checks project settings for `tools.approvalMode: "yolo"`/`"auto-edit"`, unscoped `permissions.allow` grants (`Bash`, `Write`/`Edit`, `WebFetch`), and `trust: true` MCP servers.

### Patch Changes

- Updated dependencies [13e58c0]
- Updated dependencies [305f081]
- Updated dependencies [3c70deb]
- Updated dependencies [c17a517]
  - mcp-agentgate-core@0.49.0

## 0.48.0

### Minor Changes

- bc2ba21: Marketplace catalog entries (`.claude-plugin/marketplace.json`) can define plugins entirely inline (`strict: false`). AgentGate now covers both inline surfaces: entry-level `mcpServers` are discovered and get the full config rule set + advisory checks, and entry-level `hooks` commands run through the shared dangerous-command classifier (AG-SK-003).
- 25f1582: AG-SC-001 marketplace source mutability now covers `npm` and `archive` plugin sources: an npm source with no version or a range (`^2.0.0`) and a zip archive with no `sha256` digest both report medium — every install fetches whatever upstream serves next. Exact npm versions and sha256-pinned archives stay clean, and each finding carries source-type-specific pin advice.

### Patch Changes

- Updated dependencies [bc2ba21]
- Updated dependencies [25f1582]
  - mcp-agentgate-core@0.48.0

## 0.47.0

### Minor Changes

- 04137c7: AG-SC-001 now checks in-repo plugin marketplace catalogs (`.claude-plugin/marketplace.json`): a plugin entry whose git-based `source` (`github`, `url`, `git-subdir`) has no `sha` and no release-style `ref` reports medium — everyone who installs the plugin gets whatever the branch points at (rug-pull exposure). Relative-path sources (plugin code inside the marketplace repo) stay clean.
- cabc1cf: AG-SK-003 now checks Claude Code plugin hooks: `type: "command"` entries in a plugin's `hooks/hooks.json` (or inline in `.claude-plugin/plugin.json`) run automatically on lifecycle events for everyone who installs the plugin, so they get the shared dangerous-command classification (remote-script pipes critical, exfiltration/credential reads high). Install instructions merely printed via `echo '…'` are no longer misclassified as pipelines (precision fix, applies to all hook surfaces).
- 1ce904f: Project-level discovery now finds MCP servers bundled by Claude Code plugins: an `.mcp.json` next to a `.claude-plugin/plugin.json` (including nested plugin roots in marketplace repos) starts automatically for everyone who enables the plugin, so its servers get the full config-level rule set and advisory checks like any other discovered config.
- 368a701: Plugin manifest `mcpServers` fields are now resolved during discovery: inline server config in `.claude-plugin/plugin.json` and config paths relative to the plugin root (string or array, `${CLAUDE_PLUGIN_ROOT}` prefix supported) both surface their servers for the full config-level rule set and advisory checks. References escaping the plugin root are ignored.
- 0d0c588: AG-SK-003 now classifies Claude Code plugin LSP server commands: `.lsp.json` (or inline `lspServers` in `.claude-plugin/plugin.json`) declares commands that run automatically after workspace trust whenever matching files are edited. Command + args go through the shared dangerous-command classification; real language servers stay clean.
- 3f2817f: AG-SK-003 now classifies Claude Code plugin monitor commands: `monitors/monitors.json` (or `experimental.monitors` / top-level `monitors` inline in the plugin manifest) declares shell commands that run as persistent unsandboxed background processes for the whole session, at the same trust level as hooks. Benign watchers like `tail -F` stay clean.
- f62ac7a: AG-SK-003 now shape-detects hook- and monitor-config JSON at non-conventional paths: plugin manifests can point `hooks` / `experimental.monitors` at arbitrary relative files, so any JSON whose structure matches the hook schema (nested `type: "command"` entries) or monitor schema (array of `{ name, command, description }`) gets its commands run through the shared dangerous-command classifier. Benign configs carry no risky patterns and stay clean.

### Patch Changes

- efda0fc: AG-AM-001 resolves shell parameter-expansion defaults (`${VAR:-default}`) in remote server URLs before analysis: when the variable is unset the default is the effective endpoint, so those servers now get real HTTPS/auth checks instead of an "unparseable URL" low finding.
- Updated dependencies [04137c7]
- Updated dependencies [cabc1cf]
- Updated dependencies [1ce904f]
- Updated dependencies [368a701]
- Updated dependencies [0d0c588]
- Updated dependencies [3f2817f]
- Updated dependencies [efda0fc]
- Updated dependencies [f62ac7a]
  - mcp-agentgate-core@0.47.0

## 0.46.0

### Minor Changes

- f864350: The shared auto-executing hook/skill command classifier now models PowerShell download-and-execute idioms: `irm`/`iwr`/`Invoke-RestMethod`/`Invoke-WebRequest` piped to `iex`/`Invoke-Expression`, and the `iex (irm …)` call form, report critical — the same as `curl | sh`. Plain downloads (`iwr … -OutFile`) stay clean. The skill-side curl|sh pattern also no longer spans plain newlines.
- e50efbc: AG-SK-002 now checks named `[permissions.<name>]` profile tables in Codex project config (`.codex/config.toml`): a filesystem `"write"` grant on `/`, `/**`, `~`, or `$HOME` reports high (the whole filesystem or home directory becomes writable for anyone who trusts the project), and `network.enabled = true` inside a profile reports medium (sandboxed egress). Scoped path grants, deny rules, and disabled networking stay clean.

### Patch Changes

- 3d175bc: Two false-positive fixes from a flagship-repo sweep: the AG-RC-001 curl|sh pattern no longer spans plain newlines (only backslash continuations), so a pipe in a later unrelated statement is not attributed to an earlier download command; the AG-SK-001 concealment pattern no longer matches "do not tell the user to <verb> ..." phrasing guidance. Real single-line and continuation-line curl|sh launches and genuine concealment instructions still report.
- f26240d: Codex hook scanning also classifies Windows-only command overrides (`commandWindows`/`command_windows`) — a dangerous command can no longer hide behind a benign cross-platform `command`.
- Updated dependencies [3d175bc]
- Updated dependencies [f26240d]
- Updated dependencies [f864350]
- Updated dependencies [e50efbc]
  - mcp-agentgate-core@0.46.0

## 0.45.0

### Minor Changes

- 6c34295: AG-SK-003 checks Kiro agent hook files (`.kiro/hooks/*.kiro.hook`, when/then schema): `then.type: "runCommand"` actions execute automatically on IDE events (file save, prompt submit, tool use) for anyone who opens the project, so their commands get the shared dangerous-command classification (remote-script pipes critical, data-exfil/credential reads high). Disabled hooks and `askAgent` prompt actions are not flagged.
- cd7e9ff: AG-SK-001 checks Kiro agent hook askAgent prompts (`.kiro/hooks/*.kiro.hook`): the prompt text is injected automatically on IDE events (file save, prompt submit, tool use), so hidden Unicode characters and prompt-injection patterns (instruction override, concealment, exfiltration instructions) report critical. Disabled hooks and benign guard/review prompts are not flagged.
- ad4eb87: AG-SK-002 checks Codex project-scoped config overrides (`.codex/config.toml`, loaded for anyone who trusts the project): `sandbox_mode = "danger-full-access"` and `default_permissions = ":danger-full-access"` report high (no filesystem/network sandbox), `approval_policy = "never"` and `sandbox_workspace_write.network_access = true` report medium. Safe modes (`read-only`/`workspace-write`, interactive approval policies) are not flagged.
- 70dcd07: AG-SK-003 checks Codex project hook files (`.codex/hooks.json`): command hooks run on lifecycle events (SessionStart, PreToolUse, UserPromptSubmit, …) for anyone who trusts the project's `.codex/` layer, so their commands get the shared dangerous-command classification (remote-script pipes critical, data-exfil/credential reads high). Local policy/lint scripts stay clean.
- c91b6b0: AG-SK-003 also checks inline `[hooks]` tables in Codex project config (`.codex/config.toml`): they use the same event schema as `hooks.json`, so dangerous lifecycle hook commands (remote-script pipes, data-exfil/credential reads) report identically wherever they are declared.

### Patch Changes

- Updated dependencies [6c34295]
- Updated dependencies [cd7e9ff]
- Updated dependencies [ad4eb87]
- Updated dependencies [70dcd07]
- Updated dependencies [c91b6b0]
  - mcp-agentgate-core@0.45.0

## 0.44.0

### Minor Changes

- e65057f: AG-SC-001 flags Claude Code plugins auto-enabled from mutable marketplaces: `.claude/settings.json` entries in `enabledPlugins` whose marketplace (`extraKnownMarketplaces`) has a git-based source without a `sha` or release-style `ref` report medium — anyone who trusts the folder is prompted to install plugin hooks, MCP servers, and skills fetched from whatever the branch points at. Local directory/file sources, release-pinned sources, and non-enabled plugins stay clean.

### Patch Changes

- 5d90f0a: AG-SS-001 downgrades cloud-metadata-endpoint references on blocking/defensive lines (block/reject/deny/SSRF vocabulary on the matching line) from high to low — security-guidance prompts and SSRF-guard code reference the endpoint to forbid it, not to fetch it. Plain references in non-test paths still report high.
- Updated dependencies [e65057f]
- Updated dependencies [5d90f0a]
  - mcp-agentgate-core@0.44.0

## 0.43.0

### Minor Changes

- 454045e: AG-SC-001 flags unpinned OpenCode npm plugins: packages in the `plugin` array of `opencode.json`/`opencode.jsonc` are auto-installed by Bun and executed at startup, so specs without an exact version report medium (rug-pull / compromised-release exposure). Local plugin file paths and pinned specs stay clean.
- 04d7276: OpenCode npm plugins get known-malware advisory checks: packages in the `plugin` array of `opencode.json` are now cross-checked against OSV.dev known-malware advisories (AG-SC-002) and the AgentGate MCP advisory database (AG-SC-003), the same as MCP server packages launched via npx-style runners — because they are auto-installed and executed at startup.

### Patch Changes

- e6aa49b: AG-SC-001 also flags OpenCode git-URL plugin specs without a commit pin (`pkg@git+https://…` with no `#<sha>`): they fetch and execute whatever the branch points at on every startup. Commit-pinned git specs stay clean.
- Updated dependencies [454045e]
- Updated dependencies [e6aa49b]
- Updated dependencies [04d7276]
  - mcp-agentgate-core@0.43.0

## 0.42.0

### Minor Changes

- 7817ca4: AG-SK-003 checks Cursor project hooks (`.cursor/hooks.json`): hook commands run automatically around agent-loop stages (sessionStart, beforeShellExecution, afterFileEdit, …) — including in Cursor cloud agents — and get the same dangerous-command classification as Claude Code, Kiro, and Amazon Q hooks. Guard scripts and local formatters stay clean.

### Patch Changes

- Updated dependencies [7817ca4]
  - mcp-agentgate-core@0.42.0

## 0.41.0

### Minor Changes

- 6f8b2bd: AG-SK-003 checks Kiro project hooks (`.kiro/hooks/*.json`): command actions that pipe remote scripts into a shell report critical, and ones that send data out or read credential material report high — they run automatically on session events for everyone who opens the project. Local lint/setup commands, agent prompt actions, and protective guard hooks stay clean. The shared credential-read pattern now requires a read verb before the credential path, so guard hooks (and Claude hooks) that merely pattern-match paths like `id_rsa` no longer report.
- 22a7524: AG-SK-003 checks Amazon Q CLI agent hooks (`hooks` field in `.amazonq/cli-agents/*.json`): commands run automatically at lifecycle trigger points (agentSpawn, userPromptSubmit, preToolUse, postToolUse) get the same dangerous-command classification as Claude Code and Kiro hooks — remote-script pipes report critical, data exfiltration and credential reads report high. Benign context commands stay clean.
- 6a25cc3: AG-SK-003 checks VS Code workspace tasks (`.vscode/tasks.json`): `"runOn": "folderOpen"` task commands run automatically when the folder opens in a trusted workspace, so remote-script pipes report critical and data exfiltration / credential reads report high. AG-SK-002 flags `task.allowAutomaticTasks: "on"` in workspace settings (medium) — it removes the one prompt before folderOpen tasks execute. Benign watch/build tasks and run-on-demand tasks stay clean.

### Patch Changes

- Updated dependencies [6f8b2bd]
- Updated dependencies [22a7524]
- Updated dependencies [6a25cc3]
  - mcp-agentgate-core@0.41.0

## 0.40.0

### Minor Changes

- 4b4af41: AG-SK-002 flags Zed `tool_permissions` MCP tool keys (`mcp:<server>:<tool>`) defaulted to `"allow"` as medium when the tool name looks destructive (exec/sql/write/delete/deploy, …). Read-only-named MCP allows stay clean — rug-pull risk is covered by the tool-surface lockfile.
- 5d3929f: AG-SK-002 checks Kiro project custom agents (`.kiro/agents/*.json` and `*.md` frontmatter) for embedded `permissions.rules`: a catch-all `allow` is high for `shell`/`all`/`builtin` and medium for `filesystem`/`fs_write`, `mcp`, and `web_fetch`. Scoped matches and `fs_read` stay clean; a catch-all `deny` for the same capability suppresses the allow. Kiro agent Markdown bodies are also scanned as instruction files.

### Patch Changes

- ea2e802: Two real-corpus false-positive fixes: AG-CL-001's PEM pattern now requires key material after the header, so detector code quoting `-----BEGIN ... PRIVATE KEY-----` (e.g. VS Code's SSH key parser) no longer reports; AG-SK-001's exfiltration pattern no longer spans lines, so adjacent benign bullet points (e.g. "read the PR description" / "key files") no longer combine into a critical.
- Updated dependencies [4b4af41]
- Updated dependencies [5d3929f]
- Updated dependencies [ea2e802]
  - mcp-agentgate-core@0.40.0

## 0.39.0

### Minor Changes

- 29f7e47: AG-SK-002 checks Cursor CLI project permission configs (`.cursor/cli.json`): `Shell(*)` and `Mcp(*:*)` in `permissions.allow` are high; catch-all `Write(**)`, `WebFetch(*)`, and whole-server `Mcp(server:*)` are medium. Scoped tokens stay clean and a matching `permissions.deny` entry suppresses the allow.
- f08158e: AG-SK-002 flags Cursor CLI `permissions.allow` tokens that pre-approve `Read`/`Write` on secret-shaped paths (`.env`, `.pem`, `.key`, `.p12`/`.pfx`, secrets, credentials, `id_rsa`) as medium — pre-approved credential access. Scoped code-path tokens stay clean and `permissions.deny` still takes precedence.

### Patch Changes

- ad64a92: AG-SS-001 reports metadata-endpoint references in test/fixture paths (`tests/`, `__tests__/`, `*.test.*`, `*.spec.*`, `examples/`, `fixtures/`, `mocks/`) as low instead of high — they are usually fixtures for the SSRF protection under test, mirroring how AG-CL-001 treats secret-shaped strings in test trees.
- Updated dependencies [ad64a92]
- Updated dependencies [29f7e47]
- Updated dependencies [f08158e]
  - mcp-agentgate-core@0.39.0

## 0.38.0

### Minor Changes

- 6052760: AG-SK-002 checks `allowedTools` in Amazon Q CLI project agent files (`.amazonq/cli-agents/*.json`): a catch-all `"*"` is high, unscoped `execute_bash`/`use_aws` are high, unscoped `fs_write` is medium, and whole-MCP-server allows (`"@server"`, `"@server/*"`) are medium. Tools scoped by a matching `toolsSettings` allowlist stay clean.
- 04fe726: AG-SK-002 checks the `chat.tools.edits.autoApprove` glob map in VS Code workspace settings: a catch-all (`"**/*": true`) with no re-denied sensitive paths, or `true` on a sensitive path (`.env`, `.vscode`, `.github`, keys/secrets), is medium. The documented safe pattern (catch-all plus `false` re-denies) stays clean.

### Patch Changes

- 9a5f31a: AG-SK-002 expands Amazon Q `allowedTools` glob entries (`fs_*`, `*_bash`, `fs_?ead`) against the built-in tool names, so wildcards matching `execute_bash`, `use_aws`, or `fs_write` are flagged like the exact names instead of escaping the check.
- Updated dependencies [6052760]
- Updated dependencies [9a5f31a]
- Updated dependencies [04fe726]
  - mcp-agentgate-core@0.38.0

## 0.37.0

### Minor Changes

- ac4598f: AG-SK-002 checks the `chat.tools.terminal.autoApprove` map in VS Code workspace settings: a catch-all regex rule (`"/.*/": true`) is high, and auto-approving a command from VS Code's own default-deny list (`rm`, `curl`, `chmod`, shells, `sudo`, ...) is medium. Scoped safe commands stay clean.
- 2b0f2e7: AG-SK-002 checks Zed project settings (`.zed/settings.json`): the legacy `agent.always_allow_tool_actions: true` is high, and in `agent.tool_permissions` a global `default: "allow"` is high, per-tool `default: "allow"` is high for `terminal` and medium for file-write/delete/fetch tools. `.zed` is walked for settings only.

### Patch Changes

- Updated dependencies [ac4598f]
- Updated dependencies [2b0f2e7]
  - mcp-agentgate-core@0.37.0

## 0.36.0

### Minor Changes

- 0f6d6ba: AG-SK-002 checks Roo Code project MCP configs (`.roo/mcp.json`): a wildcard `"*"` in a server's `alwaysAllow`/`autoApprove` list (high) and auto-approved destructive-looking tools such as `execute_sql`/`apply_migration` (medium) are flagged.
- 0329425: AG-SK-002 checks VS Code workspace settings (`.vscode/settings.json`): `chat.tools.global.autoApprove: true` (or the legacy `chat.tools.autoApprove`) is flagged high — it bypasses every chat tool approval for anyone opening the project. `.vscode` is walked for settings/MCP configs only.

### Patch Changes

- Updated dependencies [0f6d6ba]
- Updated dependencies [0329425]
  - mcp-agentgate-core@0.36.0

## 0.35.0

### Minor Changes

- 95d5dcf: AG-SK-002 also checks OpenCode project configs (`opencode.json` / `opencode.jsonc`): a catch-all `"permission": "allow"` (high) and per-tool `bash`/`edit`/`write`/`webfetch` rules whose effective action is `"allow"` (high/medium) are flagged. `.jsonc` files are now walked as source.
- 86446ba: AG-SK-002's OpenCode check also covers `websearch: "allow"` and per-agent `agent.<name>.permission` blocks — both found in real public configs (alumnium, cloudflare/telescope).
- 60468c9: AG-SK-002 checks Gemini CLI project settings (`.gemini/settings.json`): bare `run_shell_command` (high), `write_file`/`replace`/`web_fetch`/`google_web_search` (medium) in `tools.allowed`, and `general.defaultApprovalMode: "auto_edit"` (medium).
- f301689: AG-SK-002 flags `trust: true` on MCP servers in Gemini CLI project settings (medium) — trusted servers bypass all tool call confirmations for everyone opening the project.

### Patch Changes

- Updated dependencies [95d5dcf]
- Updated dependencies [86446ba]
- Updated dependencies [60468c9]
- Updated dependencies [f301689]
  - mcp-agentgate-core@0.35.0

## 0.34.0

### Minor Changes

- 7d4168f: AG-SK-002 flags `enableAllProjectMcpServers: true` in Claude Code settings files (medium) — it auto-approves every MCP server defined in project `.mcp.json` files without review.

### Patch Changes

- Updated dependencies [7d4168f]
  - mcp-agentgate-core@0.34.0

## 0.33.0

### Minor Changes

- 51b4fba: AG-SK-003 also checks Claude Code hooks in `.claude/settings.json` / `.claude/settings.local.json`: `type: "command"` hooks that pipe remote downloads into a shell (critical), exfiltrate data, or read credential material (high) are flagged — they run automatically on session events for everyone opening the project.

### Patch Changes

- f4fa24f: AG-SK-002 parses Claude Code settings files tolerantly (JSONC comments and trailing commas), matching what Claude Code itself accepts — real-world settings with trailing commas are no longer silently skipped.
- Updated dependencies [f4fa24f]
- Updated dependencies [51b4fba]
  - mcp-agentgate-core@0.33.0

## 0.32.0

### Minor Changes

- 6aed86c: Skill scanning and `lock --skills` cover legacy VS Code chat-mode files (`.github/chatmodes/*.chatmode.md`).
- db7fa32: AG-SK-002 also checks Claude Code settings files (`.claude/settings.json`, `.claude/settings.local.json`): dangerous unscoped `permissions.allow` grants (bare `Bash`, unscoped `Write`/`Edit`/`WebFetch`/`WebSearch`) and `permissions.defaultMode: "bypassPermissions"` are flagged.

### Patch Changes

- Updated dependencies [6aed86c]
- Updated dependencies [db7fa32]
  - mcp-agentgate-core@0.32.0

## 0.31.0

### Minor Changes

- 0c9d836: Skill scanning and `lock --skills` cover VS Code custom agent files (`.github/agents/*.md` — `*.agent.md` and legacy `*.chatmode.md`).

### Patch Changes

- Updated dependencies [0c9d836]
  - mcp-agentgate-core@0.31.0

## 0.30.1

### Patch Changes

- af60bc2: AG-SS-001 no longer reports high-severity SSRF for Kubernetes/Cilium network-policy manifests that reference the cloud metadata IP (these rules typically block egress to it); such hits are now low with a verify-the-rule hint.
- Updated dependencies [af60bc2]
  - mcp-agentgate-core@0.30.1

## 0.30.0

### Minor Changes

- ec0827e: Discover Amazon Q CLI named custom agents — every `~/.aws/amazonq/cli-agents/*.json` (global) and `.amazonq/cli-agents/*.json` (workspace) agent file's `mcpServers` are now scanned.
- d324bde: `config convert` supports `amazonq` (Amazon Q Developer, standard `mcpServers` notation at `.amazonq/mcp.json`) as source and target.

### Patch Changes

- Updated dependencies [ec0827e]
- Updated dependencies [d324bde]
  - mcp-agentgate-core@0.30.0
  - mcp-agentgate-config-convert@0.9.0

## 0.29.0

### Minor Changes

- 9cde860: Discover Amazon Q Developer MCP configs (`~/.aws/amazonq/mcp.json`, `~/.aws/amazonq/default.json`, project `.amazonq/mcp.json` / `.amazonq/default.json`), and scan + `lock --skills` its project rules (`.amazonq/rules/**.md`).

### Patch Changes

- Updated dependencies [9cde860]
  - mcp-agentgate-core@0.29.0

## 0.28.0

### Minor Changes

- 44973bb: Skill/instruction scanning (and `lock --skills`) now covers GitHub Copilot path-specific instructions (`.github/instructions/**.instructions.md`) and prompt files (`.github/prompts/*.prompt.md`).

### Patch Changes

- Updated dependencies [44973bb]
  - mcp-agentgate-core@0.28.0

## 0.27.1

### Patch Changes

- 3b52d30: Repo scanning no longer runs source-level rules over CI files under `.github/` (only `copilot-instructions.md` is read there) — fixes false-positive AG-RC-001 criticals on legitimate `curl | bash` install steps in GitHub workflows.
- Updated dependencies [3b52d30]
  - mcp-agentgate-core@0.27.1

## 0.27.0

### Minor Changes

- 2a359b9: Skill/instruction scanning (and `lock --skills`) now covers Roo Code rules — `.roo/rules/` and mode-specific `.roo/rules-<mode>/` directories, plus the single-file `.roorules` / `.roorules-<mode>` fallbacks.
- 5baca9c: Skill/instruction scanning (and `lock --skills`) now covers root instruction files read verbatim by many agents: the agents.md standard (`AGENTS.md`/`AGENT.md`, nested files included), `CLAUDE.md`, `GEMINI.md`, Zed's `.rules`, and GitHub Copilot's `.github/copilot-instructions.md`.

### Patch Changes

- Updated dependencies [2a359b9]
- Updated dependencies [5baca9c]
  - mcp-agentgate-core@0.27.0

## 0.26.0

### Minor Changes

- a0b661c: Skill/instruction scanning (and `lock --skills`) now covers Kiro steering files (`.kiro/steering/*.md`, auto-loaded into every chat session in the workspace).

### Patch Changes

- Updated dependencies [a0b661c]
  - mcp-agentgate-core@0.26.0

## 0.25.0

### Minor Changes

- 84d246b: Discover Trae (ByteDance) project-level MCP configs (`.trae/mcp.json`, standard `mcpServers` notation) and support `trae` as a source/target in `config convert`.
- 7aad2ea: Skill/instruction scanning (and `lock --skills`) now covers Trae project rules — `.trae/rules/*.md` plus the older `.trae/project_rules.md` / `.trae/user_rules.md` conventions.
- 506e6b9: Discover Qoder MCP configs — user-level `~/.qoder/settings.json` plus project-level `.qoder/settings.json` and `.qoder/settings.local.json` (standard `mcpServers` map; Qoder's project `.mcp.json` was already covered).

### Patch Changes

- Updated dependencies [84d246b]
- Updated dependencies [7aad2ea]
- Updated dependencies [506e6b9]
  - mcp-agentgate-core@0.25.0
  - mcp-agentgate-config-convert@0.8.0

## 0.24.1

### Patch Changes

- 14a5a0e: Also discover LM Studio's `~/.cache/lm-studio/mcp.json` — current builds write the MCP config there (on macOS and Windows too) even though the documented location is `~/.lmstudio/mcp.json`.
- Updated dependencies [14a5a0e]
  - mcp-agentgate-core@0.24.1

## 0.24.0

### Minor Changes

- 67a0bcf: Discover LM Studio MCP configs (`~/.lmstudio/mcp.json`, Cursor-style `mcpServers` notation, same path on every platform) and support `lmstudio` as a source/target in `config convert`.

### Patch Changes

- Updated dependencies [67a0bcf]
  - mcp-agentgate-core@0.24.0
  - mcp-agentgate-config-convert@0.7.0

## 0.23.2

### Patch Changes

- d1640b0: `agentgate auth login <server-name>` now warns when the server config has static `headers` configured, since those take precedence over cached OAuth tokens during live scans.
- c02b53d: AG-CL-001 no longer reports secret-shaped placeholder values (e.g. `xoxb-your-bot-token`, `sk-my-anthropic-api-key`) found in source files or command-line args — the placeholder check that already covered env/header values now applies everywhere the secret patterns are matched.
- Updated dependencies [c02b53d]
  - mcp-agentgate-core@0.23.2

## 0.23.1

### Patch Changes

- 58464b5: Harden the OAuth token store: a corrupted or non-object `oauth.json` is treated as empty instead of crashing later on a bad shape, and rewriting the store re-tightens file permissions to `0600` even if they were loosened externally.
  - mcp-agentgate-core@0.23.1

## 0.23.0

### Minor Changes

- 6807ece: Live scans of remote (`url`) MCP servers now transparently use OAuth tokens cached by `agentgate auth login`. Precedence: configured static `headers` → cached OAuth tokens → anonymous. 401/403 hints now point at `agentgate auth login <name>` (and distinguish rejected cached tokens from missing credentials). CI stays non-interactive — a browser flow is never started during scans.

### Patch Changes

- Updated dependencies [6807ece]
  - mcp-agentgate-core@0.23.0

## 0.22.0

### Minor Changes

- f773bba: New `agentgate auth login|status|logout` commands: log in to a remote (`url`) MCP server via its OAuth 2.1 flow (metadata discovery, dynamic client registration or `--client-id`, PKCE, loopback browser callback). Tokens are stored per server origin in the agentgate config dir (`0600`), never in the project tree. Live scans do not consume these tokens yet — that lands in the next round; CI remains strictly non-interactive.

### Patch Changes

- mcp-agentgate-core@0.22.0

## 0.21.1

### Patch Changes

- 44f6d1e: Remote live-scan auth failures (HTTP 401/403) now explain how to fix them: if no `headers` are configured the error shows the exact `"headers": { "Authorization": "Bearer …" }` snippet to add; if headers were configured it names the rejected header(s). Auth errors also no longer trigger a pointless SSE fallback attempt.
- 209957f: `scan --live`, `lock`, `diff`, and `ci` now connect to servers with a concurrency of 4 instead of strictly one at a time. Measured on 6 stdio servers with 500 ms startup each: `lock` 4.2 s → 1.6 s. Lockfile output is byte-identical (ordering preserved); per-server errors are still reported individually.
- Updated dependencies [44f6d1e]
  - mcp-agentgate-core@0.21.1

## 0.21.0

### Minor Changes

- a3c6fe8: `scan --live`, `lock`, `diff`, and `ci` now connect to remote MCP servers (`url` configs) via Streamable HTTP with an SSE fallback for legacy servers, passing configured `headers`. Remote tool surfaces are scanned for poisoning and pinned in the lockfile just like stdio servers; previously every remote server was skipped as "analyzed statically only".

### Patch Changes

- dc74040: `scan` and `ci` accept `--fail-on never` (like `deps`): `scan --fail-on never` reports without gating, `ci --fail-on never` gates on lockfile drift only.
- e0fbced: `deps` no longer flags imports resolved through a `deno.json`/`deno.jsonc` import map as hallucinated npm packages: map keys (e.g. JSR `@std/*` specifiers) are treated as declared. Fixes 3 critical false positives on honojs/hono.
- d00c2ce: `deps` Python import scanning: well-known import names map to their PyPI distributions (yaml→pyyaml, git→gitpython, PIL→pillow, …), Python 3.14 stdlib modules (annotationlib, compression) are recognized, and any directory containing .py files counts as a local namespace package. Fixes 3 critical false positives on tiangolo/fastapi.
- Updated dependencies [e0fbced]
- Updated dependencies [d00c2ce]
- Updated dependencies [a3c6fe8]
  - mcp-agentgate-core@0.21.0

## 0.20.0

### Minor Changes

- 0935dc3: `deps` now gates by default: `--fail-on` defaults to `high` (matching `ci`), so a bare `agentgate deps` exits 1 on hallucinated/typosquatted/malicious dependencies instead of silently passing. Use `--fail-on never` to report without gating.
- 24011e5: `scan --live` correlates a server's `includeTools` allowlist against its actual tool surface: entries matching no live tool report a low AG-OP-001 finding (stale or typoed allowlist entries scope nothing).

### Patch Changes

- Updated dependencies [24011e5]
  - mcp-agentgate-core@0.20.0

## 0.19.0

### Minor Changes

- cad6f07: Discover Warp MCP configs (`~/.warp/.mcp.json`, project `.warp/.mcp.json`) and the generic other-agents convention (`~/.agents/.mcp.json`, project `.agents/.mcp.json`); `config convert` supports `warp` (standard `mcpServers`, `working_directory` ↔ cwd).
- 3402ce9: Parse the `includeTools` allowlist on skill-declared MCP servers (Amp convention) and report a low AG-OP-001 finding when a skill-declared server omits it, since the skill then exposes the server's full tool surface.

### Patch Changes

- f02e947: Table footer doc links show per-rule finding counts (`AG-SK-002 ×131 → …`), ordered by frequency, so dominant rules are visible without scrolling the table.
- Updated dependencies [cad6f07]
- Updated dependencies [3402ce9]
  - mcp-agentgate-core@0.19.0
  - mcp-agentgate-config-convert@0.6.0

## 0.18.1

### Patch Changes

- ba9bac9: Report a config visited by both the repo walk and client discovery (e.g. a skill's `mcp.json`) once in `scannedFiles` instead of twice.
  - mcp-agentgate-core@0.18.1

## 0.18.0

### Minor Changes

- 754deef: Discover Amp (Sourcegraph) MCP configs — the `amp.mcpServers` key in `~/.config/amp/settings.json` and workspace `.amp/settings.json` — and support `amp` in `config convert` (14 clients total).
- f9485e4: Extract MCP servers declared by agent skills — a sibling `mcp.json` or the `mcpServers` frontmatter field of `SKILL.md` (Amp convention, frontmatter shadows the sibling file) under `.agents/skills/`, `.claude/skills/`, and `~/.config/amp/skills/` — and run the full MCP config rule set over them.

### Patch Changes

- Updated dependencies [754deef]
- Updated dependencies [f9485e4]
  - mcp-agentgate-core@0.18.0
  - mcp-agentgate-config-convert@0.5.0

## 0.17.0

### Minor Changes

- c6c0d55: Skill/instruction scanning (AG-SK rules) and `lock --skills` now cover Continue.dev workspace rules (`.continue/rules/*.md`), which are joined verbatim into the model's system message.

### Patch Changes

- b506be0: Skill scanning and `lock --skills` also cover Continue.dev workspace prompts (`.continue/prompts/*.md`), verified against Continue's own workspace-block loader source.
- Updated dependencies [c6c0d55]
- Updated dependencies [b506be0]
  - mcp-agentgate-core@0.17.0

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
