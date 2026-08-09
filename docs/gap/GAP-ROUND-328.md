# GAP-ROUND-328 — fresh-corpus precision sweep of rounds 325–327 (docs)

## Scope

New-surface window first: all nine tracked clients unchanged (Claude Code
2.1.226, Codex 0.147.0, Gemini CLI 0.54.4, Copilot CLI 1.0.78, opencode
1.18.15, Crush v0.88.1, goose v1.45.0, Kilo, Qwen) — no new repo-carried
surfaces to model. So this round precision-tests the rounds 325–327 surfaces
(output-style markdown, plugin bin/ scanning, bin shadow-naming) on a fresh
corpus outside the r321 sample, per the r297/304/321 method.

## Corpus

- GitHub code search: `path:.claude-plugin filename:plugin.json` (200 repos,
  3 not in r321) + `path:bin filename:plugin.json` (45 repos not in r321).
- 48 wild repos cloned (r328 corpus), including large generic codebases with
  huge `bin/` trees (Prowler/ScoutSuite vendored, Jupyter static assets).

## Results

- Zero new false positives from rounds 325–327:
  - no shadow-named bin findings anywhere;
  - no extensionless plugin-bin files in this corpus (the plugin gate
    correctly never fired on generic `bin/` trees — including a repo with
    21,638 scanned files whose `bin/` vendors two security scanners);
  - head-to-head vs released 0.67.7 on the four largest repos: identical
    scanned-file and finding counts except one repo where the only delta is
    7 newly visible `output-styles/*.md` (genuine persona styles, r325
    surface) with zero new findings.
- Pre-existing findings in generic `bin/` trees (test-path AG-CL-001 lows,
  vendored-minified AG-TP-001 lows) are extension-based scanning that
  predates round 326 and behaves identically on 0.67.7.

## Conclusion

No scanner defect found; rounds 325–327 add visibility without noise on a
corpus disjoint from the one they were developed against. No code change.
