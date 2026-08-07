# GAP-ROUND-178 — PowerShell download-and-execute idioms

Date: 2026-08-08 · Round type: coverage completion (dangerous-command classifier)

## Surface

Round-177 boundary. With Windows-only hook command overrides now
extracted, a pure-PowerShell payload (`powershell -c "irm … | iex"`)
was still unclassified: RISKY_COMMANDS only modeled curl/wget forms.
`irm | iex` is the standard Windows install idiom (uv, Chocolatey,
Scoop docs) and equally standard in malware droppers.

## Change

Two RISKY_COMMANDS patterns (critical, same class as curl|sh):
- `irm|iwr|Invoke-RestMethod|Invoke-WebRequest … | iex|Invoke-Expression`
- `iex|Invoke-Expression ( irm|iwr|… ` call form

Applies everywhere the shared classifier runs: skill dynamic-context
commands, Claude/Kiro/Amazon Q/Cursor/VS Code folderOpen/Codex hooks,
including round-177's `commandWindows` overrides. Plain downloads
(`iwr … -OutFile`) stay clean. Also applied the round-176 newline fix to
the skill-side curl|sh pattern (`[^|;&]*` → `[^|;&\n]*`).

## Real corpus

Re-scan of all 15 corpus repos (r173 + r174 + r176): AG-SK-003 still 0
everywhere — no PowerShell droppers in the wild corpus, as expected for
benign flagship repos. True/false positives covered by unit fixtures
(irm|iex and iex(irm) → critical; iwr -OutFile → clean).

## Boundaries

- Obfuscated PowerShell (encoded commands via `-enc`, string
  concatenation) is not modeled — candidate only if real-world evidence
  appears.
- `Start-BitsTransfer` + later execution across separate statements is
  not correlated.

## Evidence

- Full suite green: core 254, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
