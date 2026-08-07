# GAP-ROUND-131 — AG-SS-001 context pass for network-policy manifests

Date: 2026-08-07 · Round type: FP fix (carried from round 129's real-corpus sweep)

## Gap (real evidence)

Round 129 found labsai/EDDI's `helm/eddi/templates/networkpolicy.yaml` and
`k8s/overlays/production/network-policy.yaml` flagged AG-SS-001 high —
but both reference 169.254.169.254 in `except:`/deny blocks precisely to
*block* metadata access. Flagging a defensive control as a
credential-theft vector at high severity is FP-shaped noise.

## Fix

`checkSource`: for `.yaml`/`.yml` files whose content declares
`kind: NetworkPolicy` (also Cilium/CiliumClusterwide/Global variants,
matches inside Helm templates), the metadata-endpoint hit downgrades to
**low** with the message "verify the rule blocks (not allows) it" —
not silenced, because an *allow* rule for the metadata IP would still be
worth eyes.

## Verification

- New scanner test: k8s except-block + Cilium egressDeny → low;
  a `fetch.sh` hitting the metadata endpoint stays high.
- Re-scan of EDDI with this build: the two manifest hits drop
  high → low (7 findings total, unchanged count); provision-vm.sh's
  metadata reference stays high (a shell script actually querying it).

## Evidence

- Full suite green: core 209, cli 47, config-convert 24.
