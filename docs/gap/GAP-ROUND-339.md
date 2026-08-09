# GAP-ROUND-339 — annotation `file=` paths valid for absolute-path scans

## How it was found

Follow-on from the round-338 SARIF walkthrough: reproduced the same
absolute-path leak in the GitHub Actions annotation channel. Scanning a
directory by absolute path with `GITHUB_ACTIONS=true` emitted:

```
::warning file=/home/…/repos/lusha-oss_lusha-mcp-plugin/mcp.json,…
```

GitHub maps annotation `file=` values relative to the workspace root, so
absolute paths never attach to the PR diff — the annotation only appears in
the run summary.

## Root cause

`renderGitHubAnnotations` / `renderDriftAnnotations` used `finding.file` /
`entry.file` verbatim. Findings produced by walking a target given as an
absolute path (or discovered configs under the home directory) carry
absolute paths; only cwd-launched scans happened to produce relative ones
(which is why the dogfood workflow's annotations looked correct).

## Fix

`annotationPath()`: relativize against cwd when the file is under it
(posix separators, matching GitHub's expectation); leave paths outside the
workspace unchanged — GitHub cannot map them either way, and the absolute
path is more useful in the run summary than a `../…` escape.

## Verification

- Regression test pins both directions: absolute-under-cwd →
  workspace-relative, outside-cwd → unchanged.
- Real reproduction re-run: the lusha corpus repo scanned by absolute path
  now emits `file=` values relative to the scanned tree when run from it,
  and unchanged output for cwd-relative scans (dogfood annotations
  byte-identical).

## Boundary

Files outside the workspace still carry absolute `file=` values and will not
map onto a diff; emitting no `file=` at all was rejected because the path is
the finding's only locator in the run summary.
