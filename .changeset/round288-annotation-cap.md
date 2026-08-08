---
'mcp-agentgate': patch
---

GitHub Actions annotations: cap at 10 per level (GitHub's per-step display limit) in severity order and add a summary annotation for the rest, instead of emitting hundreds of workflow commands that GitHub silently drops. Applies to scan/ci/deps finding annotations and lockfile drift annotations.
