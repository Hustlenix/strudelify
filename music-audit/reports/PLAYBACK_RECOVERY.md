# Playback and lyrics recovery

Local regression status: PASSED. 17 checks, 0 errors.

The actual Strudel runtime, source/catalog requests and WebAudio are exercised under normal autoplay policy. Each cover produces audio and Stop leaves the native hardware context suspended with zero recorded output.

Confirmed fixes: canceled loads cannot restart; newest selection owns playback; editor preview stops on close/save/Escape; existing voices/effects are disconnected; pending instrument work is cancellable and bounded; other cooperating app tabs release playback; saved copies cannot shadow covers; Back/Forward and concurrent View code fetches retain the correct song.

The right-side lyrics panel has 596 measured phrase cues from supplied recordings. Transcripts are automatic drafts with uncertain segments omitted. View code stays complete; mobile lyrics open and close.

Probe correction: OfflineAudioContext impulse generation is excluded from hardware measurement. Earlier false readings are preserved in recovery/offline-context-probe-diagnostic.json.

Local resource SHA-256 values:

- app.js: 561784e4469f307b67551f07c1a212fbbd02abb28dd3b5684c4328a0263c0b2f
- index.html: 45673609430f3b3eeb7554cc8cbaa50b830781c441049355f151c20ae8c2537c
- styles.css: 40ad83ea6a88d0c7ff27fdd6013ea520ec1aa6d053bc8aa730f9b58d0c201355

## Public deployment verification

PR #4 was merged to main at `0b6e42ce2fc1f236df8f673470724a564a1d1c5f`.
GitHub Pages run `39116032718` completed successfully. The public site is
https://hustlenix.github.io/strudelify/.

The same 17 checks passed against the public site under normal browser autoplay policy,
with zero recorded errors. All eight songs produced nonzero real AudioContext output before
Stop; each Stop suspended that context and recorded zero output. The report is
`playback-regressions-live.json`.

All 28 public resources match the tested isolated application checkout after CRLF-to-LF
normalization: HTML, JavaScript, CSS, catalog, eight scores, eight lyric files and eight SVGs.
See `deployed-recovery.json`. This resource comparison ties the tested files to the public
deployment independently of the workflow's success status.

Already-open tabs with the old application must reload once to load the transport fixes
and participate in cross-tab playback ownership. Musical fidelity still needs listening;
the unresolved hooks in Without Me and Can't Tell Me Nothing are documented in KNOWN_ISSUES.md.
