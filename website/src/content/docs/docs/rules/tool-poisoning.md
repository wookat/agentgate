---
title: "AG-TP-001 · tool-poisoning"
description: Hidden Unicode and prompt-injection patterns in tool names, descriptions, and schemas.
---

Detects hidden Unicode and prompt-injection patterns in tool names, descriptions, and input schemas — the text your agent reads verbatim.

## What it checks

**Tool surface** (`--live`): the combined text of tool name + description + input schema is checked for:

- **Hidden/invisible Unicode** (`critical`) — zero-width characters, bidi controls, Unicode tag characters, private-use-area glyphs. These hide instructions from human review while remaining fully visible to the model.
- **Prompt-injection patterns** (`critical`) — e.g. `<instructions>`/`<secret>` style hidden-instruction tags, "ignore previous instructions", "do not tell the user", cross-tool coercion ("before using this tool… read/send…"), exfiltration instructions mentioning SSH keys / `.env` / credentials, and known poisoning markers.

**Source scan** (repo target): source files containing hidden/invisible Unicode are flagged at `high`.

## Why it matters

Tool descriptions are attacker-controlled model input. A poisoned description can redirect your agent to exfiltrate files or silently misuse other tools — this is the core mechanism of the [GitHub MCP-style prompt-injection incidents](/docs/threat-model/).

## Fixing findings

- Inspect the flagged tool text (the finding quotes the matched fragment). If the pattern is legitimate documentation, review carefully — false positives are possible but rare for these patterns.
- Remove the server, or pin its surface with [`agentgate lock`](/docs/cli/lock/) after replacing it with a trusted version.
- Strip hidden Unicode from your own tool descriptions; never encode instructions invisibly.
