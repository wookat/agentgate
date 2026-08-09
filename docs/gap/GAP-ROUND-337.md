# GAP-ROUND-337 — routine windows + r335 grouping full-corpus verification (docs)

## Scope

Post-v0.67.11-release verification round. Three routine windows checked
honestly, plus a full-corpus verification of the r335 findings-table grouping
that r335 only measured on the r334 corpus.

## Advisory window — honest zero

- Authenticated GHSA + malware watch rerun (3-day window):
  `No uncovered MCP-related advisories found.`
- OSV npm export ETag unchanged since r335 (no diff possible).
- OSV PyPI export ETag changed, but ID-set diff vs the r315 snapshot is
  0 added / 0 removed (24,801 IDs both sides); the only 6 changed records are
  GitPython GHSA metadata refreshes — not MCP-related. No new entries.

## Client version window — quiet

goose v1.45.0, Codex rust-v0.147.0, Claude Code 2.1.226, opencode 1.18.15,
Crush 0.88.1, Gemini CLI 0.54.4, Copilot CLI 1.0.78, Qwen Code 0.21.8 — all
unchanged from r336 (cline 3.0.52 already dispositioned there).

## Website link-integrity crawl — clean

Full-site BFS crawl from `/` over 134 internal pages: every page 200. The
single non-200 href is Cloudflare's `/cdn-cgi/l/email-protection` scheme for
an obfuscated email address (script-decoded in browsers; 404 only to plain
fetchers) — platform behavior, not a site defect. Advisory API and JSON feed
both serve 100 entries, matching the bundled database.

## r335 table grouping — full 496-repo corpus

r335 measured grouping only on the r334 Agent Plugins corpus. Re-measured on
the full r321 wild plugin corpus (496 repos): exactly one repository
collapses — `lusha-oss/lusha-mcp-plugin`, where the same unauthenticated
server is declared in 4 manifest copies (`mcp.json` + `.claude-plugin/` +
`.cursor-plugin/` + `.github/plugin/` `plugin.json`), i.e. the multi-client
plugin convention at exactly the threshold. The collapsed row is correct
(4 identical rule/severity/target/message rows differing only in file), the
summary still counts 4, and JSON lists all four files. All other 495 repos'
tables are unchanged. No threshold adjustment warranted.

## Conclusion

No scanner defect, no advisory backlog, no site defect. No code change made
— honest clean round after the 0.67.11 release closure (npm verification,
tag, GitHub Release, deploy check, clean-environment regression all passed;
see the release: https://github.com/wookat/agentgate/releases/tag/v0.67.11).
