# GAP-ROUND-305: Copilot CLI extensions — repo-carried startup exec surface

## Surface

GitHub Copilot CLI discovers **extensions**: directories containing an
`extension.mjs` entrypoint. Each extension is forked as a Node.js child
process when a session starts, connects to the CLI over JSON-RPC via stdio
(`joinSession()` from `@github/copilot-sdk/extension`), and registers tools
and hooks with the agent.

Official semantics (SDK docs shipped inside the `@github/copilot` npm
package, `copilot-sdk/docs/extensions.md`):

> **Discovery**: The CLI scans `.github/extensions/` (project) and the
> user's copilot config extensions directory for subdirectories containing
> `extension.mjs`.
>
> **Launch**: Each extension is forked as a child process …

The bundled runtime (`app.js`, source anchors
`src/runtime/src/extensions/discovery.rs` / `paths.rs`) additionally accepts
`extension.cjs` and `extension.js` entrypoints, and the 1.0.79 changelog adds
plugin-shipped extensions under a `com.github.copilot/extensions/` directory.

The repo-carried form (`.github/extensions/<name>/extension.mjs`) means:
clone a repo, run `copilot` in it, and arbitrary Node code executes on your
machine at session start — the same class as OpenCode `.opencode/plugin/*.ts`
(round 257) and Cline `.cline/plugins/` (round 266).

## Gap

Before this round AgentGate never looked at these files at all: `.github` is
a skill-only dot-dir in the repo walk (its non-instruction contents are CI
workflows), so `extension.mjs` files under `.github/extensions/` were skipped
entirely — not in `scannedFiles`, no findings possible.

## Fix

- `.github/extensions/<name>/extension.{mjs,cjs,js}` and
  `com.github.copilot/extensions/<name>/extension.{mjs,cjs,js}` are treated
  as auto-executed startup surface for AG-RC-001: dynamic-exec primitives
  report medium (no MCP marker required), curl|sh launches report critical.
- The scanner walk exempts these paths from the `.github` skill-only skip.

## Corpus evidence (real repos)

GitHub code search `path:.github/extensions extension.mjs`: 184 files across
55 unique repos (total path hits for `.github/extensions`: ~4,200). All 55
repos cloned and scanned with the fixed build:

- 3 previously-invisible true positives (all medium): auto-executed
  extensions using `child_process` exec — `Tiberriver256/autoresearch-copilot-cli`
  (`exec`/`execFile`), `ebadger/3ric` and `ebadger/c64` (`execSync` of git
  commands). Spot-checked: all genuinely execute at session start.
- 52 repos: extensions now scanned (in `scannedFiles`), zero findings — no
  false positives from canvas/UI extensions (github/awesome-copilot corpus
  style).

## Boundaries (not done, recorded honestly)

- `~/.copilot/extensions/` is user-level, not repo-carried — out of scope for
  repo scanning.
- Extension `joinSession({ tools, hooks })` declarations are arbitrary JS;
  static extraction of the tool/hook surface is not attempted. Dynamic-exec
  and curl|sh classification covers the highest-risk content.
- Plugin manifests can reference extension directories via namespaced
  `extensions` maps (e.g. awesome-copilot's `plugin.json`
  `extensions["com.github.awesome-copilot"].extensions: ["./extensions/<name>"]`);
  those bare `extensions/<name>/extension.mjs` trees at a plugin repo root are
  already walked as regular source (MCP-marker-gated). Marketplace-namespace
  path-reference resolution is left for a future round if corpus evidence
  shows misses.
