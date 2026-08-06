---
title: "AG-TP-001 · tool-poisoning"
description: Hidden Unicode and prompt-injection patterns in tool names, descriptions, and schemas.
---

Detects hidden Unicode and prompt-injection patterns in tool names, descriptions, and input schemas — the text your agent reads verbatim.

## What it checks

**Tool surface** (`--live`): the combined text of tool name + description + input schema is checked for:

- **Hidden/invisible Unicode** (`critical`) — zero-width characters, bidi controls, Unicode tag characters, private-use-area glyphs. These hide instructions from human review while remaining fully visible to the model.
- **Prompt-injection patterns** (`critical`) — e.g. `<instructions>`/`<secret>` style hidden-instruction tags, "ignore previous instructions", "do not tell the user", cross-tool coercion ("before using this tool… read/send…"), exfiltration instructions mentioning SSH keys / `.env` / credentials, and known poisoning markers.

**Source scan** (repo target): source files containing hidden/invisible Unicode are flagged with the codepoint and line. Trojan-Source-grade characters (bidi overrides, Unicode tag characters) are `high`; stray zero-width characters or BOMs — usually editor noise — are `low`. Emoji ZWJ/flag sequences and Nerd-Font private-use glyphs are not flagged.

**Configuration** (`--live`, `AG-XS-001`): with several servers configured, tool names are checked for collisions — two servers exposing the same tool name means whichever the client resolves last silently shadows the other (`high`) — and each tool's text is checked for instructions about *another server's* tools ("instead of X…", "before calling X…"), which is cross-server hijacking (`critical`).

## Agent skill files (AG-SK-001)

Repo scans also check **agent skill files** — `SKILL.md` anywhere in the tree,
any markdown under a `skills/` directory of an agent config tree
(`.agents/`, `.claude/`, `.cursor/`, `.codex/`, `.opencode/`), Windsurf
rules/workflows (`.windsurf/`, `.windsurfrules`), Cline rules (`.clinerules`,
`.cursorrules`), Cursor rule files (`.cursor/rules/*.mdc`), and Gemini CLI
custom commands (`.gemini/commands/**.toml`). Skills are
executed as agent instructions verbatim, so both hidden Unicode and
prompt-injection patterns in them are `critical`. One exception: an injection
pattern that sits *inside a fenced code block* is reported at `low` severity —
security and guardrail skills legitimately quote jailbreak strings as example
data, so those matches are surfaced for review instead of failing a `high`
gate. Hidden Unicode stays `critical` everywhere. Ordinary markdown (READMEs,
docs) is not treated as a skill and is never flagged by this rule.

## Why it matters

Tool descriptions are attacker-controlled model input. A poisoned description can redirect your agent to exfiltrate files or silently misuse other tools — this is the core mechanism of the [GitHub MCP-style prompt-injection incidents](/docs/threat-model/).

## Fixing findings

- Inspect the flagged tool text (the finding quotes the matched fragment). If the pattern is legitimate documentation, review carefully — false positives are possible but rare for these patterns.
- Remove the server, or pin its surface with [`agentgate lock`](/docs/cli/lock/) after replacing it with a trusted version.
- Strip hidden Unicode from your own tool descriptions; never encode instructions invisibly.
