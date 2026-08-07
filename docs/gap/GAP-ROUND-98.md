# GAP-ROUND-98 — deps FP sweep, PyPI side: import-name aliases + 3.14 stdlib

Date: 2026-08-07

## Context

Round 97 swept npm-side repos; this round swept Python repos with the
same released 0.20.0 `deps` (fresh shallow clones).

## Real results (pre-fix)

| Repo | Time | Findings |
|---|---|---|
| tiangolo/fastapi | 1.0s | 3× AG-DP-001 critical — `git`, `yaml`, `annotationlib`; 1 low `docs_src` |
| encode/httpx | 0.8s | none |
| pallets/flask | 1.0s | 5× low — test-fixture module names (see below) |

## FPs fixed

1. **Import-name ≠ distribution-name**: `import yaml` / `import git`
   are PyPI `pyyaml` / `gitpython` — both declared in fastapi's
   pyproject, but the import names were registry-checked verbatim and
   "don't exist". Added a curated alias map (yaml, git, PIL, cv2, bs4,
   dateutil, dotenv, sklearn, jwt, OpenSSL, Crypto, serial, magic,
   docx, pptx, fitz, github, MySQLdb, attr) applied before the
   declared-check and registry lookup.
2. **Python 3.14 stdlib**: `annotationlib` (PEP 749) and `compression`
   (PEP 784) added to the stdlib list.
3. **Local namespace packages**: only the immediate parent dir of a
   .py file counted as local, so `from docs_src.tutorial import app`
   flagged `docs_src`. Now every directory component on a .py file's
   path counts as a local package root.

Post-fix: fastapi 0 findings, httpx 0.

## Remaining (honest, judged acceptable)

flask still reports 5 low AG-DP-001 (`config_module_app`,
`site_package`, …) — its tests import modules that the test suite
materializes at runtime into a fake site-packages; the files genuinely
don't exist in the tree. Low severity, does not gate at the default
`high`; no general static signal distinguishes these from real
phantoms.

## Verification

Suite green: core 186 / cli 40 / config-convert 21;
build/lint/typecheck pass. One existing unit expectation updated to the
new mapping (yaml→pyyaml) — behavior change is the point of the fix.
