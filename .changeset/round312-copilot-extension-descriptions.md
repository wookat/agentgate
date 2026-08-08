---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

AG-SK-001 now scans string-literal `description:` fields in Copilot CLI extension files (`.github/extensions/*/extension.{mjs,cjs,js}` and plugin-shipped `com.github.copilot/extensions/`) for hidden Unicode and prompt-injection patterns — tool/canvas descriptions registered via `joinSession({tools, canvases})` are injected into the model's context, so poisoned description text is an instruction channel even when the extension code itself is benign.
