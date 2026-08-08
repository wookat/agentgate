# GAP-ROUND-306: advisory sweep — four in-the-wild agent-hijack npm packages (91 → 95)

Routine advisory round (previous: 303). Window: 2026-08-01 .. 2026-08-09.

## Windows checked

- **GHSA vulnerability watch** (`api/scripts/watch.mjs --dry-run`): no uncovered
  MCP-related advisories.
- **OSV bulk exports**: `npm/all.zip` and `PyPI/all.zip` re-fetched — byte
  identical (md5) to the r295 snapshot, ETag `60a9dfb7…` unchanged (upstream
  export still not refreshed; recorded again, third round in a row). Diffing is
  therefore impossible from the bulk export.
- **GitHub malware advisory window** (`/advisories?type=malware`, 2026-08-01..09):
  1,337 entries, 31 matching the MCP/agent-client name vocabulary. Three were
  already in the database (MCPA-2026-0061/0062/0063), several are prior-round
  entries; the remainder were triaged one by one against the published tarball.

## Entries added (4) — 91 → 95

All four were verified by unpacking the **latest published tarball** from npm,
not just by reading the OSV/GHSA text. Three of the four are still installable.

| ID | Package | Verified on | Severity |
| --- | --- | --- | --- |
| MCPA-2026-0078 | `mangomind-agent` | 0.2.2 (live) | critical |
| MCPA-2026-0079 | `aclade-agent` | 1.0.6 (live) | critical |
| MCPA-2026-0080 | `agenthub-ai` | 0.20.9 (live) | critical |
| MCPA-2026-0081 | `claude-remote-agent` | 0.1.0–0.2.0 (live, later versions clean) | high |

- **mangomind-agent** — hidden autostart daemon (temp VBS on Windows,
  launchd/systemd elsewhere) that connects to a hardcoded relay and remote-drives
  `opencode serve`. It **overwrites the workspace `opencode.jsonc`** with its own
  provider block so all model traffic (code + prompts) goes through the author's
  Supabase endpoint, backing up and restoring the victim's config around the
  session; relay `diagnosis` messages with `autoFix` are executed via
  `execSync(msg.fixCommand)` — arbitrary remote command execution. OSV lists
  ≤0.2.1; 0.2.2 still carries all three behaviours, so no fixed version recorded.
- **aclade-agent** — detached daemon polling `https://aclade.com/api/connector/poll`
  and dispatching task objects; `execute_bash` runs the server-supplied string via
  `spawn(cmd, [], { shell: true })`, filesystem enumeration/grep via execSync,
  results posted back. The poll loop also runs
  `execSync("npm install -g aclade-agent@latest")`, so the code is remotely
  replaceable. OSV lists ≤1.0.6; verified present in 1.0.6.
- **agenthub-ai** — bundled daemon installs an OS service (hidden WScript /
  systemd / launchd), opens a WebSocket to `wss://agenthub-agent.fyenet.com`, and
  runs relay-dispatched requests against a local `@anthropic-ai/claude-agent-sdk`
  session in the user's workdir; writes a machine id into `~/.claude`, kills
  orphan `claude` processes, and self-updates via `npm install -g agenthub-ai@<v>`
  (PowerShell hidden window on Windows). OSV lists 0.20.1–0.20.4; verified present
  in 0.20.9.
- **claude-remote-agent** — daemon spawning a Python PTY bridge to run `claude`
  sessions (supports `bypassPermissions`) driven by a WebSocket relay. Every
  published version was unpacked: 0.1.0–0.2.0 default to the hardcoded
  author-controlled `wss://claude.pishchykau.eu`; from 0.3.0 on `--server` is
  required and the process exits without it. Recorded honestly as
  `introduced 0.1.0, last_affected 0.2.0` (OSV only lists 0.1.0–0.1.2), severity
  high rather than critical — the malicious element is the default endpoint, not
  the tool itself.

End-to-end verification: `advisory check` matches all four; `claude-remote-agent@0.7.1`
correctly reports no advisories while `@0.2.0` matches.

## Honest rejections

- **zyr-agent** (GHSA-rhx7-52rr-88vg) — routes its "free" provider to a
  hardcoded preview endpoint. That is the product's own free tier; no exfiltration
  or execution payload found in 1.7.9. Below the bar.
- **`@lyxa.ai/core`** (embedded AMQP credentials) — package unpublished (404), and
  the issue is leaked author credentials, not agent hijack.
- **`@agenthub-ai/agent`** — already replaced by a `0.0.1-security` placeholder;
  the live surface is `agenthub-ai` (MCPA-2026-0080).
- Vanexa-family agents (`@vanexalabs-ai/vanexa-agent`,
  `@ikbal_fadilah_vanexa01/vanexa-agent`, `@xiaohhhh1/canvas-agent`) — WebRTC/relay
  phone-pairing daemons; author-controlled relay is the advertised product, no
  hidden payload found. Recorded as a watch item rather than an entry.
- ~1,300 generic trojan / dependency-confusion malware entries outside the
  MCP/agent vocabulary — OSV live lookup in `deps` covers them.

## Boundaries

- OSV bulk export has now been stale for three consecutive rounds; the GitHub
  malware advisory API is the working window. Next round should keep using
  `/advisories?type=malware` with a date filter rather than snapshot diffing.
