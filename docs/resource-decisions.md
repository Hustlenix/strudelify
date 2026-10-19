# Resource kit adoption

Decision date: 19 October 2026. Baseline: `4b19791fcf8790b0af5ff4342b870b2ba4ec8601`
on `codex/spotify-upgrade`. This is an incremental update to the HTML/CSS/JavaScript
application, not a template migration. The supplied kit contained three Markdown
references, not installed packages or cleared audio files.

## Release 00/01 decision

Adopt **21 static Lucide icons** and the asset-register fields now. Retain the existing
Strudel engine, native dialogs, six original scores, local playlist model and Pages
release pipeline. This adds no production JavaScript dependency, framework, paid
service, authentication, UI sound, font request or telemetry.

The Lucide package is pinned at `lucide-static@1.59.0`. Its official npm metadata and
the actual package LICENSE were inspected on the decision date. The full notice
includes both ISC and the MIT notice for Feather-derived icons. Both are retained.
See [the asset ledger](../THIRD_PARTY_ASSETS.md), the committed receipt and rebuild
script. Integrity verification authenticates consistency with the pinned receipt;
it is not a claim that package provenance signatures were independently verified.

## Complete candidate matrix

**License labels:** `verified` means a primary source or the exact adopted artifact
was inspected for this update. `baseline` means the existing repository's earlier
license evidence is retained. `kit` means the guide's claim, **not clearance to
download or ship**. Deferred items need exact version, source and license review
before adoption. Ownership indicates the proposed application area, not permission
to change other active worktrees.

| Resource | Decision | License / evidence state | Integration value and ownership |
|---|---|---|---|
| Existing Strudelify | KEEP | MIT project portions / combined AGPL; baseline | Existing app, local playlists, original scores; `app.js`, `library.js`, `tracks/` |
| Official Strudel integration | KEEP | AGPL-3.0-or-later; baseline pinned 1.2.6 | Current playback API and source access; runtime adapter in `app.js` |
| Strudel sample docs | KEEP as reference | Docs and each sample have separate terms; kit | Instrument resolution reference; no bank installation or music change |
| Strudel FAQ | KEEP as reference | Guidance; baseline | Attribution/naming decisions in `LICENSING.md`; no upstream endorsement |
| Official shadcn/ui | ADOPT LATER | MIT; official license verified | Useful if a React studio is justified; current native HTML dialogs stay |
| Lucide | ADOPT NOW | Exact package ISC + Feather MIT; verified | One coherent family for navigation, transport, queue and collections; `assets/icons/`, HTML and icon helper |
| Next.js Supabase Starter | ADOPT LATER; selected backend reference | Next.js example MIT; verified primary source | Cookie auth/client-server separation; future backend, not a scaffold replacement |
| Vercel Git integration | ADOPT LATER | Hosted platform terms, not an asset license; kit | Preview/production separation if moving beyond static hosting; future CI |
| Playwright | KEEP | Apache-2.0; baseline 1.62.1 lockfile | Existing development-only browser/audio checks in `release-audit/` |
| GitHub Actions | KEEP | Hosted service and per-action licenses; baseline | Existing PR and explicit Pages release workflows; `.github/workflows/` |
| Tonal.js | ADOPT LATER | MIT; kit | Chord/scale/transpose helpers for a future studio; not transcription; future studio utilities |
| music-metadata | ADOPT LATER | MIT; kit | Metadata for local file analysis; future private audit tooling, never uploads masters |
| WaveSurfer.js | ADOPT LATER | BSD-3-Clause; kit | Reference/rendered-audio annotations; future private audit UI, not a fabricated synth playhead |
| Meyda | ADOPT LATER | MIT; kit | Spectral diagnostics if a defined check needs them; music audit only |
| librosa | ADOPT LATER; preserve any prior offline work | ISC; kit, local installed version not revalidated | Tempo/chroma evidence; private music audit; no browser bundle |
| Audacity | ADOPT LATER | GPL-family; exact build not reviewed | Manual listening/annotations when needed; external offline workflow |
| Tone.js | REJECT for current release | MIT code; demo sample rights separate; kit | A second scheduler adds no present capability; preserve one Strudel engine |
| CodeMirror | ADOPT LATER | MIT packages; kit | Custom editor only after official Strudel REPL fit is evaluated; future studio |
| Yjs | ADOPT LATER | MIT; kit | Collaboration after versioning and single-user persistence; no current app files |
| MusicBrainz API | ADOPT LATER | Metadata/data terms and API usage rules; kit | Identifiers/metadata only; future metadata service, rate-limit/cache required |
| Cover Art Archive | REJECT as public artwork feed | Per-work copyright; no blanket clearance; kit | May be reference-only later; current original artwork retained |
| Kenney Interface Sounds | ADOPT LATER | CC0 claimed by guide; pack not downloaded | Optional opt-in feedback after sound UX is defined; future audio assets |
| Kenney UI Audio | ADOPT LATER | CC0 claimed by guide; pack not downloaded | Alternative to Interface Sounds, not both by default; future audio assets |
| Kenney Music Jingles | REJECT for listening core | CC0 claimed by guide; pack not downloaded | Jingles would interrupt listening; not song replacements |
| Kenney UI Pack | REJECT for current interface | CC0 claimed by guide; pack not downloaded | Existing music visual system needs no game widget pack |
| Phosphor Icons | REJECT in this implementation | MIT; kit | Alternative family; Lucide selected to avoid mixing sets |
| Google Fonts | ADOPT LATER | Per-family license, often OFL; kit | Only for a deliberate type change; system stack currently needs no download |
| Official shadcn registry | ADOPT LATER | Per-registry/source terms; kit | Optional component discovery after framework decision; no installer executed |
| Unsplash | REJECT as album-art source | Custom license, per-photo rights; kit | Current original artwork already fits; no photography downloaded |
| Pixabay | REJECT as catalog/sample feed | Custom content license; kit | No need to add redistribution ambiguity to original instrumentals |
| Freesound | ADOPT LATER | CC0/CC-BY/other per sound; kit | Only individually cleared hits for an actual musical need; future music assets |
| Next.js SaaS Starter | REJECT as competing starter | Exact source/license not evaluated | Supabase starter is the single selected reference; billing stack unnecessary |
| Better Auth | REJECT for selected backend direction | MIT; kit | Do not combine another auth system with proposed Supabase Auth |
| Drizzle ORM | ADOPT LATER only if required | Exact source/version/license not reviewed | Reassess after schema/access design; not needed for present local collections |
| PostgreSQL | ADOPT LATER | PostgreSQL License; kit | Future users/playlists/versions/permissions; requires schema and access design |
| Supabase | ADOPT LATER; preferred service direction | Component licenses + hosted terms; kit | One auth/database direction; no project, keys or storage provisioned |
| Neon | REJECT as parallel provider | Hosted terms/component licenses; not reviewed | Keep one proposed database provider instead of duplicating infrastructure |
| Vercel platform | ADOPT LATER | Hosted plan/usage terms; not revalidated | Keep current Pages hosting; assess terms when a server-backed feature is planned |
| Vitest | ADOPT LATER | MIT; kit | Unit tests when module coverage is requested; existing toolchain retained |
| Zod | ADOPT LATER | MIT; kit | Shared schema at future import/API boundary; does not isolate executable patterns |
| Spotify player reference | KEEP as behavioral reference | Proprietary interface/content; not licensed for redistribution | Listening flow observations only; no proprietary code/assets imported |
| GitHub UX reference | KEEP as behavioral reference | Website content/product terms; kit | Future version/fork/review workflows; not copied frontend code |
| Strudel REPL reference | KEEP as preferred editor direction | AGPL obligations apply to copied code; baseline | Evaluate official editor before introducing CodeMirror |
| Ableton Learning Music | KEEP as reference | Site content rights not reviewed | Beginner onboarding concepts only; no copied lesson/media |
| Sonic Pi | KEEP as reference | Project/component licenses require review | Creative workflow ideas only; no copied source or audio |
| WaveSurfer examples | KEEP as reference | Example/package rights require review | Region/annotation behavior for future private analysis UI |

## One backend reference evaluated

The [official Vercel Supabase template](https://vercel.com/templates/authentication/supabase)
points to Next.js's `examples/with-supabase`. Its
[README](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)
describes cookie-based auth across client/server components; the repository's
[MIT license](https://github.com/vercel/next.js/blob/canary/license.md) was inspected.
No starter code was copied, no generated scaffold was run, and no auth provider was
connected. The competing SaaS starter was not evaluated. If cloud sync is requested,
first isolate pattern execution from authenticated pages, then design row ownership,
playlist entry order, migration/export and recovery. The current custom-code editor
must not become a trusted authenticated publishing boundary by accident.

## Exact zero-additional-service bootstrap

Run these from the isolated upgrade checkout. Normal asset builds do not install npm
packages or execute package scripts:

```powershell
rtk proxy python release-audit/vendor_icons.py
rtk proxy node --check app.js
rtk proxy node --check library.js
rtk proxy python release-audit/build_preview.py --output release-preview/resources
rtk proxy python -m http.server 4193 --bind 127.0.0.1 --directory release-preview
```

The build output path must be fresh. Preview `/resources/#library` through the existing
local server if port 4193 is already in use. No new hosting account, cloud database or
paid resource is required. Existing provider quotas still apply.

If the existing development dependencies need restoring later, the exact existing
`release-audit/package-lock.json` is the source of truth:

```powershell
rtk proxy npm ci --prefix release-audit --ignore-scripts --no-audit --no-fund
```

This command is documented, not run for resource adoption. No `latest` installer or
unreviewed registry command is used. Backend/editor package versions are intentionally
not selected or installed before a feature requires them.

## Review and rollback

- Current scope: icons, provenance, release packaging and these decisions. No Strudel
  API, scheduler, instrument, sample bank, composition or local storage key changes.
- Release builder checks the exact allowlist, hashes and source archive. Syntax and
  source consistency checks are separate from browser/audio results.
- No test suite is added or run for this change. Planned browser review: inspect each
  control icon at desktop/mobile sizes, keyboard labels/focus, and HTTP delivery of the
  sprite. Actual play/stop/sample-load browser checks are required before a future
  Strudel runtime change; none is made here.
- Preserve the earlier application and music branches. Revert the single resource
  adoption commit with `rtk proxy git revert <resource-commit>` if needed; do not reset
  working trees or delete saved data. No storage migration is introduced.
- Public release and cloud provisioning are separate actions. This PR does not deploy.

## Primary evidence

- [Lucide licensing](https://lucide.dev/license), exact package URL and SHA-512 in
  `assets/icons/lucide-provenance.json`; actual package license retained verbatim.
- [Official shadcn license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md),
  inspected for the deferred framework decision; no component source copied.
- Supabase starter source and MIT license linked above, inspected as a reference.
- Supplied guide license claims for all deferred assets remain unverified adoption
  candidates. They are not represented as shipped dependencies or cleared sounds.
