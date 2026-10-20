# Strudelify upgrade: Studio, library and musical identity

20 October 2026. Public branding remains Hustlenix Music.

## Direction

Make discovering a pattern, changing it, and keeping the result one coherent product.
Familiar music-player navigation is already present. The next useful distinction is a
music library whose tracks can become editable instruments and arrangements.

This is an incremental upgrade of the existing static application. The 14-track catalog,
playlists, queue, View code, score provenance and audio cancellation guards are retained.
The eight cover studies still need musical review. A better editor is not evidence that
a transcription sounds faithful.

## Implemented in this release

| Area | Delivered behavior |
| --- | --- |
| Studio | Create a pattern; remix a public track into a local copy; edit an existing local pattern without duplicating its ID. |
| Draft recovery | Autosave after input, flush on close/switch, resume from Library, browse all drafts in Studio. Storage failures show a download instruction and retain the draft in memory while the tab stays open. |
| Versions | Keep the last 20 changed saves per local track. Opening history changes the draft; Save explicitly commits it. Repeated unchanged saves do not consume history. |
| Code workflow | Line/character count, indentation, Ctrl/Command+Enter preview, Ctrl/Command+S save, Stop preview, individual `.strudel` download. |
| Library portability | Versioned JSON backup of local tracks, likes, playlists, drafts and histories. Merge preview, strict schema/size limits, conflict copies and deduplication on repeat imports. Import does not execute patterns. |
| Discovery | Cover/original/custom filters plus catalog/title/tempo/duration ordering, combined with search and collection filters. Unknown tempo/duration sorts last. |
| Playback | Audio-clock elapsed time, finite-duration progress, LIVE indication for open-ended scores. No simulated seek behavior. |
| Packaging | The new workspace module is part of the allowlisted static artifact and its source archive. Existing licensing and music-review statuses remain. |

## Data and compatibility

`workspace.js` owns the versioned local workspace. The first successful write migrates
the existing liked/custom/recent/playlist/shuffle/repeat values into one envelope. Original
legacy keys remain untouched for recovery. A track save commits its pattern, version
history and draft cleanup in one localStorage write. Failed writes leave the previous
envelope intact.

Backup format is `strudelify-library`, version 1. Imports accept whitelisted fields,
bound track source size and counts, reject duplicate/unsafe identifiers and reserve
catalog IDs. A merge is recomputed immediately before committing. The receiving device
keeps its recents and playback settings; the session queue is not exported.

Capacity: 300 local patterns, 300 playlists, 2,000 entries per playlist, 100 unfinished
drafts, 20 versions per track, 5 MB import file. Actual browser quota can be lower than
the sum of those limits. Export is the recovery path, not a promise of unlimited storage.
Existing local versions have priority if imported history exceeds 20; the merge preview
reports skipped versions. Original backup files are not modified.

No cloud account, synchronization server, audio rendering service, waveform seeking or
new sample source is introduced. Editing the same pattern in several tabs is not a
collaborative workflow; use one Studio tab for edits. Strudel source is executable code,
so this is not a sandbox for untrusted scripts.

## Evidence recorded during implementation

- Started from clean `origin/main` at `5e568787885131adffac38a1a701b590394895c2`.
- Existing public baseline was `b78d05be88e88aa8b9425edd98f5d073bd34dece` with 14 tracks.
- JavaScript syntax checks and static HTML ID/reference checks completed during development.
- Built an allowlisted local preview including `workspace.js` and the application source archive.
- In the in-app browser, created and saved a local pattern, saved a changed revision,
  opened the older revision as a draft, changed pages and observed the resumable draft.
  Opened Babydoll's full current score through Remix in Studio and observed its local-copy
  credit and draft list. Downloaded the versioned JSON backup through its visible control.
  These are observed UI flows, not a new musical-listening result.
- File-import behavior has been reviewed in code; a browser file upload was not performed
  during development. No fresh physical-phone result is claimed.
- Existing automatic CI/release results belong to their exact commits. See this release's
  GitHub check runs for fresh player/packaging results; older results are not new Studio coverage.

## Next milestones, in order

### 1. Make the eight songs recognizable

Work one song at a time against the supplied read-only recording. Choose the principal
hook, transcribe rhythm/pitch/rests with traceable timestamps, then correct voicing,
instrument articulation and bass movement. Render the complete score, measure clipping
and levels, and compare matched passages with the reference. Preserve the better version
at every step. A track advances from runtime-verified to listening-reviewed only after
actual listening evidence; recognition and rights decisions remain separate.

Finish when each track has a complete arrangement, a reproducible render and a specific
listening verdict with remaining defects. Do not add 100 generic patterns to hide this work.

### 2. Make creations portable beyond this browser

Add an explicit export/render workflow with cancellation, duration limits and format
selection. Provide shareable code packages carrying source attribution and licenses.
Define which sources and compositions may be publicly shared before introducing uploads.
Keep local JSON backups usable through future schema migrations.

Finish when an exported finite arrangement can be opened elsewhere, produces the expected
duration and carries its provenance without requiring the original browser's storage.

### 3. Split the player into clear modules

Extract transport/engine lifecycle, catalog access, routing and Studio UI from `app.js`
behind existing behavior. Preserve serialized evaluation and revision cancellation. Add
user-requested dedicated checks for draft recovery, import conflicts/quota failure and
transport/preview interaction before growing the feature surface further.

Finish when modules have clear ownership and the same public player flows remain reliable
in Chromium and Firefox, including rapid switching and preview interruption.

### 4. Expand a curated catalog

After the musical baseline is accepted, add small batches with complete metadata,
source/provenance, finite structures, a consistent level target and a listening decision.
Support stronger genre/mood discovery using real metadata. Add accounts or cloud sync only
with a concrete data model, privacy controls and operating budget.

Finish each batch before starting the next. Count accepted arrangements, not placeholders.
