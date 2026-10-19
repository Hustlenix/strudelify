# Sources, assets and release clearance

Baseline review: 18 October 2026; resource adoption update: 19 October 2026.
This ledger distinguishes code licenses, sample rights and composition/lyric rights.
The resource update adds only the Lucide SVG selection recorded below.

| Item | Author/source | License evidence | Version / use | Changes and release decision |
|---|---|---|---|---|
| Application source | Hustlenix; repository [LICENSE](LICENSE) | Existing MIT notice | `app.js`, `index.html`, `styles.css` | Project MIT grant retained; proposed combined distribution AGPL-3.0-or-later. See LICENSING.md and the built SOURCE.html/source.zip. |
| Six demo compositions | Strudelify; existing [README](README.md) identifies these as original examples | Repository MIT declaration; provenance is a project declaration, not an independent music-rights investigation | `tracks/*.strudel`, public `tracks/catalog.json` | Note patterns and instruments retained; finite form and measured constant gain added. Previous versions preserved in Git and the separate music worktree. Human listening approval remains pending. |
| Strudel browser runtime, core and superdough | Strudel contributors, [official source](https://codeberg.org/uzu/strudel) | Installed 1.2.6 package metadata and LICENSE: AGPL-3.0-or-later; [integration guidance](https://strudel.cc/technical-manual/project-start/), [FAQ](https://strudel.cc/learn/faq/) | Unmodified `@strudel/web@1.2.6` through unpkg | Exact upstream web@1.2.6 source revision cbe7aaacfbf8a51f5f5cf39bf79319f273214e24 verified. Source access, full license and UI attribution included. Branding and release approval remain pending. |
| Existing abstract SVG art and brand mark | Existing project assets | Repository MIT declaration | `assets/covers/*.svg`, `assets/icon.svg`, inline brand mark | Kept. Existing control symbols replaced by the Lucide selection below. |
| Playwright | Microsoft, [source](https://github.com/microsoft/playwright) | Installed LICENSE: Apache-2.0 | 1.62.1, development audit only | Exact version locked under `release-audit/`. No production dependency. |
| Eight instrumental study scores | Original songwriters/publishers retain underlying rights; existing `tracks/covers/` arrangements | Owner explicitly requested deployment on 19 October; no rights-holder clearance claimed | Exact prior scores; `runtime-verified`, musical review unapproved | Restored to the named public allowlist; see COVER_STUDIES.md. No artist recordings or lyrics included. |
| Commercial lyric transcripts | Original lyric rights holders; earlier automatic local transcriptions | No publication permission recorded | Exact private backup and earlier music branch/history preserve the drafts | Removed from this review branch tip and excluded from the preview artifact; loader will not request them. Earlier deployed copies/history remain until a reviewed replacement is approved. |
| Reference MP3s, separated stems and captured comparisons | User-supplied reference material; original artists/rights holders | No redistribution clearance recorded | Private local review only | Never copied to the preview, staged or uploaded. |
| RolandTR909 / dough-samples bank | [Registry](https://github.com/felixroos/dough-samples), [upstream files](https://github.com/ritchse/tidal-drum-machines) | Individual sample licensing not established; no CC0 claim | Three existing study instrument mappings; URLs pinned to 15eac73c5e878550f91d864a4863e014799403f1 | Loaded only when a study needs percussion; no sample bytes in the repository or archive. See COVER_STUDIES.md. |
| Analysis models and tools | Existing local music audit dependencies | Existing audit lockfiles and receipts; model terms need their own review if redistributed | Offline only | Not added to the application or public artifact. |

## Release decisions still required

Strudel's maintainers describe AGPL source-sharing obligations and ask independent projects to
avoid using “strudel” in their names. The proposed combined distribution is AGPL-3.0-or-later,
with MIT grants retained for project portions. Every artifact includes the application source.
The public UI now uses Hustlenix Music, following the instruction to complete the remaining
release work. The repository URL and historical attribution are retained. No upstream endorsement
is claimed. Full listening/device review and final publication approval remain pending.
See the primary guidance above; this ledger records engineering evidence and open decisions.

Popularity, public availability, source-code licensing and permission to publish a musical
adaptation are separate facts. Public commercial studies need composition/arrangement clearance;
lyrics need separate recorded permission. No permission or human acceptance is inferred.

## Future assets

Record author, exact original URL, item-specific license and evidence URL, download date, local
path, modifications and use before adding an asset. Kenney packs, shadcn, fonts and
photography remain uninstalled. A catalog entry needs recorded rights evidence and human review
before a commercial study can enter a future allowlisted public build.

## Adopted resource register — 19 October 2026

| Asset ID | Type | Name | Author | Source URL | License | License evidence | Downloaded on | Local path | Changes | Used in | Review notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| lucide-controls-1.59.0 | SVG code/art | 21 selected Lucide controls | Lucide Icons and Contributors; Cole Bemis for Feather-derived icons | [Exact official package](https://registry.npmjs.org/lucide-static/-/lucide-static-1.59.0.tgz) | ISC and retained Feather MIT | Package LICENSE preserved verbatim in `licenses/Lucide-LICENSE.txt`; [official licensing](https://lucide.dev/license) | 2026-10-19 | `assets/icons/lucide.svg`; `assets/icons/lucide-provenance.json` | Selected geometry; renamed IDs; one sprite; inherited host styling | `index.html`, `app.js` | Package SHA-512 verified before reading. Receipt records all original SVG SHA-256 hashes and sprite hash. No package JS installed/executed. |

Rebuild the pinned selection with `python release-audit/vendor_icons.py`. Normal release
builds use committed assets and need no icon download. The allowlist includes the sprite,
receipt and full license; the application source archive also includes the rebuild script.
