# agentgate.lock specification — v2

Status: **current**. Schema: [`agentgate.lock.v2.schema.json`](./agentgate.lock.v2.schema.json).
v1 remains frozen and fully supported ([lockfile-v1.md](./lockfile-v1.md)); v2 is
v1 plus one optional top-level section.

## What's new in v2

```jsonc
{
  "lockfileVersion": 2,
  // ... everything from v1 unchanged ...
  "skills": {                        // OPTIONAL, written by `agentgate lock --skills [dir]`
    "surfaceHash": "<sha256 hex>",   // hash over the whole files map
    "files": {
      ".claude/skills/deploy/SKILL.md": "<sha256 hex>",  // path → content hash
      ".cursor/rules/style.mdc": "<sha256 hex>"
    }
  }
}
```

The `skills` section pins agent skill / instruction files — the same file set
`agentgate scan` treats as skills (`SKILL.md`, `.claude`/`.cursor`/`.codex`/
`.opencode`/`.agents` skill/command/agent markdown, Windsurf rules/workflows,
Cline rules, Cursor `.mdc` rules, Gemini CLI command TOML). A silently edited
rule or skill file is the instruction-file equivalent of an MCP rug pull;
`agentgate diff` / `agentgate ci` fail with `skill-added` / `skill-removed` /
`skill-changed` drift entries when the pinned files change.

## Hashing rules (normative)

- `files` maps **posix-relative** file paths (relative to the locked
  directory) to the SHA-256 of the file's UTF-8 content, keys sorted.
- `skills.surfaceHash` = SHA-256 of the canonical JSON of the `files` map
  (same canonical-JSON rules as v1).
- All v1 hashing rules are unchanged.

## Writer / reader behavior

- `agentgate lock` without `--skills` keeps writing `lockfileVersion: 1` —
  v2 is only emitted when the skills section is present.
- Readers MUST accept versions 1 and 2 and reject anything else with a clear
  error (the reference CLI exits `2`).
- `agentgate diff` / `agentgate ci` only check skill drift when the baseline
  lockfile contains a `skills` section; `--skills <dir>` overrides the
  directory to re-hash (default: current directory).

## Compatibility & migration policy

- v2 is additive: fields will not be removed, renamed, or change semantics.
- Any future breaking change ships as `lockfileVersion: 3` with a new schema
  file; existing files are never silently rewritten.
