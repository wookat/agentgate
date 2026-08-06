# GAP-ROUND-67 — the GitHub Action was broken for its default command: `--lock` / `--sarif` are not CLI flags

Date: 2026-08-06

## How the gap was found (real evidence)

Round-67 walkthrough of the documented CI integration paths (README, website
CI guide, `packages/action/README.md`) against the real CLI. The composite
action (`packages/action/action.yml`) appended flags the CLI has never
accepted:

- `ci|diff|lock` → `--lock <file>`, but the CLI flags are
  `-l, --lockfile` (ci/diff) and `-o, --out` (lock);
- `sarif-file` input → `--sarif <file>`, but SARIF is
  `--format sarif --output <file>` and exists on `scan` only (`ci` has no
  format flags at all).

Reproduced with the published CLI:

```
$ npx mcp-agentgate@0.14.0 ci --lock agentgate.lock
error: unknown option '--lock'   (exit 1)
```

So every workflow using the action as documented — including the
default `command: ci` — failed with "unknown option", masquerading as a gate
failure. Nothing in CI exercised the action: `route-c.yml` only YAML-parses
`action.yml`, and the dogfood workflow calls the CLI directly.

## Fix (this round)

- `action.yml`: `ci|diff` → `--lockfile`, `lock` → `--out`; `sarif-file` maps
  to `--format sarif --output <file>` and errors clearly (exit 2) when set
  with a non-`scan` command.
- Docs aligned: action README input table + CLI-contract section; website CI
  guide now shows SARIF via a dedicated `command: scan` step.
- New `action-smoke` CI job (route-c.yml) runs the composite action
  end-to-end against the published CLI: `lock` → `ci` → `scan` with SARIF,
  then asserts the lockfile and SARIF artifacts exist and parse. All three
  command lines verified locally against `mcp-agentgate@0.14.0` first
  (lock/ci/scan all exit 0, 13 tools locked from
  `@modelcontextprotocol/server-everything@2026.7.4`).

No changeset: `packages/action` is not an npm package; the CLI is unchanged.

## Remaining gaps (unchanged)

- Marketplace publishing of the action still deferred (needs root
  `action.yml` or a dedicated repo).
- Cloudflare repo secrets absent → manual deploys.
- npm trusted publisher not configured.
