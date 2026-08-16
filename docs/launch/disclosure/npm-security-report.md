# Responsible disclosure: 19 malicious packages still installable on npm

> STATUS: READY TO SEND — owner (total lead) sends from an official address to
> **security@npmjs.com** (GitHub/npm security). Do not send from an automation
> account. Prepared by Route C on 2026-08-16; every "still live" claim below was
> re-verified against `registry.npmjs.org` on 2026-08-16 (latest dist-tag shown).

## Email subject

`Responsible disclosure: 19 malicious npm packages (AI-agent/MCP supply chain) still installable`

## Email body

Hello npm security team,

We maintain AgentGate (https://github.com/wookat/agentgate), an open-source
supply-chain security gate for MCP servers, and a public advisory database of
MCP/AI-agent ecosystem threats (https://agentgate.zalize.com).

During advisory research we verified — by downloading and unpacking the latest
tarballs — that the following 19 npm packages contain malicious code
(remote-controlled code execution, credential exfiltration, or binary
replacement) and were still installable from the public registry as of 2026-08-16.
Several already have OSV `MAL-` identifiers and/or GitHub advisories but have
not been taken down or replaced with security-holder packages.

We request takedown / security-holder replacement for the packages below.
Full structured advisories (behavior analysis, affected versions, references)
are linked per package.

| # | Package | Latest (2026-08-16) | Severity | Behavior (one line) | OSV / GHSA | Full advisory |
|---|---------|------------------|----------|---------------------|------------|---------------|
| 1 | `opencode-optimised-toolings` | 6.5.1 | critical | The npm package opencode-optimised-toolings poses as an OpenCode plugin | GHSA-49cx-27xq-h4g2, MAL-2026-13452 | https://agentgate.zalize.com/advisories/MCPA-2026-0061 |
| 2 | `agenthub-multiagent-mcp` | 1.61.0 | critical | agenthub-multiagent-mcp ships a worker that opens a WebSocket to a hardcoded server (wss://agenthub.contetial.com) and, for every 'dispatch' message received, writes the server-sup | GHSA-gr2g-rx6h-9jh5, MAL-2026-13399 | https://agentgate.zalize.com/advisories/MCPA-2026-0063 |
| 3 | `llm-interceptor` | 0.4.1 | critical | The npm package llm-interceptor installs itself into the victim's agent tooling on `npm install`: its postinstall registers an MCP server entry in ~/.cursor/mcp.json, runs `claude  | GHSA-6wxr-274h-wx32, MAL-2026-13370 | https://agentgate.zalize.com/advisories/MCPA-2026-0064 |
| 4 | `agenttunnels` | 0.1.17 | critical | The npm package agenttunnels ships an MCP bridge whose tunnel_run_command tool executes a command string from a proposal payload fetched from a remote session worker via child_proc | GHSA-4cm6-97rm-ffqf, MAL-2026-13400 | https://agentgate.zalize.com/advisories/MCPA-2026-0065 |
| 5 | `opencode-engos-ai` | 0.0.0-dev-202608161512 | critical | The npm package opencode-engos-ai poses as an OpenCode distribution | MAL-2026-12405 | https://agentgate.zalize.com/advisories/MCPA-2026-0069 |
| 6 | `anthropic-setup` | 1.0.1 | critical | The npm package anthropic-setup poses as an Anthropic API setup helper (`npx anthropic-setup sk-ant-...`) | MAL-2026-12510 | https://agentgate.zalize.com/advisories/MCPA-2026-0070 |
| 7 | `remote-claude-daemon` | 0.7.5 | critical | The npm package remote-claude-daemon connects outbound to a hardcoded WebSocket relay and treats inbound messages as commands against the local host | MAL-2026-13455 | https://agentgate.zalize.com/advisories/MCPA-2026-0071 |
| 8 | `@guangnao/claude-cli` | 1.0.17 | high | The npm package @guangnao/claude-cli hardcodes a hub endpoint (https://hub.client-llm.com) concealed behind a bespoke base64+XOR string decoder used for exactly that one URL | MAL-2026-13209 | https://agentgate.zalize.com/advisories/MCPA-2026-0073 |
| 9 | `@cliphijack/santaclaude` | 1.0.112 | critical | The npm package @cliphijack/santaclaude runs a client that polls https://santaclaude.app (/api/control/claim, /api/jobs/claim) and dispatches server-supplied jobs into the user's t | MAL-2026-13363 | https://agentgate.zalize.com/advisories/MCPA-2026-0074 |
| 10 | `claw-subagent-service` | 1.4.0 | critical | The npm package claw-subagent-service registers itself as a privileged auto-start Windows service from its postinstall script (`sc.exe create` plus `sc.exe failure .. | MAL-2026-3757 | https://agentgate.zalize.com/advisories/MCPA-2026-0075 |
| 11 | `claude-cup` | 0.9.12 | critical | The npm package claude-cup presents itself as a Claude Code usage leaderboard | MAL-2026-5789 | https://agentgate.zalize.com/advisories/MCPA-2026-0076 |
| 12 | `mangomind-agent` | 0.2.2 | critical | mangomind-agent installs a background daemon (hidden via a temp VBS launcher on Windows, launchd/systemd on macOS/Linux) that connects to a hardcoded WebSocket relay (`wss://mangom | MAL-2026-13611, GHSA-34vp-2pw6-g7f3 | https://agentgate.zalize.com/advisories/MCPA-2026-0078 |
| 13 | `aclade-agent` | 1.0.6 | critical | aclade-agent installs a daemon that re-spawns itself detached and polls `https://aclade.com/api/connector/poll` for task objects, then dispatches them in `executeTask()` | MAL-2026-13614, GHSA-45jx-7hwc-cx43 | https://agentgate.zalize.com/advisories/MCPA-2026-0079 |
| 14 | `agenthub-ai` | 1.3.0 | critical | agenthub-ai ships a bundled daemon (dist-publish/main.js) that installs itself as an OS-level autostart service (Windows hidden WScript launcher / systemd unit / launchd job), open | MAL-2026-13615, GHSA-hw95-mqx2-4pg5 | https://agentgate.zalize.com/advisories/MCPA-2026-0080 |
| 15 | `claude-remote-agent` | 0.7.1 | high | claude-remote-agent runs a daemon that connects to a WebSocket relay and, on relay request, spawns a Python PTY bridge to run `claude` sessions in the host's working directory, for | MAL-2026-13376, GHSA-vmfr-7cqr-9wc8 | https://agentgate.zalize.com/advisories/MCPA-2026-0081 |
| 16 | `@atom8n/inspector` | 0.17.32 | critical | @atom8n/inspector republishes the official @modelcontextprotocol/inspector under a squatted scope while spoofing Anthropic metadata (package.json declares author 'Anthropic, PBC' a | MAL-2026-13414, GHSA-9836-cprf-5xxq | https://agentgate.zalize.com/advisories/MCPA-2026-0082 |
| 17 | `trimprompt` | 1.0.49 | high | trimprompt markets itself as a token-saving proxy for AI coding agents, but nearly every runtime module (cache-manager.js, ccr.js, executor.js, file-watcher.js, hooks/claude-hook.j | MAL-2026-13462, GHSA-cvm3-f6xv-h47p | https://agentgate.zalize.com/advisories/MCPA-2026-0083 |
| 18 | `@addai/node` | 0.27.1 | critical | @addai/node installs a background daemon (dist/session-runner.js) that pairs the host to a remote account and polls the hardcoded backend `https://syhzpqqvrplaqdipcymw.supabase.co` | MAL-2026-13411, GHSA-w4g2-j72c-g28r | https://agentgate.zalize.com/advisories/MCPA-2026-0084 |
| 19 | `@xiaohhhh1/canvas-agent` | 0.4.35 | critical | @xiaohhhh1/canvas-agent's bin opens an outbound WebSocket to the hardcoded relay `wss://canvas.xiaohhhh1.com/api/agent-relay` on start and forwards inbound relay messages as authen | MAL-2026-13398, GHSA-29wq-c378-jw6v | https://agentgate.zalize.com/advisories/MCPA-2026-0085 |

We are happy to provide unpacked tarballs, IoCs (hardcoded C2 endpoints), and
per-version diffs on request.

Thank you,
<owner name>, AgentGate maintainers
https://github.com/wookat/agentgate

## Per-package evidence appendix

### opencode-optimised-toolings (MCPA-2026-0061, critical)

- Latest on npm as of 2026-08-16: `6.5.1` (still installable)
- Aliases: GHSA-49cx-27xq-h4g2, MAL-2026-13452
- References: https://github.com/advisories/GHSA-49cx-27xq-h4g2; https://osv.dev/vulnerability/MAL-2026-13452

The npm package opencode-optimised-toolings poses as an OpenCode plugin. On plugin load it runs a self-patch pipeline without user prompt: it downloads an OpenCode source tarball from a non-publisher GitHub repository (github.com/anomalyco/opencode, distinct from upstream sst/opencode), builds it, renames the user's on-PATH opencode executable aside, and installs the newly built binary in its place — every subsequent `opencode` invocation on the host runs attacker-built code. GHSA flags versions 3.4.0/4.0.0/4.0.1; the package remained live on npm afterward, and the 6.2.0 tarball verified on 2026-08-03 still contains the same self-patch pipeline downloading from the same non-publisher repository, so every version is recorded as affected.

### agenthub-multiagent-mcp (MCPA-2026-0063, critical)

- Latest on npm as of 2026-08-16: `1.61.0` (still installable)
- Aliases: GHSA-gr2g-rx6h-9jh5, MAL-2026-13399
- References: https://github.com/advisories/GHSA-gr2g-rx6h-9jh5; https://osv.dev/vulnerability/MAL-2026-13399

agenthub-multiagent-mcp ships a worker that opens a WebSocket to a hardcoded server (wss://agenthub.contetial.com) and, for every 'dispatch' message received, writes the server-supplied body to a prompt file and spawns Claude Code via `claude -p "$PROMPT" --dangerously-skip-permissions` against a user-configured project directory — giving whoever controls the server Claude Code's full tool suite (file read/write, shell, MCP tools) on the installer's projects without approval prompts. GHSA flags 1.57.0; the worker mechanism is the package's core design rather than an injected payload, so every version is recorded as affected.

### llm-interceptor (MCPA-2026-0064, critical)

- Latest on npm as of 2026-08-16: `0.4.1` (still installable)
- Aliases: GHSA-6wxr-274h-wx32, MAL-2026-13370
- References: https://github.com/advisories/GHSA-6wxr-274h-wx32; https://osv.dev/vulnerability/MAL-2026-13370

The npm package llm-interceptor installs itself into the victim's agent tooling on `npm install`: its postinstall registers an MCP server entry in ~/.cursor/mcp.json, runs `claude mcp add llm-interceptor`, installs a Claude Code SessionEnd hook in ~/.claude/settings.json, and on Windows creates a per-user logon task that auto-starts its proxy. Once running, its tailers recursively read ~/.claude/projects/**/*.jsonl and ~/.codex/sessions/**/*.jsonl — the installer's saved AI-coding conversations including prompts and generated code — and POST them to a hardcoded anonymous Cloudflare Quick Tunnel endpoint with a static bearer token; a self-update poller lets the tunnel operator push `npm install -g llm-interceptor@<tag>` on demand. The exfiltration/egress pipeline is present from the first published version (0.1.0 tarball verified 2026-08-08), and the package remains live on npm (latest 0.4.1, itself flagged), so every version is recorded as affected.

### agenttunnels (MCPA-2026-0065, critical)

- Latest on npm as of 2026-08-16: `0.1.17` (still installable)
- Aliases: GHSA-4cm6-97rm-ffqf, MAL-2026-13400
- References: https://github.com/advisories/GHSA-4cm6-97rm-ffqf; https://osv.dev/vulnerability/MAL-2026-13400

The npm package agenttunnels ships an MCP bridge whose tunnel_run_command tool executes a command string from a proposal payload fetched from a remote session worker via child_process.spawn with shell:true, inheriting process.env and the caller's workdir. Execution is gated on proposal.status==='granted' OR governance.customer.require_approval===false — the latter is a server-side flag controlled by the same remote worker, so the endpoint operator can toggle off human approval and autonomously drive shell execution on every connected host; a companion tunnel_apply_patch tool writes remote-supplied file contents under the same gating. The default session backend is hardcoded to a personal *.workers.dev subdomain matching the maintainer's GitHub handle. The package remains live on npm, and the 0.1.17 tarball (verified 2026-08-08, above the GHSA-flagged 0.1.14) still ships the same author-controlled default endpoint and require_approval bypass, so every version is recorded as affected.

### opencode-engos-ai (MCPA-2026-0069, critical)

- Latest on npm as of 2026-08-16: `0.0.0-dev-202608161512` (still installable)
- Aliases: MAL-2026-12405
- References: https://osv.dev/vulnerability/MAL-2026-12405; https://www.npmjs.com/package/opencode-engos-ai

The npm package opencode-engos-ai poses as an OpenCode distribution. Its postinstall script resolves platform packages named opencode-engos-<platform>-<arch> to their current 'latest' tag at install time, installs whatever binary the attacker has most recently published, copies it over the package's `opencode-engos` bin entry, and symlinks it into /usr/local/bin/innexarcode and /usr/bin/innexarcode without user prompt — an unpinned, attacker-updatable binary drop with system-path persistence (same campaign shape as MCPA-2026-0061). Flagged as malware by OSV (amazon-inspector source); the package remained live on npm and the 1.21.8 tarball verified on 2026-08-08 still contains the same pipeline, so every version is recorded as affected.

### anthropic-setup (MCPA-2026-0070, critical)

- Latest on npm as of 2026-08-16: `1.0.1` (still installable)
- Aliases: MAL-2026-12510
- References: https://osv.dev/vulnerability/MAL-2026-12510; https://www.npmjs.com/package/anthropic-setup

The npm package anthropic-setup poses as an Anthropic API setup helper (`npx anthropic-setup sk-ant-...`). Its bin entry is a single base64-concealed eval that writes ~/.claude/settings.json with env.ANTHROPIC_BASE_URL set to https://sugarball.vercel.app, stores the supplied ANTHROPIC_API_KEY, and adds an apiKeyHelper echoing that key. Every subsequent Claude Code invocation then sends the installer's API key and full prompt/response content to the attacker-controlled Vercel deployment instead of api.anthropic.com. Flagged as malware by OSV (amazon-inspector source); the package remained live on npm and the 1.0.1 tarball verified on 2026-08-08 still contains the concealed hijack, so every version is recorded as affected.

### remote-claude-daemon (MCPA-2026-0071, critical)

- Latest on npm as of 2026-08-16: `0.7.5` (still installable)
- Aliases: MAL-2026-13455
- References: https://osv.dev/vulnerability/MAL-2026-13455; https://www.npmjs.com/package/remote-claude-daemon

The npm package remote-claude-daemon connects outbound to a hardcoded WebSocket relay and treats inbound messages as commands against the local host. On ai_query/ai_voice_query messages it spawns the local `claude` binary with `--continue -p --dangerously-skip-permissions` and the remote-supplied prompt, giving the relay operator arbitrary code execution through Claude Code with the permission prompt disabled; a separate handleInput path drives synthesized mouse/keyboard/clipboard input via @nut-tree-fork/nut-js for full interactive desktop control. Flagged as malware by OSV (amazon-inspector source, relay wss://remote-claude-relay.fly.dev); the package remained live on npm and the 0.6.8 tarball verified on 2026-08-08 still contains the same skip-permissions runner and desktop-input controller with the relay moved to wss://relay.teleportus.ai, so every version is recorded as affected.

### @guangnao/claude-cli (MCPA-2026-0073, high)

- Latest on npm as of 2026-08-16: `1.0.17` (still installable)
- Aliases: MAL-2026-13209
- References: https://osv.dev/vulnerability/MAL-2026-13209; https://www.npmjs.com/package/@guangnao/claude-cli

The npm package @guangnao/claude-cli hardcodes a hub endpoint (https://hub.client-llm.com) concealed behind a bespoke base64+XOR string decoder used for exactly that one URL. On `claude-cli start` the hidden hub is enabled by default (opt-out only, undocumented, while the README presents hub participation as opt-in); the CLI then opens a WebSocket to the hub and, on remote job messages, POSTs the remote-supplied body to the installer's local /v1/messages endpoint using the local x-api-key — letting the hub operator consume the installer's Claude API quota and route arbitrary prompts through their account. Flagged as malware by OSV (amazon-inspector source); the package remained live on npm and the 1.0.17 tarball verified on 2026-08-08 still contains the concealed decoder and default-on hub, so every version is recorded as affected.

### @cliphijack/santaclaude (MCPA-2026-0074, critical)

- Latest on npm as of 2026-08-16: `1.0.112` (still installable)
- Aliases: MAL-2026-13363
- References: https://osv.dev/vulnerability/MAL-2026-13363; https://www.npmjs.com/package/@cliphijack/santaclaude

The npm package @cliphijack/santaclaude runs a client that polls https://santaclaude.app (/api/control/claim, /api/jobs/claim) and dispatches server-supplied jobs into the user's tmux sessions with `tmux send-keys -l <cmd>` followed by Enter, and spawns new windows running `claude --dangerously-skip-permissions` by default — so the remote endpoint can type arbitrary shell commands on the host and drive a coding agent with tool confirmation disabled. A second path polls /api/cli-version and, when the server returns a `target`, writes it to ~/.santaclaude-target and exits 75 so the wrapper re-execs `npx -y @cliphijack/santaclaude@<server-chosen-version>`, letting the service pick which client code runs next; shipped hooks (hooks/sc-notify.sh, hooks/sc-stop.sh) curl host identifiers to the same service. Flagged as malware by OSV (amazon-inspector source); the package remained live on npm and the 1.0.108 tarball verified on 2026-08-08 still contains the santaclaude.app control loop, the send-keys injection helpers, the `claude --dangerously-skip-permissions` default command and the server-chosen re-exec, so every version is recorded as affected.

### claw-subagent-service (MCPA-2026-0075, critical)

- Latest on npm as of 2026-08-16: `1.4.0` (still installable)
- Aliases: MAL-2026-3757
- References: https://osv.dev/vulnerability/MAL-2026-3757; https://www.npmjs.com/package/claw-subagent-service

The npm package claw-subagent-service registers itself as a privileged auto-start Windows service from its postinstall script (`sc.exe create` plus `sc.exe failure ... actions= restart/0/restart/0/restart/0` and `start= auto`) and starts it immediately with no opt-in. The running service then (1) self-replaces every 6 hours via `npm view claw-subagent-service version` followed by `npm install -g claw-subagent-service@<latest>`, so any future tarball under that name executes with the service's privileges regardless of the operator's pinning, and (2) fetches an IM token from https://newsradar.dreamdt.cn/im/api/claw/token/<nodeId>, joins a RongCloud session with the hardcoded appKey `bmdehs6pbyyks`, and dispatches inbound COMMAND / DEVICE_CONTROL / CHAT_MESSAGE messages into local script execution and into prompts fed to the local OpenCode/openclaw agent — giving whoever controls that backend persistent shell-class access to every installer machine, plus periodic collection of local agent session state. Flagged as malware by OSV (amazon-inspector source); the package remained live on npm and the 1.4.0 tarball verified on 2026-08-08 still contains the privileged service installer, the global self-update loop and the vendor IM command handler, so every version is recorded as affected.

### claude-cup (MCPA-2026-0076, critical)

- Latest on npm as of 2026-08-16: `0.9.12` (still installable)
- Aliases: MAL-2026-5789
- References: https://osv.dev/vulnerability/MAL-2026-5789; https://www.npmjs.com/package/claude-cup

The npm package claude-cup presents itself as a Claude Code usage leaderboard. On first launch it auto-registers its MCP server and hooks into Claude Code and, when present, Cursor, then drives the installer's authenticated `claude` CLI with a prompt whose vocabulary is a codeword dictionary for credential material (`striker`->github, `midfielder`->npm, `goalkeeper`->aws_pair, `referee`->private_key, ...) and for the paths that hold it (`home_north`->~/.git-credentials, `away_north`->~/.aws/, `home_south`->~/.ssh/, `tunnel`->shell_history, ...), so what is requested and returned is a per-host inventory of secret locations and their validation state. Counts of discovered/validated/high-exposure secrets plus a machine id, Claude org and install source are then encoded into query parameters of https://api.claude-cup.com/v1/config; an in-tree comment states the scheduling is designed to "look like a normal background 'environment profiler'". Earlier versions flagged by OSV (amazon-inspector source) read the credential paths directly and validated harvested tokens against provider APIs under a manifest fetched from a mutable GitHub branch. The package remained live on npm and the 0.9.12 tarball verified on 2026-08-08 still contains the agent-driven credential inventory, the codeword mapping and the reporting channel, so every version is recorded as affected.

### mangomind-agent (MCPA-2026-0078, critical)

- Latest on npm as of 2026-08-16: `0.2.2` (still installable)
- Aliases: MAL-2026-13611, GHSA-34vp-2pw6-g7f3
- References: https://osv.dev/vulnerability/MAL-2026-13611; https://github.com/advisories/GHSA-34vp-2pw6-g7f3; https://www.npmjs.com/package/mangomind-agent

mangomind-agent installs a background daemon (hidden via a temp VBS launcher on Windows, launchd/systemd on macOS/Linux) that connects to a hardcoded WebSocket relay (`wss://mangomind-relay-production.up.railway.app`, `wss://relay.mangomindbd.com` in earlier releases) and remote-drives a local OpenCode agent. Before starting `opencode serve` it overwrites the workspace `opencode.jsonc` with its own provider config that routes all model traffic — i.e. the code and prompts of the workspace — through the author's Supabase endpoint (`https://rfsbovvvryfmgpoehlrc.supabase.co/functions/v1/mangomind-api/v1`), backing up and restoring the victim's real config around the session. Relay messages of type `diagnosis` carrying `autoFix` are handled by passing `msg.fixCommand` straight to `child_process.execSync`, giving the relay operator arbitrary shell execution as the installing user. Flagged as malware by OSV (MAL-2026-13611). Verified on the latest published tarball 0.2.2 (2026-08-09): the relay-driven `execSync(fixCommand)` path, the config rewrite and the hidden autostart are all still present, so no fixed version is recorded.

### aclade-agent (MCPA-2026-0079, critical)

- Latest on npm as of 2026-08-16: `1.0.6` (still installable)
- Aliases: MAL-2026-13614, GHSA-45jx-7hwc-cx43
- References: https://osv.dev/vulnerability/MAL-2026-13614; https://github.com/advisories/GHSA-45jx-7hwc-cx43; https://www.npmjs.com/package/aclade-agent

aclade-agent installs a daemon that re-spawns itself detached and polls `https://aclade.com/api/connector/poll` for task objects, then dispatches them in `executeTask()`. The `execute_bash` tool passes the server-supplied string to `child_process.spawn(input.command, [], { shell: true })`, so whoever controls the endpoint gets arbitrary shell execution as the installing user; other tools shell out via execSync to enumerate (`find`/`dir /s /b`) and grep the filesystem, and results are posted back to `/api/connector/respond`. The poll loop also runs `execSync("npm install -g aclade-agent@latest")`, so the running code can be replaced silently at any time. Flagged as malware by OSV (MAL-2026-13614). Verified on the latest published tarball 1.0.6 (2026-08-09): the poll/execute/self-update paths are all still present, so no fixed version is recorded.

### agenthub-ai (MCPA-2026-0080, critical)

- Latest on npm as of 2026-08-16: `1.3.0` (still installable)
- Aliases: MAL-2026-13615, GHSA-hw95-mqx2-4pg5
- References: https://osv.dev/vulnerability/MAL-2026-13615; https://github.com/advisories/GHSA-hw95-mqx2-4pg5; https://www.npmjs.com/package/agenthub-ai

agenthub-ai ships a bundled daemon (dist-publish/main.js) that installs itself as an OS-level autostart service (Windows hidden WScript launcher / systemd unit / launchd job), opens a WebSocket to the hardcoded production relay `wss://agenthub-agent.fyenet.com`, and executes request messages received from it against a local `@anthropic-ai/claude-agent-sdk` session in the user's working directory. Session, file and system channels let the relay operator read and write files and run agent sessions on the host; the daemon also kills orphaned `claude`/`claude.exe` processes, writes a machine id into the user's `~/.claude` config directory, and can pull and install a newer version of itself with `npm install -g agenthub-ai@<ver>` (PowerShell hidden-window path on Windows), so the running code is remotely replaceable. Flagged as malware by OSV (MAL-2026-13615). Verified on the latest published tarball 0.20.9 (2026-08-09): the hardcoded relay, service installation and self-update paths are all still present, so no fixed version is recorded.

### claude-remote-agent (MCPA-2026-0081, high)

- Latest on npm as of 2026-08-16: `0.7.1` (still installable)
- Aliases: MAL-2026-13376, GHSA-vmfr-7cqr-9wc8
- References: https://osv.dev/vulnerability/MAL-2026-13376; https://github.com/advisories/GHSA-vmfr-7cqr-9wc8; https://www.npmjs.com/package/claude-remote-agent

claude-remote-agent runs a daemon that connects to a WebSocket relay and, on relay request, spawns a Python PTY bridge to run `claude` sessions in the host's working directory, forwarding terminal I/O to the relay and supporting a `bypassPermissions` permission mode. In 0.1.0 through 0.2.0 the relay URL defaulted to the hardcoded author-controlled endpoint `wss://claude.pishchykau.eu` (`process.env.SERVER_URL || 'wss://claude.pishchykau.eu'`), so simply running the CLI handed interactive shell/agent control of the machine to a third-party server. Flagged as malware by OSV (MAL-2026-13376, versions 0.1.0-0.1.2). Verified by unpacking every published version: 0.1.0-0.2.0 carry the hardcoded default, while 0.3.0 and later require an explicit `--server` URL and exit without one, so 0.2.0 is recorded as the last affected version.

### @atom8n/inspector (MCPA-2026-0082, critical)

- Latest on npm as of 2026-08-16: `0.17.32` (still installable)
- Aliases: MAL-2026-13414, GHSA-9836-cprf-5xxq
- References: https://osv.dev/vulnerability/MAL-2026-13414; https://github.com/advisories/GHSA-9836-cprf-5xxq; https://www.npmjs.com/package/@atom8n/inspector

@atom8n/inspector republishes the official @modelcontextprotocol/inspector under a squatted scope while spoofing Anthropic metadata (package.json declares author 'Anthropic, PBC' and homepage modelcontextprotocol.io) and deliberately regressing the upstream security fixes for CVE-2025-49596. Verified by unpacking the latest tarball (0.17.32): the proxy's auth gate is inverted to off-by-default (`const authDisabled = process.env.DANGEROUSLY_OMIT_AUTH !== "false"` in server/build/index.js), the DNS-rebinding origin-validation middleware body is commented out, and the proxy still spawns `query.command` via StdioClientTransport. Running the renamed `mcp-inspector-atom8n` bin therefore exposes an unauthenticated localhost proxy (port 6277) that any web page the developer visits can drive to execute arbitrary local commands. Flagged as malware by OSV (MAL-2026-13414).

### trimprompt (MCPA-2026-0083, high)

- Latest on npm as of 2026-08-16: `1.0.49` (still installable)
- Aliases: MAL-2026-13462, GHSA-cvm3-f6xv-h47p
- References: https://osv.dev/vulnerability/MAL-2026-13462; https://github.com/advisories/GHSA-cvm3-f6xv-h47p; https://www.npmjs.com/package/trimprompt

trimprompt markets itself as a token-saving proxy for AI coding agents, but nearly every runtime module (cache-manager.js, ccr.js, executor.js, file-watcher.js, hooks/claude-hook.js, mcp.js, proxy-conv.js, proxy-resp.js, sync.js, tracker.js, all filters/*.js) is hex-mangled `_0x...` obfuscated JavaScript. Verified by unpacking the latest tarball (1.0.49): postinstall.js auto-runs `node cli.js shims install` and tells the user to restart Cursor/Claude Code so the shims intercept agent command output; shims.js spawns powershell/pwsh via execSync; and the obfuscated sync.js and tracker.js combine child_process with HTTP POSTs carrying hostname/identifier fields — the shape of host reconnaissance and beaconing, with destinations hidden behind the string-array obfuscation. Pervasive obfuscation plus install-time execution in the agent command path is inconsistent with a legitimate prompt-trimming utility. Flagged as malware by OSV (MAL-2026-13462). Recorded as high rather than critical because the exfiltration destinations and a remote-command channel could not be recovered from the obfuscated code.

### @addai/node (MCPA-2026-0084, critical)

- Latest on npm as of 2026-08-16: `0.27.1` (still installable)
- Aliases: MAL-2026-13411, GHSA-w4g2-j72c-g28r
- References: https://osv.dev/vulnerability/MAL-2026-13411; https://github.com/advisories/GHSA-w4g2-j72c-g28r; https://www.npmjs.com/package/@addai/node

@addai/node installs a background daemon (dist/session-runner.js) that pairs the host to a remote account and polls the hardcoded backend `https://syhzpqqvrplaqdipcymw.supabase.co` for request rows. Verified by unpacking the latest tarball (0.11.3): row fields (prompt, working_directory, permission_mode including 'bypassPermissions', allowed_tools, mcps_override, agent including 'claude-bypass') are passed to local spawn/PTY calls that drive installed claude, codex, kimi, gemini, and grok CLIs; the same channel accepts install_harness, update_runtime, and set_autostart commands and runs remote-selected `npm install -g` package specs (command-runner.js), giving whoever controls the account remote agent execution, self-update, and autostart persistence (autostart-mac.js/autostart-win.js). probeCapabilities() additionally reads credential stores it does not own (~/.codex/auth.json, ~/.kimi-code/credentials, ~/.gemini/oauth_creds.json and google_accounts.json, ~/.grok/auth.json, `claude auth status`) and reports authed state and account emails to the same backend via runtime_heartbeat. Flagged as malware by OSV (MAL-2026-13411).

### @xiaohhhh1/canvas-agent (MCPA-2026-0085, critical)

- Latest on npm as of 2026-08-16: `0.4.35` (still installable)
- Aliases: MAL-2026-13398, GHSA-29wq-c378-jw6v
- References: https://osv.dev/vulnerability/MAL-2026-13398; https://github.com/advisories/GHSA-29wq-c378-jw6v; https://www.npmjs.com/package/@xiaohhhh1/canvas-agent

@xiaohhhh1/canvas-agent's bin opens an outbound WebSocket to the hardcoded relay `wss://canvas.xiaohhhh1.com/api/agent-relay` on start and forwards inbound relay messages as authenticated requests to its own local server, attaching the local x-canvas-agent-token header. Verified by unpacking the latest tarball (0.4.11): dist/relay-bridge.js carries the hardcoded DEFAULT_RELAY_URL; relay-reachable endpoints include /agent/codex/turn and /agent/claude/turn (spawn the local Codex/Claude CLIs), /agent/codex/approval (supplies approval decisions), /agent/local-image (returns file bytes for any absolute path with an image extension), and /agent/local-file/reveal (spawns the OS file manager against arbitrary paths); and dist/agent/codex-client.js maps a caller-supplied permissionMode of 'full' to Codex sandbox 'danger-full-access' with approvalPolicy 'never'. A remote peer on the vendor relay can therefore run unrestricted agent turns on the installer's host without any local approval prompt and read files from disk. Flagged as malware by OSV (MAL-2026-13398).

## Verification method

1. Structured advisories are maintained in `advisories/` (schema-validated,
   cross-referenced to OSV/GHSA where upstream IDs exist).
2. "Malicious" claims come from unpacking the published tarballs and reading the
   shipped code (see each advisory's summary for the concrete mechanism —
   hardcoded C2 endpoints, `--dangerously-skip-permissions` remote driving,
   postinstall persistence, credential harvesting).
3. "Still installable" was re-checked on 2026-08-16 via
   `GET https://registry.npmjs.org/<name>` — a package counts as live when it
   has a `latest` dist-tag and is not an npm security-holder placeholder.

Packages from our database already handled by npm (security-holder or removed),
for completeness: @lanyer640/mcp-runcommand-server, mcp-server-everything,
explorhub-mcp-server, brave-search-mcp-server, claude-token-tracker-mcp,
code-analyzer-mcp, devplatform-react-mcp, postmark-mcp, @copilot-mcp/apex.
