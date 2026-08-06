---
title: Lockfile specification
description: The agentgate.lock format — pinning the MCP tool surface.
---

`agentgate.lock` pins the **tool surface** an agent sees from its MCP servers: for each tool, SHA-256 hashes of its name, description, and input schema — the three fields an upstream rug-pull would mutate. If any of them changes, [`agentgate diff`](/docs/cli/diff/) and [`agentgate ci`](/docs/cli/ci/) fail.

Canonical JSON Schemas: [`docs/spec/agentgate.lock.schema.json`](https://github.com/wookat/agentgate/blob/main/docs/spec/agentgate.lock.schema.json) (v1) and [`docs/spec/agentgate.lock.v2.schema.json`](https://github.com/wookat/agentgate/blob/main/docs/spec/agentgate.lock.v2.schema.json) (v2) — cross-route contracts per `docs/ROUTES.md`; changes are coordinated in PRs.

## Format

```json
{
  "lockfileVersion": 1,
  "generatedBy": "agentgate@0.1.0",
  "generatedAt": "2026-08-03T12:00:00.000Z",
  "servers": {
    "filesystem": {
      "surfaceHash": "9f2c…64 hex chars…",
      "tools": [
        {
          "name": "read_file",
          "nameHash": "77d0…",
          "descriptionHash": "c56a…",
          "inputSchemaHash": "0e19…"
        }
      ]
    }
  }
}
```

## Fields

| Field | Description |
|---|---|
| `lockfileVersion` | Format version: `1` (servers only, frozen) or `2` (adds the optional `skills` section). |
| `generatedBy` | Tool and version that wrote the file, e.g. `agentgate@0.1.0`. |
| `generatedAt` | ISO-8601 timestamp. Informational only — not part of drift comparison. |
| `servers.<name>` | Locked surface per server, keyed by the server name from the client config. |
| `servers.<name>.surfaceHash` | SHA-256 over the canonical JSON array of `[nameHash, descriptionHash, inputSchemaHash]` triples of all tools, sorted by tool name — a fast whole-server comparison. |
| `servers.<name>.tools[]` | Locked tools, sorted by name. `name` is kept in plaintext for readable diffs. |

## Hashing rules

All hashes are lowercase hex SHA-256:

- `nameHash` — SHA-256 of the UTF-8 tool name.
- `descriptionHash` — SHA-256 of the UTF-8 tool description (empty string if absent).
- `inputSchemaHash` — SHA-256 of the canonical JSON of the tool input schema (`{}` if absent). Canonical JSON = object keys sorted recursively, no whitespace.

## Design goals

1. **Reviewable** — deterministic output (sorted tools, stable field order) so lockfile diffs in PRs are minimal and meaningful.
2. **Tamper-evident** — a reworded description (the classic rug-pull payload) flips `descriptionHash` even though the code is unchanged.
3. **Self-describing** — `lockfileVersion` gates format evolution; the CLI refuses to gate against a version it does not understand.

## Version 2: pinned skill files

[`agentgate lock --skills`](/docs/cli/lock/) writes `lockfileVersion: 2`, which adds one optional section pinning agent skill / instruction files (the same set [skill scanning](/docs/guides/skills/) covers):

```json
{
  "lockfileVersion": 2,
  "skills": {
    "surfaceHash": "3c9d…64 hex chars…",
    "files": {
      ".claude/skills/deploy/SKILL.md": "a1b2…",
      ".cursor/rules/style.mdc": "f00d…"
    }
  }
}
```

`files` maps posix-relative paths to the SHA-256 of each file's UTF-8 content; `surfaceHash` is the SHA-256 of the canonical JSON of that map. When the lockfile pinned skills, [`agentgate diff`](/docs/cli/diff/) / [`agentgate ci`](/docs/cli/ci/) re-hash the files and fail with `skill-added` / `skill-removed` / `skill-changed` drift entries. Everything else is unchanged from v1; lockfiles without `--skills` keep being written as version 1.
