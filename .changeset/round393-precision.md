---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Round 393 precision: AG-RC-001 no longer reports hyphenated compound nouns in prose ("code-exec (…)", "olmo-eval (…)") as dynamic code-execution primitives, and AG-SC-001 pin advice for unpinned OpenCode/Kilo npm plugins strips the trailing tag so the example is a valid spec (`@scope/plugin@1.2.3`, not `@scope/plugin@latest@1.2.3`).
