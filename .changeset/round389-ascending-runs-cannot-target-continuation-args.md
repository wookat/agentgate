---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Fresh-corpus precision (round 389): AG-CL-001 skips secret-shaped values containing an 8+ ascending character run (keyboard-walk demo filler like `AKIA1234567890ABCDEF` or alphabet-run `ghp_ABCDEF…`); AG-SS-001 recognizes "cannot target" rejection wording as defensive context; AG-RC-001 masks quoted-string-only continuation-line arguments (diagnostic wrappers like `doctor_fail \` + `"curl … | sh"`), while interpreter/eval/ssh continuation chains stay live.
