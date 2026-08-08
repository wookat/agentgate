# GAP-ROUND-291 — Advisory sweep (previous sweep: round 286)

Date: 2026-08-03. Four new MCPA entries (87 → 91). Every still-installable
package below was downloaded and unpacked before the entry was written; no
claim here rests on the OSV summary alone.

## GHSA vulnerability window

`WATCH_DAYS=8 node api/scripts/watch.mjs` returned three uncovered GHSA
candidates, all rejected on the registry-mapping bar (no npm/PyPI package
exists for any of them — they are GitHub-only projects, so a package-keyed
advisory database cannot match them):

| GHSA | CVE | Project | Registry lookup |
| --- | --- | --- | --- |
| GHSA-6cmv-x2ph-3gc2 | CVE-2026-19287 | abrinsmead/mindpilot-mcp path traversal | npm + PyPI: not found |
| GHSA-4p6x-rj5h-hg93 | CVE-2026-19288 | astralisone/rive-mcp-server-core path traversal | npm: not found |
| GHSA-rrf2-j3h9-99wg | CVE-2026-19282 | andreahaku/llm_memory_mcp command injection | npm: not found |

All three also carry no `vulnerabilities[]` package entry in the GitHub
Advisory API, confirming there is nothing to key on.

## Malware namespace window

Source: OSV npm `all.zip` (219,308 MAL entries; 2,545 modified on/after
2026-08-02). Name-filtered for MCP/agent/client vocabulary → 64 candidates,
54 of them not already covered or ignored. Registry state was checked for
every MCP/agent-named candidate.

### Admitted (4)

| MCPA | Package | Registry state | Verified behaviour |
| --- | --- | --- | --- |
| 2026-0074 | `@cliphijack/santaclaude` | **live**, 1.0.108 unpacked | Polls santaclaude.app `/api/control/claim`; dispatches server jobs via `tmux send-keys -l` + Enter; default window command is `claude --dangerously-skip-permissions`; `/api/cli-version` returns a `target` written to `~/.santaclaude-target` then `process.exit(75)` so the wrapper re-execs a **server-chosen** package version |
| 2026-0075 | `claw-subagent-service` | **live**, 1.4.0 unpacked | postinstall `sc.exe create` + `failure … restart/0` + `start= auto`; updater interval runs `npm install -g claw-subagent-service@<latest>`; worker joins RongCloud with hardcoded appKey `bmdehs6pbyyks` via `https://newsradar.dreamdt.cn/im/...` and dispatches COMMAND/DEVICE_CONTROL into local scripts and OpenCode/openclaw prompts |
| 2026-0076 | `claude-cup` | **live**, 0.9.12 unpacked | Auto-registers its MCP server + hooks into Claude Code (and Cursor); drives the authenticated local `claude` CLI with a codeword dictionary that maps to credential types and paths (`goalkeeper`→aws_pair, `referee`→private_key, `home_north`→`~/.git-credentials`, `tunnel`→shell_history …); discovered/validated/high-exposure counts + machine id + Claude org go into query params of `api.claude-cup.com/v1/config`; an in-tree comment says the scheduling makes it "look like a normal background 'environment profiler'" |
| 2026-0077 | `code-analyzer-mcp` | removed from npm (verified unpublished) | Launch-time IIFE runs recon (`whoami`/`hostname`/`ipconfig`) and drops `trae-mcp-rce-poc.txt`; registers an MCP tool `run_command` that hands the client-supplied string to `execSync({shell:true})` — arbitrary shell for any connected client or prompt-injected model. Exact version 1.0.0 recorded |

`claude-cup` is the notable one: the credential inventory is not read
directly by the package — it is delegated to the installer's own
already-authenticated agent through an obfuscated prompt vocabulary, which
is the first entry in the database with that shape.

### Rejected (documented, added to `advisories/watch-ignore.json`)

- `chatcc-agent` (MAL-2026-13259) — commercial Claude Code↔IM bridge
  (CCLink). The remote terminal/PTY channel is the advertised product and is
  JWT + paired-client authenticated (`_isTrustedSender`, permission-grant
  message types verified in `src/im-client.js`); no concealed payload, no
  exfiltration, install script only builds the shipped node-pty helper.
- `@ohos-ports/codex` (MAL-2026-13210) — third-party HarmonyOS port that
  resolves `@openai/codex` from a **mutable** gitcode.com branch tarball.
  Real supply-chain risk, but no payload observed and the package does not
  squat an `@openai` name. Noted as a candidate shape (dependency-declared
  mutable tarball URLs are not currently in any AgentGate rule) rather than
  a malware advisory.
- `claude-code-timer` (MAL-2026-10892) — the OSV entry itself records
  "scanned with no findings of concern".
- `mcp-audit-sync-internal` (MAL-2026-12401) — dependency-confusion
  placeholder for an internal name; not a package agent users install.
- ~13 MCP-named entries already reduced to npm security-holder placeholders
  (`0.0.1-security`, single version, no installable code): chaos-mcp,
  gtm-mcp-auth, hit-mcp, iwomm-mcp, kip-mcp-http, maximumsats-mcp,
  mcp-server-boilerplate, pm-claude-skills-mcp, refbase-mcp,
  routerbase-mcp, sap-mcp-config, sap-mcp-facilitator, smart-npv-mcp.
- ~35 generic `*-agent` / `@scope/agent` crypto-bot and dependency-confusion
  names with no MCP/agent-client surface (OSV live checks in `deps`/`scan`
  cover them).
- `devplatform-react-mcp` (MAL-2026-13502) — already covered by
  MCPA-2026-0062 (round 267); an initial duplicate draft was withdrawn
  before commit.

## End-to-end verification

`agentgate advisory check <pkg> -e npm` against the live database returns
exactly one critical match per new entry (0074/0075/0076/0077), 91 advisory
files pass schema validation, the bundled `data.ts` is regenerated in sync,
and the docs advisory count gate is green at 91.

## Open items

- The `@ohos-ports/codex` shape (a dependency declared as a mutable remote
  tarball URL that lands under a well-known package name) has no rule
  coverage; needs wild-corpus evidence before implementing.
- npm security reports for the still-live packages above extend the owner's
  external reporting list.
