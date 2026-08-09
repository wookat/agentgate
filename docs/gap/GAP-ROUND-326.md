# GAP-ROUND-326 — plugin `bin/` executables on the Bash tool PATH

## Gap

The Claude Code plugins reference documents `bin/`: files directly under a
plugin root's `bin/` are added to the Bash tool's `PATH` and invokable as
bare commands in any Bash tool call while the plugin is enabled. These are
repo-carried executables that run on the installing user's machine when the
model (or a poisoned instruction) invokes them — including by shadowing
common command names.

Most wild plugin bin entries are extensionless scripts, which the scanner
skipped entirely (not in `SOURCE_EXTENSIONS`): a `curl|sh` or dynamic-exec
primitive inside `bin/runner` was completely invisible (verified against
0.67.6/0.67.7).

## Fix

- Manifest-gated: files directly under a plugin root's `bin/` are source-
  scanned regardless of extension (binary blobs with NUL bytes skipped).
- AG-RC-001 treats extensionless plugin bin files as executable: a live
  `curl|sh` is critical, and dynamic code-execution primitives report medium
  with a "Plugin bin/ executable (on the Bash tool PATH while the plugin is
  enabled)" label. Shell-shebang bin files get the same echoed-string /
  quoted-heredoc masking as `.sh`.
- Only manifest-gated bin files reach source scanning without an extension,
  so generic repo `bin/` trees (npm packages etc.) are untouched.

## Wild verification

- r321 full corpus (496 wild plugin repos, 65 with a `bin/` dir):
  53 extensionless bin executables newly scanned (0 before).
- 4 bin findings total, all manually verified: 2 pre-existing `.sh`
  criticals (real curl|sh installers), 2 new mediums — genuine
  `child_process` exec primitives in model-invokable bin tools
  (fallguyconsulting/plumbline `bin/plumbline`, rjkaes/trueline-mcp
  `bin/trueline`). Zero false positives.

## Boundaries

- Shadow-name detection (a bin file named `git`/`ls` shadowing system
  commands) is not classified separately yet; content scanning applies
  either way.
- `bin/` files with source extensions (`.js`, `.sh`) were already scanned;
  their rule behavior is unchanged apart from the shared plugin-bin exec
  label for extensionless files only.
