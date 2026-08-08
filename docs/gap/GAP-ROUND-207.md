# GAP-ROUND-207 — Copilot-ecosystem corpus FP sweep (rounds 201–206 faces + AG-SK-001 precision)

## Scope

Flagship-corpus sweep of the Copilot CLI surfaces added in rounds 201–206, on 8 real
repos: github/awesome-copilot (official first-party marketplace), dotnet/skills,
dotnet/arcade-skills, microsoft/azure-skills, johnpapa/ai-ready, upstash/context7,
dotnet/msbuild, Avyayalaya/agent-council.

## New-face results (rounds 201–206)

- Marketplace mutable-source findings on awesome-copilot: 15 true positives
  (round-205, re-confirmed); pinned entries pass.
- azure-skills: real `@azure/mcp@latest` unpinned + MCPA-2026-0001 advisory matches
  through `.github/plugins/*` plugin configs — true positives.
- No false positives from the round-205/206 plugin/marketplace/LSP faces.

## Old-rule false positives found and fixed (7 across the corpus)

1. **AG-SK-001 exfiltration pattern** fired on "You MUST read the reference files
   relevant to the task…" (dotnet/skills ×3, awesome-copilot tldr-prompt,
   azure-skills ×2 — benign skill-doc structure telling the agent to read bundled
   reference/extension files). The pattern previously accepted a bare `file` target;
   it now requires a sensitive target (`ssh|key|token|secret|credential|.env|id_rsa`).
   Real exfiltration names one of those (fixture kept).
2. **AG-SK-001 concealment pattern** fired on "Do not show the user the tour until
   validation passes" (awesome-copilot code-tour — workflow gating; the artifact is
   shown eventually). Matches followed by `until` in the same sentence are skipped;
   "do not show the user this file" still fires.
3. **AG-SK-001 instruction-override** fired critical on anti-injection guidance
   quoting `"ignore previous instructions,"` as an example to disregard
   (awesome-copilot setup-my-iq AGENTS.md template). Double-quoted (straight and
   curly) spans now downgrade to `low` exactly like inline code spans (round-199).

## Honest remaining signal

- awesome-copilot `website/data/tools.yml` AG-RC-001 critical: the catalog data file
  really contains `curl … | sh` install instructions as YAML block-scalar content.
  Not masked — it is a real curl-pipe-shell line users are told to copy; recorded as
  a known boundary (data-catalog files are not distinguishable from scripts without
  semantics we don't model).
- Unscoped `Bash` in `allowed-tools` on awesome-copilot/azure-skills skills:
  true positives per the AG-SK-002 contract.

## Validation

- `pnpm build && pnpm lint && pnpm typecheck && pnpm test`: green
  (core 295 / cli 47 / config-convert 24).
- 8-repo corpus rescan after fix: 0 remaining AG-SK-001 criticals, true positives
  unchanged.
- Self-scan: 18 findings (unchanged).
