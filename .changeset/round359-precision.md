---
'mcp-agentgate-core': patch
---

Fresh-corpus precision (round 359): AG-CL-001 skips interleaved-run dummy tokens (alphabet letters + counting digits in lockstep), recognizes `testdata/` as a test path, and grades Firebase client configs (google-services.json / GoogleService-Info.plist) low; AG-SS-001 grades metadata references low in modules whose header declares a preventive purpose ("allowlists to prevent SSRF") and on inert `#`-commented config lines (shebangs and curl/wget lines stay high).
