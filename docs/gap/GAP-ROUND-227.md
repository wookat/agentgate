# GAP-ROUND-227 — Precision sweep of rounds 225/226 Crush surfaces (real corpus)

Date: 2026-08-08
Round type: precision sweep (FP/TP verification at scale)

## Corpus (fresh clones, 2026-08-08)

GitHub code search: ~165 `crush.json` + ~114 `.crush.json` + ~16 `crushrc` files. Most hits are unrelated (scoop buckets, game data files literally named `crush.json`, `*candycrush.json`-style suffixed names). 13 repos batch-scanned covering both the adversarial (unrelated files named `crush.json`) and the real-user population:

| Repo | Crush-relevant content | Result |
| --- | --- | --- |
| Crownicles/Crownicles | game data `fightActions/crush.json` | 0 crush findings (correct — no `permissions`/`hooks`/`mcp` keys) |
| NetBSDfr/smolBSD | `service/crush/crush.json` (unrelated service config) | 0 crush findings |
| hoilc/scoop-lemon | scoop bucket `crush.json` manifest | 0 crush findings |
| GowayLee/cchooks | real `.crush.json`, lsp-only | 0 findings (correct negative) |
| capotej/abbey, geoffjay/agentd, folknor/pine-tools, claha/smart-home, daverage/tinyMem, gfauredev/LogOut, fabric-testbed/loomai, connerohnesorge/spectr | real `.crush.json` configs | 0 crush FPs (other findings unrelated to this round) |
| reVrost/counterspell | real `.crush.json`: `allowed_tools` incl. `edit`, `mcp` with 2 docker servers | AG-SK-002 medium TP + servers discovered; exposed one genuine FP (below) |

Suffixed names (`BitCrush.json`, `com.x.candycrush.json`, `charmbracelet.crush.json`) verified not to match `CRUSH_CONFIG_FILE` — the regex requires the exact `crush.json`/`.crush.json` basename.

## Bug found and fixed

AG-SC-001's docker check fired on any `docker` command whose args contained `run` anywhere, taking the last non-flag arg as the image. `docker mcp gateway run --servers=context7` (Docker MCP Toolkit gateway, real config in reVrost/counterspell) misreported image `"run"` as unpinned. Fixed: the check now requires the first positional arg to be `run` (or `container run`), so CLI plugin forms (`docker mcp …`, `docker compose run …`) are excluded; genuine `docker run mcp/playwright` unpinned-image detection preserved (same repo, still reports).

## Validation

- New unit tests: `docker mcp gateway run` and `docker compose run svc` not flagged; `docker run`/`docker container run` unpinned still flagged.
- Full checks green: 334/47/24 tests, lint, typecheck; self-scan 19 findings unchanged.
- Re-scan of counterspell after fix: gateway FP gone, `mcp/playwright` unpinned TP and `edit` pre-approval TP remain.

## Boundaries

- `crushrc.bridge`/`crushrc.readonly` style suffixed variants (jinwon-int/ccc-node) don't match the `crushrc` scan gate — they are only activated by user tooling that copies them into place; out of scope.
- Docker image extraction still uses the last-positional-arg heuristic within genuine `docker run` forms (command args after the image could in principle shift it); no wild FP observed.
