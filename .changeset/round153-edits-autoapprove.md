---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks the `chat.tools.edits.autoApprove` glob map in VS Code workspace settings: a catch-all (`"**/*": true`) with no re-denied sensitive paths, or `true` on a sensitive path (`.env`, `.vscode`, `.github`, keys/secrets), is medium. The documented safe pattern (catch-all plus `false` re-denies) stays clean.
