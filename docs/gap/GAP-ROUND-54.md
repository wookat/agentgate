# GAP Report — Round 54 (client-list messaging drift after 0.12.0)

## Gap

Round 52/53 shipped nine-client discovery/convert, but four public surfaces
still said six (or four) clients:

- README quick-start intro (line ~32) and CI-coverage paragraph.
- README config-portability section.
- Homepage "Install" feature card (said four clients).

Same class of drift as round 45's "seven rules" — messaging lags features.

## Fixed

All client lists updated to include Windsurf, Cline, and Gemini CLI
(README EN sections + homepage card; zh README and docs pages were already
updated in rounds 52/53).

## v0.12.0 release verification (this round)

- npm deps clean (no `workspace:*`); config-convert@0.2.0 registry readme
  renders the new 9-client table.
- Clean-env regression: Windsurf + Gemini configs discovered under a fake
  HOME; `gemini-bridge>=1.0` matched AG-SC-001/AG-SC-003 through the new
  discovery; windsurf→gemini-cli convert works.

## Note to future rounds

Client lists now appear in: README (3 places), README.zh-CN (2), homepage
card, quick-start, scan doc, introduction doc, config-convert doc + README.
When adding a client, grep for `OpenCode` to find them all.
