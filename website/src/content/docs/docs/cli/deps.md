---
title: agentgate deps
description: Detect AI-hallucinated (slopsquatted) and typosquatted dependencies across npm and PyPI.
---

Detect hallucinated and typosquatted dependencies before they are installed.

```bash
agentgate deps [target] [options]
```

LLMs hallucinate package names — a USENIX Security 2025 study found **19.7%** of
AI package recommendations reference packages that don't exist. Attackers
register those names on npm and PyPI ("slopsquatting"), so a copy-pasted
`npm install` or `pip install` pulls attacker code. `agentgate deps` intercepts
this before installation.

## What it checks

1. **Collects** dependency names from `package.json` (all dependency sections),
   `requirements*.txt`, `pyproject.toml` (PEP 621 + Poetry), and bare import
   specifiers in `.js`/`.ts`/`.py` source files (imports already declared in a
   manifest, Node builtins, and the Python stdlib are excluded).
2. **Verifies existence** against the live npm and PyPI registries. A package
   that doesn't exist is a **critical** finding (`AG-DP-001`) — it's likely
   hallucinated and an attacker can register it. First-party modules found in
   the scanned tree and imports inside comments/docstrings are excluded; a
   nonexistent name imported only under a test/example path is downgraded to
   `low` (usually a runtime-generated or sample module).
3. **Risk-scores existing packages** from registry metadata: name similarity to
   popular packages (`AG-DP-002`, typosquats), young/near-zero-download
   packages (`AG-DP-003`), npm install scripts combined with other risk signals
   (`AG-DP-004`), and weak metadata like missing repository/license
   (`AG-DP-005`).
4. **Checks known-malware advisories** against [OSV.dev](https://osv.dev)
   (which aggregates the GitHub Advisory Database, PyPI, and the OSV
   malicious-packages project). A dependency with a `MAL-*` advisory is a
   **critical** finding (`AG-DP-006`) linking to the advisory. When the
   advisory only covers specific compromised releases (e.g. the 2025
   `debug`/`chalk` incident), the resolved version — from `node_modules`, or a
   lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` v1,
   `poetry.lock`, `uv.lock`; best-effort parsing) — is
   compared: unaffected = `low`, affected = `critical`, unresolvable = `high`
   ("verify your lockfile"). Version-range CVEs are out of scope; use a
   dependency vulnerability scanner (osv-scanner, `npm audit`) alongside.
   Skipped with a warning when OSV.dev is unreachable or in `--offline` mode.

## Options

| Flag | Default | Description |
|---|---|---|
| `-f, --format <format>` | `table` | `table`, `json`, or `sarif`. |
| `-o, --output <file>` | stdout | Write the report to a file. |
| `--fail-on <severity>` | `high` | Exit `1` when findings reach this severity — the CI gate. Use `never` to report without gating. |
| `--ignore <globs...>` | — | Exclude paths (e.g. `vendor/**`). |
| `--offline` | off | Skip registry lookups; name-shape (typosquat) checks only. |
| `--no-imports` | off | Check manifests only; skip source import extraction. |
| `-t, --timeout <ms>` | `10000` | Per-request registry timeout. |
| `--concurrency <n>` | `8` | Max concurrent registry lookups. |

## CI usage

```yaml
- uses: wookat/agentgate/packages/action@v0.33.0
  with:
    command: deps
```

Or as a pre-commit hook (`id: agentgate-deps`), which runs whenever a
dependency manifest changes.

## Honest boundaries

This is a heuristic risk gate, not a proof of safety:

- A clean result does **not** guarantee a package is safe; a flagged result is
  a signal to review, not proof of malice.
- PyPI download counts are not available via the JSON API, so PyPI scoring
  relies on age, versions, and metadata quality.
- Source import extraction is regex-based, not a full parser; Python
  import-name → PyPI-name mapping is best-effort (e.g. `PIL` vs `pillow`).
- Registry lookups need network access; failures degrade to `info` findings.
  Use `--offline` where CI has no egress.
