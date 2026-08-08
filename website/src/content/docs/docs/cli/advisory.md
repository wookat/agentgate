---
title: agentgate advisory
description: Query the MCPA advisory database from the terminal — check a package before installing it, or list every advisory.
---

Query the [MCPA advisory database](/advisories/) directly from the terminal.

```bash
agentgate advisory check <package>[@version] [options]
agentgate advisory list [options]
```

## `advisory check` — pre-install gate

Ask "is this MCP server package known-bad?" before adding it to a config:

```bash
agentgate advisory check mcp-remote@0.1.10   # → MCPA-2025-0001, exit 1
agentgate advisory check mcp-remote@0.1.16   # → clean, exit 0
agentgate advisory check flyto-core@2.26.2   # → 4 matches (PyPI), exit 1
```

- Exit code `1` on any match, `0` when clean, `2` on usage errors — so it
  drops into shell guards and CI steps directly:

  ```bash
  agentgate advisory check some-mcp-server@1.2.3 && npm install some-mcp-server@1.2.3
  ```

- When `-e/--ecosystem` is omitted, **both npm and PyPI are checked**; pass
  `-e npm` or `-e pypi` to restrict.
- Without a version, ranged matches are reported but marked
  *not version-confirmed*.

## `advisory list`

Prints the whole database as a table (id, severity, type, packages,
published date), newest first.

## Options

| Flag | Default | Description |
|---|---|---|
| `-e, --ecosystem <eco>` | both | `npm` or `pypi` (`check` only). |
| `--json` | off | Machine-readable output (schema in the [CLI contract](https://github.com/wookat/agentgate/blob/main/docs/spec/cli-contract.md)). |
| `--offline` | off | Use only the bundled database; skip the live advisory API. |
| `-t, --timeout <ms>` | `5000` | Live advisory API timeout. |

## Data source

Both commands prefer the live advisory API (the same feed as this site) and
fall back to the database bundled with the CLI — with a stderr warning — when
the API is unreachable or `--offline` is set. Bundled data is refreshed with
every release.

## Honest boundaries

- The MCPA database is curated and MCP-focused, not a general vulnerability
  feed — a clean result means "no known MCP advisory", not "safe". Pair with
  `agentgate deps` (OSV.dev malware checks) and a dependency scanner.
- `check` takes one package per invocation; scanning a whole client config is
  `agentgate scan`'s job (rule `AG-SC-003` does this automatically).
- Some entries have **no fixed release** (recorded with `last_affected`
  instead of `fixed`) — either the vendor hasn't shipped a patch yet, or the
  product is discontinued entirely (e.g. Flowise announced its
  [sunset](https://flowiseai.com/sunset), so its post-sunset advisories will
  never get a fix). For those, "upgrade" is not a remediation: the latest
  version is still affected, and the practical options are mitigating
  controls or migrating off the package.
