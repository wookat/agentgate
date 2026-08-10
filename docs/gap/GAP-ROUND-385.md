# GAP-ROUND-385 — fresh-corpus precision: pattern-list scalars, env placeholders, gitleaks baselines, IOC headers, test_ files

Date: 2026-08-03. Round type: routine advisory windows + fresh real-corpus verification.

## Advisory windows (all clear)

- Authenticated `api/scripts/watch.mjs`: **no uncovered MCP-related advisories**.
- OSV npm snapshot: ETag changed (`14bc0eba…`) but the MAL id set and file
  contents are byte-identical to the previous snapshot (`diff -rq` zero).
- OSV PyPI: ETag unchanged (`df798022…`).
- Nine-client version window: no changes (claude-code v2.1.226, gemini-cli
  v0.54.4, copilot-cli v1.0.78, crush v0.88.1, qwen-code v0.21.8, codex
  rust-v0.147.0, cline 3.0.52, opencode-ai 1.18.15, goose v1.45.0).
- Production consistency: repo = API = feed = **109** advisories.

## Fresh corpus

140 previously-unseen repositories (24 repository-search queries across the
seven agent surfaces, 1,805 unique candidates, 1,734 unseen, 140 selected;
`/home/ubuntu/corpora/r385`). Full scan: **659 findings** (8 critical,
60 high). Every critical and every AG-CL/SS/TP-001 high was read in source
context.

## True positives preserved

- `D-URing/CodeWAM scripts/setup_local_env.sh` — live `curl … | sh` uv installer.
- `RayFernando1337/…/workflows/cursor-review.yml` — live `curl https://cursor.com/install -fsS | bash` in a workflow step.
- `entropy-om/heretic-coder-pipeline stage2/remote/setup.sh` — live uv installer.
- `frontmatters/agentBrain scripts/*.sh` (4 files) — live installer pipelines.
- `PrismorSec/prismor canary.py` — PEM-template AG-CL-001 stays high (see residuals).

## False-positive classes fixed (each verified in original source context)

1. **AG-RC-001 — bare scalars under a plural `patterns:` list** (critical →
   low). `PrismorSec/prismor prismor/runtime/default_policy.yaml:485` is a
   defensive policy rule table: `patterns:` followed by bare quoted regex
   scalars (`'\b(curl|wget)\b[^|;\n]*\|\s*(bash|sh|…)\b'`). The existing
   `isDenyListEntry` recognized `pattern:`-keyed row fields and `matches:`
   tables but not a plural list key over bare scalars. Fix: the own-key and
   row-field pattern key sets accept plural forms (`patterns`, `regexes`,
   `regexps`), and the upward key scan treats an enclosing plural pattern-list
   key as detection data. Live workflow `run:` pipelines are regression-pinned.
2. **AG-CL-001 — all-caps snake_case env placeholders** (high → skip).
   `miou1107/ownmind/.mcp.json` sets `OWNMIND_API_KEY:
   "__SET_VIA_LOCAL_CREDENTIALS_OR_ENV__"` with a comment explaining the real
   key loads from `~/.ownmind/credentials`. Values that read as
   underscore-separated all-caps words are env-var-style placeholder names,
   never key material. Real opaque tokens are regression-pinned high.
3. **AG-CL-001 — gitleaks baseline JSON** (high → skip).
   `awslabs/aidlc-workflows/.gitleaks-baseline.json` records gitleaks matches
   (the canonical HS256 example JWT) as scanner output. The existing
   scanner-config exemption covered `.gitleaks*.toml` and `.secrets.baseline`
   but not the JSON baseline form; the filename gate now accepts `.json`.
4. **AG-SS-001 — IOC-database headers** (high → low).
   `PrismorSec/prismor supplychain/ioc.py` opens with "IOC (Indicators of
   Compromise) database for known supply chain attacks" and lists metadata
   endpoints as indicators far below. `headerDefensive` now also accepts an
   IOC/indicators-of-compromise + database/list/table/feed header. Bare
   metadata probes without such a header stay high (regression-pinned).
5. **AG-TP-001 — `test_*`/`*_test` filenames** (high → low).
   `KernelLord/pickysteve eval/test_gate_security.py:84` builds intentional
   RLO/Tag-block obfuscation attack variants to test its own gate. The
   AG-TP-001 test-path heuristic matched test directories and `.test.*`
   suffixes but not Python-convention `test_*.py`/`*_test.py` filenames.

## Head-to-head

15 corpora (r343…r385, 1,673 repos) scanned with main (d608273) vs this
branch; every changed line was manually classified as one of the five classes
above (see PR description for the exact delta).

## Residual gaps (documented, not fixed)

- `PrismorSec/prismor prismor/runtime/canary.py:49` — an SSH private-key
  *template* string (`_SSH_TEMPLATE` with `{body}`/`{marker}` placeholders)
  in a non-test path still reports AG-CL-001 high. Single occurrence; a
  PEM-template-with-format-placeholder heuristic is deferred until a second
  independent example appears.
- AG-SK-002 medium volume (233) remains rule-semantics-correct on sampling
  (unscoped dangerous allowed-tools grants in real skill frontmatter).
