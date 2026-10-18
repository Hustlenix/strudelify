# Known music issues and integration requirements

## Public-site catalog mismatch — 18 October 2026

The diagnostic initially found six Strudelify demo originals and none of the requested eight covers.
The live covers catalog and all eight cover file URLs returned 404. See
`RECOGNIZABILITY_RECOVERY.md` and `live-catalog.json` for reproduction and exact evidence.
The owner rejected the public musical experience. The eight local drafts still need separate
musical repair and listening review; integrating them alone will not establish fidelity.
The owner subsequently authorized Codex integration/deployment. PR #3 connects the catalog,
deep links and named sample banks from an isolated worktree. See catalog-integration.json;
live deployment verification is recorded separately after Pages completes.

## 1. Babydoll

Full source-timed score and 100-second capture now replace the old guessed loop. Check recognition, missing/fragmented notes, guitar timbre and drum classification through the actual review audio. Status remains runtime-verified; no listening approval is recorded. See recovery/01-babydoll-metrics.json.

## 2. Without Me

The unsupported four-root bass loop is now replaced by 269 measured G1/D2 source events.
A full 300-second real-time capture passed with zero clipped or non-finite samples.
The signature riff and upper harmony remain unresolved. Three bounded source-led approaches
did not establish the riff; the detected rap speech was not turned into a synth melody.
This is a partial bass repair, not a completed faithful cover.

## 3. Everyday Normal Guy 2

The old repeated motif/harmony has been replaced by 601 independently corroborated instrumental
note events across 221.256 seconds, plus measured low-note and transient candidates. Rap speech
is omitted from the melodic layer. Runtime passes; full capture and recognition review are pending.

## 4. Sailor Song

A finite source-timed score now replaces the repeated six-subdivision grid and guessed chord loop:
338 vocal-contour and 1116 accompaniment candidates survived independent pitch/spectral checks.
The event times follow the recording directly, avoiding an invented fixed meter. Timbre, missing
notes, vocal slides and transient classification still need listening. Full capture is in progress.

## 5. Can't Tell Me Nothing

F-centered pitch repair and measured headroom are retained. The Fm/Db/Ab/Eb loop, sampled vocal motif and drum placement are unverified. Sparse full-mix note detections were not promoted to a melody.

## 6. Love Me Not

114 BPM and C-centered pitch fit improve measured alignment. Borrowed harmony/relative-mode details and vocal lead remain unverified. The 16.67 s source energy rise is reflected by the continuous envelope; it is not labeled as a confirmed chorus boundary.

## 7. I Thought I Saw Your Face Today

78 BPM is a fixed approximation; source periodicity varies. G-centered transpose is not a complete transcription of the piano, voice or bass. Opening full-mix detections mix registers/instruments and were not substituted as a lead.

## 8. Lonely

F-centered transpose and the eight-subdivision kick repair are retained. The sampled vocal motif, Fm/Db/Bbm/C progression, bass and snare placement need source listening. Source energy/end are followed; the repeating lead is still a draft contour.

## Integration requirements for OpenCode

- Resolve `codeUrl` against `tracks/covers/catalog.json`, then evaluate the complete script with Strudel 1.2.6. Preserve `all(...)` transforms and the Babydoll `Pattern`/`Hap`/`TimeSpan` declarations.
- Preload the actual drum-machine sample map. Bare `bd/sd/hh` availability does not prove `RolandTR909_bd`, `RolandTR808_sd` or `LinnDrum_hh` availability. The harness uses `https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json` and verifies requested resources. Missing-bank regression: `s("bd").bank("audit_missing_bank")` must fail.
- The previous audit's unqualified sound lookup and six-second capture were insufficient: a fully loaded baseline produced samples above 0 dBFS in three tracks. Current composition trims resolve the measured windows. Do not remove them to loudness-match MP3 playback.
- These tracks end after their usable reference durations. Playback needs a fresh scheduler start for a new song; seek semantics and application integration are OpenCode responsibilities and were not tested here.
- Macro-dynamic automation and finite ends do not certify complete verse/chorus transcription. Keep the runtime-verified label visible in any music review workflow; do not call these approved faithful covers.
- Never commit original MP3s, source excerpts, stems or model files. This branch contains no commercial audio assets. Local review audio remains ignored.

The dated public catalog mismatch above is now reproduced by live HTTP/resource inspection.
The other application requirements remain handoff requirements, not claims that application
playback, scheduler behavior or browser-local tracks were tested in this diagnostic.
