# AgentGate GitHub Action

Run the AgentGate MCP gate in CI: fail the build when the tool surface your agent sees
(tool names, descriptions, input schemas) drifts from the approved `agentgate.lock`
baseline, or run a security scan on your MCP configs.

## Usage

```yaml
# .github/workflows/mcp-gate.yml
name: MCP gate
on: [push, pull_request]

permissions:
  contents: read

jobs:
  agentgate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: wookat/agentgate/packages/action@v0.67.10
        with:
          command: ci            # ci | scan | diff | lock
          lockfile: agentgate.lock
```

With SARIF upload to GitHub code scanning:

```yaml
permissions:
  contents: read
  security-events: write

steps:
  - uses: actions/checkout@v4
  - uses: wookat/agentgate/packages/action@v0.67.10
    with:
      command: scan
      sarif-file: agentgate.sarif
  - uses: github/codeql-action/upload-sarif@v3
    if: always()
    with:
      sarif_file: agentgate.sarif
```

## Inputs

| Input | Default | Description |
|---|---|---|
| `command` | `ci` | `ci` (drift gate), `scan`, `diff`, or `lock` |
| `args` | `""` | Extra CLI arguments |
| `lockfile` | `agentgate.lock` | Lockfile path (passed to `ci`/`diff`/`lock`) |
| `version` | `latest` | `agentgate` npm version run via `npx` |
| `working-directory` | `.` | Directory to run in |
| `sarif-file` | `""` | Write a SARIF report here (`scan` command only) |
| `node-version` | `22` | Node.js version |

## Outputs

| Output | Description |
|---|---|
| `exit-code` | agentgate exit code (`0` = no drift/findings) |

## Marketplace publishing note

GitHub Marketplace requires `action.yml` at the repository root. At first release we
will either (a) copy this `action.yml` to the repo root, or (b) sync this directory to a
dedicated `wookat/agentgate-action` repo — decision deferred to launch (total lead
call). Until then the action is usable via the subdirectory reference above.

## CLI contract (route A interface)

The action shells out to `npx mcp-agentgate@<version> <command>` and relies on:

- `agentgate ci --lockfile <file>` / `agentgate diff --lockfile <file>`: exit
  non-zero on any drift from the lockfile;
- `agentgate lock --out <file>`: write the lockfile;
- `agentgate scan`: exit non-zero on findings at/above the failure threshold;
- `agentgate scan --format sarif --output <file>`: write SARIF 2.1.0;
- human-readable output to stdout (no TTY assumptions).

Any change to this contract must update this file and `docs/spec/` per ROUTES.md.
