# GAP-ROUND-338 — SARIF artifact URIs valid outside the working directory

## How it was found

Round-338 SARIF UX walkthrough: generated SARIF from a real corpus repo
scanned by absolute path (`agentgate scan /path/outside/cwd --format sarif`)
and ran it through `@microsoft/sarif-multitool validate`:

```
error SARIF1004: The relative reference
'runs[0].results[4].locations[0].physicalLocation.artifactLocation.uri'
begins with a slash, which will prevent it from combining properly with the
absolute URI specified by a 'uriBaseId'.
```

## Root cause

`toSarif` relativized `finding.file` only against `baseDir` (default: cwd).
When the scanned target is not under cwd — scanning another directory, a
config file elsewhere, or a GitHub Action step with a different
`working-directory` — the absolute POSIX path leaked through as a
slash-leading "relative" URI, which SARIF 2.1.0 forbids and GitHub code
scanning cannot map to repository files.

## Fix

- `toSarif` accepts `fallbackBaseDirs`: extra directories tried in order when
  a file is not under `baseDir`.
- `scan --format sarif` passes the resolved scan target directory (and the
  config file's directory when a config file was targeted); `deps --format
  sarif` passes the checked directory.
- Any file matching no base is emitted as a `file://` URI (`file:///C:/...`
  on Windows) instead of a slash-leading relative reference — never invalid.

Upstream evidence for the rule: SARIF 2.1.0 §3.4.3 (artifactLocation.uri as a
relative reference must combine with uriBaseId) and sarif-multitool rule
SARIF1004.

## Verification

- Regression tests pin: fallback-dir relativization, `file://` fallback for
  unmatched absolute paths (POSIX + Windows drive form), and that no emitted
  URI begins with a slash. cwd-relative behavior is byte-identical.
- Real corpus re-check: `lusha-oss/lusha-mcp-plugin` scanned by absolute path
  now emits `mcp.json`, `.claude-plugin/plugin.json`, … and
  `sarif-multitool validate` reports zero errors (previously SARIF1004).
- Fingerprints for previously-broken URIs change (they hash the URI); URIs
  emitted from cwd-relative scans — the documented GitHub code-scanning
  setup — are unchanged, so tracked alerts are unaffected.

## Boundary

`uriBaseId`/`originalUriBaseIds` (e.g. `SRCROOT`) are not emitted; consumers
that want a declared base still get plain repository-relative URIs, which
GitHub code scanning resolves against the repo root. Left as-is until a real
consumer requires it.
