# Sources, assets and release clearance

Review date: 18 October 2026. This ledger distinguishes code licenses, sample rights and
composition/lyric rights. No new sound, photo, font, icon pack or artist artwork was downloaded.

| Item | Author/source | License evidence | Version / use | Changes and release decision |
|---|---|---|---|---|
| Application source | Hustlenix; repository [LICENSE](LICENSE) | Existing MIT notice | `app.js`, `index.html`, `styles.css` | Project MIT grant retained; proposed combined distribution AGPL-3.0-or-later. See LICENSING.md and the built SOURCE.html/source.zip. |
| Six demo compositions | Strudelify; existing [README](README.md) identifies these as original examples | Repository MIT declaration; provenance is a project declaration, not an independent music-rights investigation | `tracks/*.strudel`, public `tracks/catalog.json` | Note patterns and instruments retained; finite form and measured constant gain added. Previous versions preserved in Git and the separate music worktree. Human listening approval remains pending. |
| Strudel browser runtime, core and superdough | Strudel contributors, [official source](https://codeberg.org/uzu/strudel) | Installed 1.2.6 package metadata and LICENSE: AGPL-3.0-or-later; [integration guidance](https://strudel.cc/technical-manual/project-start/), [FAQ](https://strudel.cc/learn/faq/) | Unmodified `@strudel/web@1.2.6` through unpkg | Exact upstream web@1.2.6 source revision cbe7aaacfbf8a51f5f5cf39bf79319f273214e24 verified. Source access, full license and UI attribution included. Branding and release approval remain pending. |
| Existing interface icons and abstract SVG art | Existing project assets | Repository MIT declaration | Inline symbols; `assets/**/*.svg` | Kept. No Spotify artwork, fonts or proprietary frontend code imported. |
| Playwright | Microsoft, [source](https://github.com/microsoft/playwright) | Installed LICENSE: Apache-2.0 | 1.62.1, development audit only | Exact version locked under `release-audit/`. No production dependency. |
| Eight commercial-song study scores | Original songwriters/publishers remain relevant; synthesized arrangements in `tracks/covers/` | No publication permission recorded | Preserved in existing source history and music worktree | Excluded from the proposed public artifact. Do not count as approved covers. Existing public history is not erased by this change. |
| Commercial lyric transcripts | Original lyric rights holders; earlier automatic local transcriptions | No publication permission recorded | Exact private backup and earlier music branch/history preserve the drafts | Removed from this review branch tip and excluded from the preview artifact; loader will not request them. Earlier deployed copies/history remain until a reviewed replacement is approved. |
| Reference MP3s, separated stems and captured comparisons | User-supplied reference material; original artists/rights holders | No redistribution clearance recorded | Private local review only | Never copied to the preview, staged or uploaded. |
| RolandTR909 / dough-samples bank | [dough-samples](https://github.com/felixroos/dough-samples) | Individual sample provenance not established here | Used by private cover studies and earlier release | Public candidate no longer loads this bank. No sample bytes redistributed. |
| Analysis models and tools | Existing local music audit dependencies | Existing audit lockfiles and receipts; model terms need their own review if redistributed | Offline only | Not added to the application or public artifact. |

## Release decisions still required

Strudel's maintainers describe AGPL source-sharing obligations and ask independent projects to
avoid using “strudel” in their names. The proposed combined distribution is AGPL-3.0-or-later,
with MIT grants retained for project portions. Every artifact includes the application source.
The public name still needs an owner choice or recorded upstream permission before publication.
See the primary guidance above; this ledger records engineering evidence and open decisions.

Popularity, public availability, source-code licensing and permission to publish a musical
adaptation are separate facts. Public commercial studies need composition/arrangement clearance;
lyrics need separate recorded permission. No permission or human acceptance is inferred.

## Future assets

Record author, exact original URL, item-specific license and evidence URL, download date, local
path, modifications and use before adding an asset. Kenney packs, Lucide, shadcn, fonts and
photography remain uninstalled. A catalog entry needs recorded rights evidence and human review
before a commercial study can enter a future allowlisted public build.
