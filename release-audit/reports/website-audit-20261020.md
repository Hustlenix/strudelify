# Strudelify accessibility, code, and Python performance audit

Date: 20 October 2026  
Reviewed commit: `3e5f16c0fdf0be4500b52ba7a27f8d3c4f9b9acb`  
Website: https://hustlenix.github.io/strudelify/

## Outcome and scope

Nine actionable findings: seven P2 issues and two P3 performance improvements.
The website is deployed, but accessibility readiness has outstanding defects.
This audit is not an accessibility conformance certification or a musical fidelity review.

Reviewed HTML, CSS, browser JavaScript, workspace persistence, and Python release/audio
tools. Used the deployed site through the browser accessibility tree to exercise
Home -> Explore -> Hip hop filtering. That transition reproduced focus loss.
Other accessibility findings are established by source inspection; they were not
tested with a screen reader or a physical phone. No audio was started, original
MP3s modified, source fixes made, or full regression suite run.

The selected RevenueCat error-handling skill was read. No RevenueCat or Android
billing integration exists in this application, so its SDK-specific rules do not apply.

The Code Review connector returned successful Chromium/Firefox checks for PR #13,
head `8fdd98faa252c757022186db648780c005131164`. Those checks cover the earlier
repository reorganization, not the website upgrade reviewed here. The deployed
website revision explicitly skipped its browser regression runs at the owner's request.

## Findings

### 1. [P2] Collapsed navigation loses its accessible names

Location: `web/index.html:17-21`  
Related rules: `web/site.css:55`, `web/site.css:420-423`

The five sidebar buttons derive their names solely from child text spans. Collapsed
navigation and the <=760px rule apply `display:none` to those spans; the icons
are also `aria-hidden`. When the sidebar remains visible, the buttons consequently
have no accessible name. Screen-reader users cannot distinguish Home, Explore,
Artists, Liked tracks, and Recently played.

Give each control a persistent `aria-label`, or hide the text visually while retaining
it in the accessibility tree. Validate both manual collapse and the 541-760px layout.

Evidence: static markup and CSS.

### 2. [P2] Routine page updates discard keyboard focus

Location: `web/site.js:242-246`  
Replacement: `web/site.js:188-195`

Changing genre, sort order, following an artist, or saving a collection changes the
render signature. `refresh()` calls `renderPage()`, which replaces `#siteContent`
with `innerHTML`. The active control is removed and no replacement receives focus.
This interrupts repeated keyboard actions and screen-reader navigation.

Live reproduction: open Explore, then activate Hip hop. The results correctly change
to two patterns, but the browser accessibility state reports focus on the AXWebArea
instead of the Hip hop control. Navigation into Explore had correctly focused its h1.

Update results and state in place, or preserve a stable control identifier and restore
focus after replacement. For removal actions, choose the next logical control.

Evidence: source plus live browser reproduction. Screenshot saved locally at
`release-audit/artifacts/website-audit-20261020/explore-filter.png`.

### 3. [P2] The playback shortcut overrides native select keyboard behavior

Location: `web/app.js:1011-1013`

The global Space handler excludes inputs, textareas, and buttons, but not `select`.
With a catalog or Explore sort select focused, it prevents the native Space action
and calls `togglePlayback()`. Sorting can therefore unexpectedly start or change audio.

Exclude selects and other interactive/editable targets from global shortcuts, and
ignore already-handled events. Keep native keyboard behavior intact.

Evidence: static event-handler path. Audio was not started to reproduce this finding.

### 4. [P2] The skip link remains invisible while focused

Location: `web/styles.css:74-80`  
Control: `web/index.html:4`

The first focus target, Skip to main content, uses the permanently clipped `.sr-only`
style. No focus rule reveals it. Sighted keyboard users cannot discover the bypass
link or see that it has focus.

Give the skip link a dedicated focused style that removes clipping and provides a
visible position above the page chrome.

Evidence: static markup and styles; no screen-reader or keyboard walkthrough of this link.

### 5. [P2] Four dialogs have no programmatically associated name

Location: `web/index.html:78-85`  
Also: `web/index.html:68-70`

Track options, playlist deletion, queue clearing, and playlist creation/editing have
visible headings but their `dialog` elements lack `aria-labelledby` or `aria-label`.
The visible heading alone does not provide the dialog's accessible name, leaving
screen-reader users without the announced context.

Associate each dialog with its heading, including stable IDs on the two confirmation
headings. Keep the already named Studio, backup, and share dialogs consistent.

Evidence: static HTML.

### 6. [P2] Preservation snapshots omit application music after the directory move

Location: `release-audit/baseline.py:22-25`

The snapshot still scans `<repo>/tracks`, while application resources now live under
`<repo>/web/tracks`. A read-only file count found zero files at the old location and
24 at the current location. The separate music checkout can still contribute files,
making a new baseline appear populated while omitting the application's resources.
Later comparisons cannot protect files absent from that baseline.

Resolve the application directory through the shared source mapping, retain logical
`tracks/...` names expected by `verify_preservation.py`, and fail if required catalog
resources are missing. Preserve the separate music checkout's own mapping.

Evidence: source plus filesystem counts; no baseline report was overwritten.

### 7. [P2] Original-only phone encoding consumes the mixed catalog

Location: `release-audit/prepare_phone_audio.py:12-22`

Every catalog row is encoded from `private/originals-v2`, although the catalog now
contains six originals and eight cover studies. Missing cover WAVs cause the job to
fail. If cover WAVs exist, the output report incorrectly labels them Project-original.
Partial output also complicates retries because FFmpeg uses `-n`.

Filter rows to `kind == 'original'`, preflight all required inputs/output conflicts,
and retain accurate provenance. Do not automatically overwrite existing review audio.

Evidence: source and current catalog kinds. No encoding or private audio read was run.

### 8. [P3] Release comparison starts a Git process for each file

Location: `release-audit/build_release.py:22-29`

The current allowlist/build-source set results in 55 serial Git reads for roughly
1 MB of source. A read-only benchmark compared ten identical tracked blobs
(188,448 bytes) using raw Git subprocesses from one Python invocation:

| Round | Ten `git show` processes | One `git cat-file --batch` process |
| --- | ---: | ---: |
| 1 | 1.091 s | 0.132 s |
| 2 | 1.024 s | 0.128 s |
| 3 | 0.982 s | 0.129 s |

Median: 1.024 s versus 0.129 s, approximately 8x faster for the measured Git-read
portion only. This is not a measured full-build speedup. The script optionally wraps
Git with RTK locally; these measurements used raw Git to avoid wrapper-dependent claims.

Read the committed blobs in one batch. Preserve missing-blob handling, byte comparison,
line-ending normalization, and exact candidate/manifest semantics.

Evidence: isolated read-only microbenchmark. No release build was executed.

### 9. [P3] Intro alignment reads and expands a complete WAV unnecessarily

Location: `release-audit/measure_phrasing.py:22-29`

The script decodes the old WAV, converts the complete array to float64, then decodes
the same WAV again merely to inspect its dtype. Alignment only uses its first eight
seconds. The available render is 29,122,604 bytes, so this creates redundant I/O and
full-track allocations before discarding most of the data.

Retain the first read's dtype and slice to the needed interval before float conversion
and mono reduction. Consider memory mapping where the WAV encoding supports it.

Evidence: file metadata and static allocation/read analysis. No audio was decoded or timed.

## Recommended order

1. Fix named navigation, focus retention, and shortcut handling.
2. Fix skip-link visibility and dialog names.
3. Repair preservation-path and original-only encoder assumptions.
4. Batch release Git reads and narrow the audio alignment reads.
5. Exercise keyboard navigation, screen-reader context, responsive layouts, and the
   changed Python paths before claiming the findings resolved.

No fixes were applied during this initial audit. The subsequent implementation and
recheck are recorded in [the fixes report](website-audit-fixes-20261020.md).
