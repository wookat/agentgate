# GAP-ROUND-2 — Production benchmark loop, round 2 (MCP `scan` line)

Date: 2026-08-05. Round 1 benchmarked the `deps` line against npm audit /
osv-scanner / socket CLI. Round 2 targets the capability those tools do **not**
have — MCP scanning — so the reference tool is the strongest MCP scanner that
exists today, plus a real large repository for correctness and performance:

- **mcp-scan / Snyk Agent Scan** (`uvx mcp-scan`), both the current
  `v0.5.16` (renamed to Snyk Agent Scan) and the last vendor-neutral
  `v0.3.4` — actually installed and run, output recorded below.
- **microsoft/vscode** (`--depth 1` clone, 13,639 scanned files) as a
  real-world large-repo correctness/performance subject.
- A deliberately malicious local MCP server (`evil-server.mjs`: a poisoned
  `read_notes` description, a `run_command` shell tool, a metadata-endpoint
  `fetch_url`) as the true-positive fixture.

## What the reference tool does well (observed)

### Consent before starting servers — `mcp-scan v0.5.16`

```
$ uvx mcp-scan scan ./mcp.json
Agent Scan will launch stdio MCP servers as subprocesses to inspect their tools.
Review each command below and confirm whether Agent Scan may start it.

Stdio MCP servers (require consent):
  [1] evil-demo
      config : /home/ubuntu/round1/mcp/mcp.json
      command: node /home/ubuntu/round1/mcp/evil-server.mjs
      Allow Agent Scan to start 'evil-demo'? [y/N]: Declined: 'evil-demo' will not be started.

Proceeding with 0 of 1 stdio servers. Skipped: 1.
Tip: pass --dangerously-run-mcp-servers to skip these prompts
```

This is the single best UX idea in the tool: scanning a config **executes**
whatever command it names, so it asks first, prints the exact command line, and
defaults to "no".

### Honest, per-target degradation — `mcp-scan v0.3.4`

```
$ uvx mcp-scan==0.3.4 scan ./mcp.json
● Scanning ./mcp.json found 1 server
└── evil-demo
    ├── tool read_notes  [X001]: could not reach analysis server …
    ├── tool run_command [X001]: could not reach analysis server …
    └── tool fetch_url   [X001]: could not reach analysis server …
```

Every tool is listed even when analysis fails, with an error code, so the user
can see *what was and was not checked*. Also notable: the entire verdict is
produced by a **cloud** service (`mcp.invariantlabs.ai`, now a Snyk token), so
without network/token the tool has nothing to say. AgentGate is fully local —
that is our structural advantage, and it only counts if our local rules are
actually accurate.

## Our behaviour before this round (same fixtures, same commands)

| # | Reference behaviour | AgentGate before | Gap | Prio |
|---|---|---|---|---|
| 1 | Asks consent, prints the exact command, defaults to no | `scan --live` spawned every configured stdio server silently | We execute untrusted commands from a config file with no confirmation — in a security tool that is the wrong default | **P0** |
| 2 | Never claims a clean bill for servers it did not start | `agentgate scan` (no `--live`) printed `✔ No findings.` for a config whose server is blatantly malicious | Silent under-scanning: the user reads "clean" when the tool surface was never looked at | **P0** |
| 3 | Analysis quality is the product | `--live` on `evil-server.mjs` found 4 findings and **missed** `run_command` ("Executes arbitrary shell commands on the host system.") and the exec+network combo | Rule regexes matched only bare infinitives (`\b(execute\|run)\b`), so ordinary third-person tool descriptions — the way virtually all MCP tools are written — slipped through | **P0** |
| 4 | Findings are actionable, not noise | Repo scan of vscode: **478 findings**, incl. 285 from `exec(` matching every `regex.exec(...)`, 128 from a bare `child_process` mention, 4 "critical" `curl\|sh` hits inside prompt strings, 31 "hidden Unicode" hits that were emoji ZWJ / Nerd-Font glyphs / BOM | At real repo scale the signal-to-noise ratio was unusable — a reviewer would stop reading | **P0** |
| 5 | One clear message when the network is gone | `deps` with no network printed 46 rows of "could not verify … fetch failed" | Degradation was correct but drowned the report | P1 |
| 6 | Hidden-character reports point at a location | "Source file contains hidden/invisible Unicode characters" — no codepoint, no line | Not actionable | P1 |
| 7 | Publishes performance characteristics | No measured numbers on a large repo | Cannot claim CI-suitability without data | P1 |
| 8 | `snyk`-grade cross-platform matrix | Linux + Node 22/24 in CI only | macOS/Windows still unverified | P2 |

## Fixes in this round (all in this PR)

- **P0 consent (#1)**: `scan --live` now lists every stdio command it is about to
  start and asks `Start them? [y/N]`; non-interactive sessions (CI, pipes) never
  start anything unless `--yes` is passed, and the report records
  `live scan declined: …`. `lock`/`diff`/`ci` are unchanged — connecting *is*
  their explicit purpose.
- **P0 no silent clean bill (#2)**: a static scan that finds stdio servers now
  warns `N stdio server(s) were not started … re-run with --live`, on stderr and
  in `warnings[]` of the JSON report (frozen contract snapshot updated).
- **P0 recall (#3)**: new `verbAlt()` helper generates the English verb forms
  (`executes/executing/executed`, `runs/running/ran`, `reads/reading`,
  `sends/sending/sent`, …) used by the RCE, overprivileged and SSRF rules.
- **P0 precision (#4)**: `exec(` no longer matches `.exec(`; a bare
  `child_process` mention needs a nearby `exec/spawn` call; `curl|sh` in a
  non-executable file is medium ("usually documentation or a prompt") instead of
  critical; emoji ZWJ sequences, flag tag sequences, Nerd-Font private-use
  glyphs and BOMs are no longer "hidden instructions"; zero-width characters are
  reported at `low`, while Trojan-Source bidi overrides and tag characters stay
  `high`.
- **P1 (#5)**: when the registry is unreachable for *every* package, `deps`
  emits one warning instead of one finding per package.
- **P1 (#6)**: hidden-character findings now carry the codepoint and line
  (`… (U+202E) at line 41`).

## Measured results (same commands, before → after)

Malicious fixture, `agentgate scan --config mcp.json --live --yes`:

```
before: 4 finding(s): 4 critical            # run_command and the exec+network combo missed
after:  6 finding(s): 4 critical, 1 high, 1 medium
        AG-RC-001 evil-demo/run_command  executes arbitrary commands/code with no documented sandboxing
        AG-OP-001 evil-demo              combines capabilities that can execute commands and reach the network
```

Static scan of the same config, no `--live`:

```
before: ✔ No findings.
after:  warning: 1 stdio server(s) were not started, so their live tool surface
        (descriptions, schemas) was not inspected — re-run with --live to catch tool poisoning
```

`--live` without consent in a non-interactive shell:

```
agentgate --live starts these stdio servers as subprocesses to read their tool surface:
  node /home/ubuntu/round1/mcp/evil-server.mjs
non-interactive session: re-run with --yes to allow starting them (skipping live scan)
```

microsoft/vscode, `agentgate scan . --format json` (13,639 files):

| | before | after |
|---|---|---|
| findings | 478 | 89 |
| critical | 4 (all `curl\|sh` inside prompt text) | 0 |
| high | 41 | 10 (all `AG-CL-001`, in a secret-filter test fixture) |
| wall time | 1.46 s | 1.50 s |
| peak RSS | — | 116 MB |

Every removed finding was manually inspected; the four "criticals" were strings
in `chatToolRiskAssessmentService.ts` documenting *that* `curl … | bash` is
dangerous, and the 285 `exec(` hits were `RegExp.prototype.exec` calls.

`deps` with the network namespace removed (`unshare -rn`):

```
before: 46 finding(s): 46 info   (one "could not verify … fetch failed" row per package)
after:  warning: registry unreachable (fetch failed): 46 package(s) could not be verified
        — re-run with network access or use --offline for name-shape checks only
        ✔ No findings.
```

Robustness re-checks: missing target → `error: target not found: /nope`, exit 2;
malformed config → `failed to parse …: Unexpected token 'o'`, exit 2; no stack
traces in either case.

## Honest conclusion — are we as good as the best MCP scanner?

**Detection**: on a local basis, yes and arguably better. mcp-scan cannot say
anything at all without a Snyk token and network access; AgentGate produced six
substantiated findings on the malicious fixture entirely offline, plus the
lock/diff/ci drift gate that mcp-scan's toolset does not offer at all.

**Where we are still worse:**

- mcp-scan's verdicts come from an LLM/analysis backend, so it can catch
  poisoned descriptions that no regex anticipates. Our rules remain pattern
  based — better recall this round, but still bounded by the pattern list.
- We have no equivalent of its cross-origin/tool-shadowing analysis across
  *different* servers in one config.
- No advisory database to compare a server against known-bad published servers
  (round 3 candidate).
- macOS/Windows are still documentation-only; CI covers Linux with Node 22/24.
- The remaining 67 `AG-RC-001 medium` hits on vscode are technically true
  ("this file uses a dynamic code-execution primitive") but low value at repo
  scale; a future round should scope repo scans to MCP-relevant files by default.

## Round 3 plan

1. Cross-server analysis in one config (tool-name shadowing, duplicate tool
   names across servers, description references to other servers' tools).
2. Scope repo scans to MCP-relevant files by default, with an opt-out, to kill
   the remaining `AG-RC-001 medium` noise.
3. Advisory feed for known-bad MCP servers/packages, wired into `scan` and
   `deps` like npm audit's advisory links.
4. macOS/Windows verification (or an explicit, tested support statement).
