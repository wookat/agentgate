---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Output-style markdown is now scanned as model-facing instruction content: project-level `.claude/output-styles/*.md`, the plugin `output-styles/` component dir (manifest-gated, including marketplace `plugins/<name>/output-styles/`), and manifest-declared `outputStyles` paths — output styles inject directly into the system prompt, so poisoned styles report like poisoned skills and are lockable via `lock --skills`.
