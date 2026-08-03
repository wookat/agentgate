---
title: Lockfile specification
description: The agentgate.lock format — pinning the MCP tool surface.
---

:::caution[Draft]
This is the route-B draft of the lockfile spec. The canonical JSON Schema is owned by route A and lives in [`docs/spec/`](https://github.com/wookat/agentgate/tree/main/docs/spec) in the repository; changes to this cross-route interface are coordinated in PRs per `docs/ROUTES.md`.
:::

`agentgate.lock` pins the **tool surface** an agent sees from its MCP servers: for each tool, a SHA-256 hash over its name, description, and input schema. If an upstream package changes any of these — the rug-pull pattern — the hash no longer matches and [`agentgate ci`](/docs/cli/ci/) fails.

## Design goals

1. **Reviewable** — canonical JSON (sorted keys, 2-space indent, trailing newline) so lockfile diffs in PRs are minimal and meaningful.
2. **Deterministic** — the same tool surface always produces byte-identical output.
3. **Self-describing** — `lockfileVersion` gates format evolution.

## Format

```json
{
  "lockfileVersion": 1,
  "generatedAt": "2026-08-03T12:00:00Z",
  "agentgateVersion": "0.1.0",
  "servers": {
    "filesystem": {
      "source": {
        "type": "npm",
        "package": "@modelcontextprotocol/server-filesystem",
        "version": "2025.7.1"
      },
      "transport": "stdio",
      "toolSurfaceHash": "sha256:9f2c…",
      "tools": {
        "read_file": {
          "hash": "sha256:1ab4…",
          "nameHash": "sha256:77d0…",
          "descriptionHash": "sha256:c56a…",
          "inputSchemaHash": "sha256:0e19…"
        }
      }
    }
  }
}
```

### Fields

| Field | Description |
|---|---|
| `lockfileVersion` | Integer format version. This page documents version `1`. |
| `generatedAt` | ISO-8601 UTC timestamp of the last `agentgate lock` run. |
| `agentgateVersion` | CLI version that wrote the file. |
| `servers.<name>.source` | Where the server comes from: `type` (`npm` \| `pypi` \| `local` \| `remote`), `package`/`version` when applicable. |
| `servers.<name>.transport` | `stdio` \| `sse` \| `http`. |
| `servers.<name>.toolSurfaceHash` | Hash over the canonical serialization of the server's full tool list — a fast whole-server comparison. |
| `servers.<name>.tools.<tool>` | Per-tool hashes. `hash` covers the tuple (name, description, inputSchema); the three field hashes let `diff` report *which* field drifted. |

### Hashing rules

- Canonical JSON serialization (RFC 8785 JCS) of the hashed value, UTF-8, then SHA-256, rendered as `sha256:<hex>`.
- A tool's `hash` = SHA-256 over the JCS serialization of `{"description": …, "inputSchema": …, "name": …}`.
- `toolSurfaceHash` = SHA-256 over the JCS array of per-tool `hash` values sorted by tool name.

## Compatibility

- Unknown top-level or per-server fields must be preserved by writers and ignored by readers (forward compatibility within a `lockfileVersion`).
- Breaking changes bump `lockfileVersion`; the CLI refuses to gate against a newer version than it understands (exit code 2).
