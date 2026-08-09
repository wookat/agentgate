# GAP-ROUND-342 — live-scan MCP handshake advertises the real core version

## Windows checked first

- Advisory window: authenticated GHSA watch re-run — zero uncovered.
- Version PR #492 merged on main: cli/core defined at 0.67.12 (carrying the
  r338/339/340 patches); npm still 0.67.11 — awaiting manual publish. The
  r341 changeset remains pending for the next version PR.

## Defect

Sweep for the r341 staleness class (hardcoded version strings surviving
releases) found one more: the MCP `initialize` handshake sent by
`scan --live` / `lock` reported

```ts
new Client({ name: 'agentgate', version: '0.1.0' })
```

so every scanned server's logs record agentgate as 0.1.0 regardless of the
installed release. Informational only (no scan-result impact), but it is the
identity we present to third-party servers, and it has been wrong for 67
releases.

## Fix

- New `packages/core/src/version.ts` exporting `CORE_VERSION` read from the
  package's own package.json (same pattern as the CLI's `CLI_VERSION`);
  re-exported from the package root.
- `live.ts` clientInfo now uses `CORE_VERSION`.

## Regression

The tiny stdio fixture now exposes the received clientInfo as a
`client-info` tool registered in `oninitialized`, and the live e2e asserts
the handshake advertised `agentgate@<core package.json version>` — a future
version bump can never leave the handshake stale.

## Boundary

`clientMetadata` for OAuth registration already used `CLI_VERSION`
(r108-era code) — verified, no change needed. Repo-wide grep shows no other
hardcoded version literals in src.
