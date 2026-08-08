# GAP-ROUND-297 — wild-corpus precision sweep of AG-DP-007 (rounds 294/296)

## Corpus

GitHub code search for remote dependency specifiers, 364 wild manifests
fetched (`~/corpora/r297`): `package.json` (`.tgz`, `git+ssh`,
`archive/refs/heads` queries), `requirements*.txt` and `pyproject.toml`
(`@ git+https`, `archive` queries), 100 results per query, deduped.

## Results

- 229 AG-DP-007 findings (88 high / 141 medium) across the 364 manifests
  after the fixes below; 15-sample random audit — 15/15 true positives
  (spec present verbatim in the manifest, severity per policy).
- Shapes confirmed in the wild: GitHub branch/tag archives (`archive/refs/
  heads/…`, `archive/1.3u.tar.gz`), `git+ssh://git@github.com`, GitLab
  (incl. self-hosted `gitlab.kuleuven.be`), CDN mirrors of GitHub artifacts
  (`gh.dgcf.link`, `cdn.jsdelivr.net/gh/...`), tag-addressed `.zip`.

## Fixes found by the sweep

1. **Missed wild PyPI requirement forms** (10 additional hits after fix):
   - extras: `unsloth[colab-new] @ git+https://…`
   - editable + egg fragment: `-e https://…/archive/master.zip#egg=pushbullet.py`
   - bare URL requirement lines (pip installs these directly):
     `https://github.com/kpu/kenlm/archive/master.zip`,
     `git+https://github.com/mlfoundations/open_lm.git` — name taken from
     `#egg=` when present, else the repo/archive path segment.
2. **False positive: commit-addressed forge archives** (2 in the corpus):
   `…/archive/<40-char-sha>.zip` is fixed by the commit, same immutability
   as `git+…@<sha>`; now exempt via `isImmutableRemoteSpec`
   (`COMMIT_ARCHIVE`). Branch/tag-addressed archives remain high.

## Boundaries

- Direct wheel URLs (`https://…/torch-2.0.1+cu118-….whl`) are skipped:
  filename is not a clean distribution name; version-addressed artifact,
  low risk, no finding either way.
- `--index-url`/`--extra-index-url` and other pip options are ignored as
  before (index hijack is a different surface).
