---
'mcp-agentgate-core': patch
---

AG-RC-001 grades the non-executable curl|sh text warning low in test/fixture paths (tests/, testdata/, __tests__/, fixtures/, *.test.*, *_test.*, test_*): security test suites quote curl|sh strings as deny-test payloads and sandbox fixtures. Executable files and non-test documentation are unchanged.
