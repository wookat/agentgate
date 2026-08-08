# GAP-ROUND-254 — Deprecated OpenCode `tools` boolean map (AG-SK-002)

Date: 2026-08-08. Closes the boundary recorded in GAP-ROUND-248/249
("deprecated `tools:` boolean frontmatter not interpreted — conservative").

## Source-verified semantics (sst/opencode)

`packages/core/src/v1/config/agent.ts` — the deprecated `tools` map is
normalized into `permission` at load time, so it is live configuration, not
dead legacy:

```ts
for (const [tool, enabled] of Object.entries(agent.tools ?? {})) {
  const action = enabled ? "allow" : "deny"
  if (tool === "write" || tool === "edit" || tool === "patch") {
    permission.edit = action
    continue
  }
  permission[tool] = action
}
globalThis.Object.assign(permission, agent.permission)
```

- `tools.bash: true` ≡ `permission.bash: allow` → **high**.
- `tools.write|edit|patch: true` fold into `permission.edit: allow` → medium.
- `false` → deny → quiet; non-boolean values ignored (schema is
  `Record<string, boolean>`).
- Explicit `permission` keys override the tools-derived action (verified:
  `tools.bash: true` + `permission.bash: deny` stays quiet).

## Implementation

`normalizeOpencodeAgentPermission()` mirrors that normalization before the
existing AG-SK-002 frontmatter checks; severities unchanged from round 247.

## Corpus verification (rounds 248/249 corpora, 36+7 real repos re-scanned)

AG-SK-002 totals 525 → 633 (+108), all true positives — every new hit is a
real `tools: bash|write|edit: true` grant that was previously invisible:

| Repo | before → after |
| --- | --- |
| d-o-hub/rust-self-learning-memory | 5 → 50 |
| mitkox/ai-coding-factory | 0 → 23 |
| different-ai/agent-bank | 0 → 18 |
| TheCardGoat/lorcana-simulator | 2 → 7 |
| omar-A-hassan/medsci-agent | 0 → 6 |
| stolinski/graffiti | 0 → 5 |
| 10x-Anit/10x-Accountability-Coach | 8 → 12 |
| vsevolod-oparin/ct-transcriber-macos | 216 → 218 |

Non-risky tool grants (`read`, `grep`, `glob`, MCP tool names outside the
risky set) and `false` values stay quiet — 0 false positives observed.

## opencode.json coverage (same normalization)

`v1/config/config.ts`/`migrate.ts` apply the identical `tools` → permission
normalization to opencode.json, both top-level and per-agent
(`normalizeAction` folds `write`/`patch` into `edit`). The config-side
AG-SK-002 check now runs the same normalization. Corpus: the only wild
opencode.json `tools` maps found (d-o-hub/rust-self-learning-memory) grant
scoped MCP tool names (`memory-mcp_*`), not risky built-ins — correctly
quiet, 0 corpus delta from this part.

## State

Tests 428 → 431 (core 359). Self-scan 21 findings unchanged.
