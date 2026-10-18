# Known music issues and integration requirements

## Public-site catalog mismatch — 18 October 2026

The deployed application loads six Strudelify demo originals, not the requested eight covers.
The live covers catalog and all eight cover file URLs returned 404. See
`RECOGNIZABILITY_RECOVERY.md` and `live-catalog.json` for reproduction and exact evidence.
The owner rejected the public musical experience. The eight local drafts still need separate
musical repair and listening review; integrating them alone will not establish fidelity.

## 1. Babydoll

Only the 0–4.37 s opening has a bounded note-event repair. Later lead contour, G/D/Em/C loop and bass remain unverified against the recording; the source contains different harmonic material. Complete the main vocal motif and harmonic rhythm before approval.

## 2. Without Me

The tonal transpose improves aggregate pitch-class fit, but does not establish the famous riff. The current G/Eb/F/D progression and eighth-note bass are unverified; measured source bass strongly favors G/D. The separated instrumental probe returned no robust f0 sequence, so no replacement riff was guessed.

## 3. Everyday Normal Guy 2

Mixed-source key estimates conflict and the note probe is sparse. Original A-minor loop retained. Transcribe the recurring instrumental phrase and bass in isolation before changing harmony. Source dynamics/end are implemented; melody, groove and form orchestration are not approved.

## 4. Sailor Song

94.85 BPM is the strongest refined periodicity in the selected window, with 63/126/190 alternatives. Meter/downbeat and the six-subdivision drum grid remain unresolved. B-centered transpose does not certify the B/E/G#m/F# harmonic sequence or guitar voicings.

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
