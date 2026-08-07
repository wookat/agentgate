# GAP-ROUND-146 — VS Code workspace chat tool auto-approval

Date: 2026-08-07 · Round type: overprivilege coverage (VS Code)

## Source (official)

code.visualstudio.com/docs/copilot/security: "Overall tool
auto-approval: Bypasses all user approvals, potentially leading to
destructive actions, updating sensitive workspace files, or executing
arbitrary code. This applies to the chat.tools.global.autoApprove
setting..." The legacy spelling `chat.tools.autoApprove` is what real
repos actually contain (~270 checked-in `.vscode/settings.json` files
per GitHub code search).

## Gap

`.vscode/` was not walked at all, so a checked-in workspace settings
file silently granting blanket auto-approval — strictly stronger than
anything AG-SK-002 flags for Claude/OpenCode/Gemini/Roo — was
invisible.

## What shipped

- `.vscode` added to the walked agent dot-dirs, restricted to
  `settings.json` / `mcp.json` (launch/task configs are not scanned —
  same pattern as the round-124 `.github` fix, pre-empting FPs from
  launch commands).
- AG-SK-002 flags `chat.tools.global.autoApprove: true` or legacy
  `chat.tools.autoApprove: true` → high (one finding, current key
  preferred).

## Corpus verification

- microsoft/mcp-dotnet-samples and debs-obrien/debbie.codes:
  `"chat.tools.autoApprove": true` → high (true positives; the former
  is an official Microsoft samples repo).
- bmad-code-org/BMAD-METHOD: explicit `false` → correctly 0.

## Honest boundaries

- `chat.tools.terminal.autoApprove` (per-command-pattern map) and
  `chat.tools.edits.autoApprove` (per-glob map) are finer-grained
  surfaces not yet modeled — candidate for a later round.
- Org-managed settings can override the workspace value at runtime; a
  static scanner can't see that, so the checked-in value is reported
  as-is.

## Evidence

- Full suite green: core 220, cli 47, config-convert 24.
- Self-scan unchanged (17 findings) — agentgate has no .vscode dir.
