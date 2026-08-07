# GAP-ROUND-129 — real-corpus verification of Amazon Q coverage (no FPs found)

Date: 2026-08-07 · Round type: real-corpus FP sweep (same method as round 124)

## What was tested

GitHub code search for repos with real `.amazonq/rules/*.md` files; cloned
and scanned four with the current build (rounds 126–128 shipped in 0.28.0+):

| repo | .amazonq rules | findings under .amazonq | verdict |
| --- | --- | --- | --- |
| labsai/EDDI | project-context.md | 0 | clean |
| finos/FDC3 | fdc3.md | 0 | clean |
| db-ux-design-system/core-web | 3 files (incl. an MCP workflow rule) | 0 | clean |
| aws-samples/sample-aws-security-incident-response-integrations | 4 files | 0 | clean |

- All 9 real rule files were walked and skill-scanned; `lock --skills` on
  FDC3 pinned its `.amazonq/rules/fdc3.md` (2 skill files total).
- Zero AG-SK false positives on genuine Amazon Q rules content
  (project context, tech-stack conventions, MCP workflow instructions).

## Findings outside .amazonq (reviewed, all pre-existing behavior)

- EDDI: 2× AG-RC-001 critical are real `curl|sh` installer scripts
  (`install.sh`, `gcp/provision-vm.sh`) — true positives for the rule's
  intent; metadata-endpoint SSRF hits are k8s NetworkPolicy manifests that
  legitimately reference 169.254.169.254 to *block* it — arguably FP-shaped
  but low-volume; noted for a future severity/context pass on AG-SS-001.
- aws-samples repo: 3× AG-CL-001 xoxb tokens in `tests/` reported quietly
  as low — exactly the round-5 test-path design.

## Conclusion

No code change needed this round; coverage claims for `.amazonq/rules`
hold on real-world content. AG-SS-001 on network-policy manifests recorded
as a candidate improvement (context: deny-rules referencing the metadata IP).
