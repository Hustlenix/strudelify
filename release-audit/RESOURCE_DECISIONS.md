# Resource adoption decisions

The supplied kit is a research reference. This MVP retains static HTML/CSS/JavaScript,
Strudel 1.2.6 and the current design. No framework, backend, paid service, UI system or
new sample pack is introduced. One Codex agent, one branch: `codex/mvp-recovery`.

Only installed license evidence is described as verified below. Other license labels are
the kit's reported terms, **not freshly verified asset permissions**; recheck the exact
item/version before adoption. Deferred resources have no installed version or file ownership.

| Resource | Decision | License / evidence | Ownership now | Integration value / reason |
|---|---|---|---|---|
| [Existing Strudelify](https://github.com/Hustlenix/strudelify) | KEEP | User-owned project, review MIT status | Application and release-audit/ | Existing UI, CSS, player, demo tracks, readme and work |
| [Official Strudel integration](https://strudel.cc/technical-manual/project-start/) | KEEP | AGPL-3.0-or-later verified from installed 1.2.6 metadata/LICENSE | Application and release-audit/ | Embedding, official runtime APIs, version pinning |
| [Strudel sample docs](https://strudel.cc/learn/samples/) | KEEP | Docs free, individual sample rights must be verified | Application and release-audit/ | Sample registry / `bank()` syntax / dependency checks |
| [Strudel FAQ](https://strudel.cc/learn/faq/) | KEEP | Free | Application and release-audit/ | Naming and attribution, sound export, project terms |
| [shadcn/ui (official)](https://ui.shadcn.com/) | ADOPT LATER | Official repo MIT; third-party registries vary | No owned files changed now | Accessible menus, dialogs, sidebars, form controls, tabs No assets/components needed by the confirmed failures; keep current UI and native synths. |
| [Lucide](https://lucide.dev/icons/) | ADOPT LATER | Free, ISC | No owned files changed now | Player icons, volume, playlists, forks, controls No assets/components needed by the confirmed failures; keep current UI and native synths. |
| [Next.js Supabase Starter](https://vercel.com/templates/authentication/supabase) | ADOPT LATER | Free template, external service limits | No owned files changed now | Only deferred auth-starter reference selected; cookie/session and RLS patterns later. No cloning, account, service or migration now. |
| [Vercel Git integration](https://vercel.com/docs/git/vercel-for-github) | ADOPT LATER | Platform usage / Hobby restrictions | No owned files changed now | Preview builds, production deployment on reviewed branch |
| [Playwright](https://playwright.dev/docs/intro) | ADOPT NOW | Apache-2.0 verified from installed 1.56.1 LICENSE | release-audit/ only | Browser tests for audio loading, UI, previews |
| [GitHub Actions](https://docs.github.com/en/actions) | KEEP | Free quotas depend on repo/plan | Application and release-audit/ | CI gates on engine, catalog and app changes |
| [Tonal.js](https://github.com/tonaljs/tonal) | ADOPT LATER | MIT | No owned files changed now | Scales, notes, keys, chords, transpose and harmonic helpers |
| [music-metadata](https://github.com/Borewit/music-metadata) | ADOPT LATER | MIT | No owned files changed now | Audio metadata, duration, tags for *local* MP3 analysis |
| [WaveSurfer.js](https://wavesurfer.xyz/) | ADOPT LATER | BSD-3-Clause | No owned files changed now | Waveforms, regions, annotations for recordings / rendered output |
| [Meyda](https://github.com/meyda/meyda) | ADOPT LATER | MIT | No owned files changed now | JS spectral features and lightweight audio checks |
| [librosa](https://librosa.org/) | KEEP offline only | ISC | Existing private music audit; no app dependency | Offline tempo, beat, pitch-class and structure aids |
| [Audacity](https://www.audacityteam.org/) | ADOPT LATER | Free/open-source software | No owned files changed now | Optional human A/B annotation tool; private browser comparison already exists. |
| [Tone.js](https://tonejs.github.io/) | REJECT for this MVP | MIT | No owned files changed now | A second audio scheduler is unnecessary. |
| [CodeMirror](https://codemirror.net/) | ADOPT LATER | MIT packages | No owned files changed now | Optional custom syntax-highlighted code editor |
| [Yjs](https://github.com/yjs/yjs) | ADOPT LATER | MIT | No owned files changed now | CRDT collaboration and shared code editing |
| [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API) | ADOPT LATER | Open API with usage rules | No owned files changed now | Recording/artist/album metadata matching |
| [Cover Art Archive](https://musicbrainz.org/doc/Cover_Art_Archive) | REJECT for this MVP | Accessible archive; artwork copyright not guaranteed | No owned files changed now | Accessible artwork does not establish republication permission. |
| [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) | ADOPT LATER | CC0, 100 files | No owned files changed now | UI clicks, toggle effects, publish-success cues No assets/components needed by the confirmed failures; keep current UI and native synths. |
| [Kenney UI Audio](https://kenney.nl/assets/ui-audio) | ADOPT LATER | CC0, 50 files | No owned files changed now | Menu clicks and switches No assets/components needed by the confirmed failures; keep current UI and native synths. |
| [Kenney Music Jingles](https://kenney.nl/assets/music-jingles) | ADOPT LATER | CC0, 85 files | No owned files changed now | Tiny one-shot event effects No assets/components needed by the confirmed failures; keep current UI and native synths. |
| [Kenney UI Pack](https://kenney.nl/assets/ui-pack) | ADOPT LATER | CC0, 430 files | No owned files changed now | Some UI widgets or placeholder elements No assets/components needed by the confirmed failures; keep current UI and native synths. |
| [Phosphor Icons](https://phosphoricons.com/) | ADOPT LATER | MIT | No owned files changed now | Alternative richer icon family No assets/components needed by the confirmed failures; keep current UI and native synths. |
| [Google Fonts](https://fonts.google.com/) | ADOPT LATER | License varies by family (often OFL) | No owned files changed now | Open-license interface typefaces No assets/components needed by the confirmed failures; keep current UI and native synths. |
| [Official shadcn registry](https://ui.shadcn.com/docs/directory) | REJECT for this MVP | Varies by registry | No owned files changed now | Third-party registry licenses vary; existing vanilla UI is sufficient. |
| [Unsplash](https://unsplash.com/license) | ADOPT LATER | Free custom license; restrictions | No owned files changed now | Selective photography for backgrounds/placeholders No assets/components needed by the confirmed failures; keep current UI and native synths. |
| [Pixabay terms](https://pixabay.com/service/license-summary/) | REJECT for this MVP | Custom content license, not CC0 | No owned files changed now | Custom license and standalone redistribution limits; no MVP need. |
| [Freesound](https://freesound.org/help/faq/) | ADOPT LATER | License per sound | No owned files changed now | Find CC0 or CC-BY individual audio hits No assets/components needed by the confirmed failures; keep current UI and native synths. |
| [Vercel Next.js SaaS Starter](https://vercel.com/templates/next.js/next-js-saas-starter) | REJECT for this MVP | Billing-centric features unnecessary now; audit actual source license | No owned files changed now | Billing-oriented second starter is unnecessary; study Supabase starter only later. |
| [Better Auth](https://www.better-auth.com/) | REJECT for this MVP | MIT; choose exactly one auth architecture | No owned files changed now | Do not mix with the single deferred Supabase Auth approach. |
| [Drizzle ORM](https://orm.drizzle.team/) | ADOPT LATER | Database schema still needs real design | No owned files changed now | Typed database queries and migrations |
| [PostgreSQL](https://www.postgresql.org/) | ADOPT LATER | Hosted free tier has quotas | No owned files changed now | Users, versions, playlists, permissions |
| [Supabase](https://supabase.com/) | ADOPT LATER | Pick either Supabase Auth or Better Auth; don't mix by default | No owned files changed now | Managed Postgres/Auth/Storage possible |
| [Neon](https://neon.com/) | REJECT for this MVP | Choose one DB provider; verify present free limits | No owned files changed now | Do not add a second deferred database provider. |
| [Vercel](https://vercel.com/docs) | ADOPT LATER | Hobby personal non-commercial; preview/production env separation | No owned files changed now | App, APIs, preview environments and deploy logs |
| [Vitest](https://vitest.dev/guide/) | ADOPT LATER | Supplement—not replace—browser audio tests | No owned files changed now | Unit, adapter and catalog tests |
| [Zod](https://zod.dev/) | ADOPT LATER | Validation does not sandbox arbitrary JavaScript | No owned files changed now | Track metadata / input validation |

## Creative references

| Reference | Decision | Use |
|---|---|---|
| Spotify | KEEP as UX research only | No copying code, logos, fonts or artwork. No further redesign. |
| GitHub | KEEP | Source, reviewed changes and explicit listener issue intake. |
| Strudel REPL | KEEP | Official runtime API reference; source link and copyright notice. |
| Ableton Learning Music | ADOPT LATER | Optional beginner learning reference; no assets copied. |
| Sonic Pi | ADOPT LATER | Creative-workflow reference only; no second engine. |
| WaveSurfer examples | ADOPT LATER | Existing private A/B audio controls cover current review needs. |

## Staged zero-cost bootstrap

1. `cd release-audit`; `rtk proxy npm ci --ignore-scripts --no-audit --no-fund`.
   This installs exactly locked Playwright 1.56.1 development tooling. Runtime stays pinned at 1.2.6.
2. Use installed Chrome and Firefox with the audit script; CI may install Playwright's matching
   open-source browsers using `rtk proxy npx playwright install --with-deps chromium firefox`.
3. Build an explicit allowlisted local artifact with `rtk proxy python -X utf8 release-audit/build_preview.py`.
   Test that artifact with `rtk proxy node release-audit/player-checks.mjs`.
4. Run the separate live-baseline checks and compare served hashes. No current production configuration changes.
5. Review the diff, music recognition results and license/naming gates before any merge/deploy approval.

Rollback: stop the preview server and switch away from this branch after saving work.
The baseline commit and separate music branch preserve all scores and earlier audit evidence.
The public site is unchanged by local builds. No destructive reset, cleanup, new backend or
source/recording overwrite is needed. A future release must deploy only the allowlisted artifact,
not this repository root or any private review directory.
