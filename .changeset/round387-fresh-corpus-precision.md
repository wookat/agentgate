---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

Fresh-corpus precision (round 387): AG-RC-001 — dockerfile-named source files (`dockerfile.ts`, `sandbox-dockerfile.test.ts`) are no longer treated as executable Dockerfiles, a backslash-escaped pipe (`\|` in regex sources) is not a pipeline, `//` lines count as comments in C-family sources, and quoted curl|sh payload arguments in test-path scripts grade low; AG-SK-003 masks interpolation-free double-quoted echo strings (installer hints in error messages); AG-CL-001 grades demo-delimited filenames quietly; AG-SS-001 recognizes dangerous-named host denylists as defensive context.
