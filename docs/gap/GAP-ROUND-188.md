# GAP-ROUND-188 — Shape-based hook/monitor config detection

Date: 2026-08-08 · Round type: evasion-gap closure (round-182/186 boundary)

## Problem

Plugin manifests can point `hooks` and `experimental.monitors` at arbitrary
relative paths (`"hooks": "./config/hooks.json"`). Rounds 182/186 only
matched the conventional locations (`hooks/hooks.json`,
`monitors/monitors.json`) plus inline manifest config, so a dangerous
config placed at a custom path escaped AG-SK-003 entirely.

## Change

Shape-based fallback: any repo JSON file whose structure matches the hook
schema (object `hooks` field with nested `type: "command"` entries) or the
monitor schema (array of `{ name, command, description }` entries) gets
its commands run through the shared dangerous-command classifier. Since
only risky patterns fire, benign look-alike JSON (package.json `hooks`
maps, app configs) produces nothing.

## Real corpus (10 repos, unmodified)

0 shape-based findings across the round-181 corpus and round-176 flagship
set (incl. JSON-heavy WordPress-iOS/perseus/dlt). True positives covered by
unit fixtures (custom-path hooks critical + monitor-shaped exfil high; a
package.json with an npm-style `hooks` map correctly stays clean).

## Boundaries

- Shape detection cannot attribute the file to a specific plugin; the
  message says "if this config is referenced by a plugin manifest".
- Non-JSON hook config formats are not modeled.

## Evidence

- Full suite green: core 267, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
