# agentgate.lock specification — v1 (FROZEN)

Status: **frozen** as of 2026-08. Schema: [`agentgate.lock.schema.json`](./agentgate.lock.schema.json).
The schema is also published at <https://agentgate.zalize.com/spec/agentgate.lock.schema.json>.
Superseded (but still fully supported) by [v2](./lockfile-v2.md), which adds an
optional `skills` section.

## Format

`agentgate.lock` is a UTF-8 JSON document:

```jsonc
{
  "lockfileVersion": 1,          // integer, REQUIRED, exactly 1 for this spec
  "generatedBy": "mcp-agentgate@x.y.z",
  "generatedAt": "ISO-8601 timestamp",
  "servers": {
    "<server name>": {
      "surfaceHash": "<sha256 hex>",   // hash of the whole tool surface
      "tools": [
        {
          "name": "<tool name>",
          "nameHash": "<sha256 hex>",
          "descriptionHash": "<sha256 hex>",
          "inputSchemaHash": "<sha256 hex>"
        }
      ]
    }
  }
}
```

## Hashing rules (normative)

- All hashes are lowercase hex SHA-256.
- `nameHash` = SHA-256 of the raw tool name string (UTF-8).
- `descriptionHash` = SHA-256 of the raw tool description string (UTF-8).
- `inputSchemaHash` = SHA-256 of the **canonical JSON** of the tool's input
  schema (`{}` when absent). Canonical JSON: object keys sorted recursively
  (code-unit order), array order preserved, no insignificant whitespace.
- Tools are sorted by `name` (locale-independent `localeCompare` is used by
  the reference implementation; producers MUST sort deterministically).
- `surfaceHash` = SHA-256 of the canonical JSON of
  `[[nameHash, descriptionHash, inputSchemaHash], ...]` over the sorted tools.

## Compatibility & migration policy

- v1 is frozen: fields will not be removed, renamed, or change semantics.
- Consumers MUST reject documents whose `lockfileVersion` ≠ 1 with a clear
  error (the reference CLI exits `2` and suggests upgrading agentgate or
  regenerating with `agentgate lock`).
- Any breaking change ships as `lockfileVersion: 2` with a new schema file;
  the CLI will then read v1 and offer regeneration to v2 (`agentgate lock`),
  never silently rewriting an existing v1 file.
- Additive metadata is not allowed within v1 (`additionalProperties: false`);
  extensions require a version bump.
