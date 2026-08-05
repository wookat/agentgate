# GAP-ROUND-17 — runner-appropriate pin advice

Round type: maintenance polish (found in round-14 output review).

AG-SC-001's remediation advice always used npm syntax, producing nonsense for
PyPI runners: `uvx flyto-core>=2.26` suggested "Pin an exact version (e.g.
flyto-core>=2.26@1.2.3)". The advice now strips the existing version/range
from the spec and uses the runner's own syntax — `pkg==1.2.3` for uvx/pipx,
`pkg@1.2.3` for npx/pnpx/bunx.

Verified via unit tests: `uvx gemini-bridge>=1.0` → suggests
`gemini-bridge==1.2.3`; `npx @scope/server@latest` → suggests
`@scope/server@1.2.3`.

## Remaining known gaps

Unchanged from GAP-ROUND-16.
