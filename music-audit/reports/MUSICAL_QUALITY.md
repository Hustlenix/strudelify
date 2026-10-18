# Musical quality review

**Review candidates; no song is approved. No human critical listening has been performed. All fidelity scores are null.**

## Recovery update — 18 October 2026

Babydoll now has a full 98.112-second source-timed score: 192 vocal contour events corroborated
by CREPE/YIN, 210 accompaniment note events corroborated by instrumental spectral evidence,
86 low-note candidates and 503 source transient candidates. The former G/D/Em/C loop and
repeating guessed melody have been removed. This is a machine-assisted transcription draft,
not an approved faithful rendition. Possible slide fragmentation, detector omissions, instrument
identification and kit classification still require actual listening. The owner has been given
a real 22-second render to review; no positive recognition response is recorded yet.

A complete 100.0107-second real-time stereo WebAudio capture of its current code passes,
with -18.37 LUFS integrated, -1.5 dBTP and zero clipped/non-finite samples. This replaces the
earlier limited Babydoll capture evidence only. See `recovery/01-babydoll-metrics.json`,
`recovery/01-babydoll-score.json` and `recovery/01-babydoll-changes.json`.
The other seven rows below describe their previous drafts until explicitly updated.

Kept the original eight arrangements and retained their instrumentation/relative motifs unless a bounded change had specific evidence. Six tonal transposes improve measured pitch-class fit, four tempos follow refined source periodicities, the Lonely kick grid is repaired, six mixes have measured headroom trims, and all eight follow source RMS macro-dynamics with finite endings. Babydoll has a 15-event source-derived opening repair over 0–4.37 s.

Pitch-class cosine is an engineering feature comparison, **not a fidelity score**. It ignores note order, musical function and instrument identity. Macro-dynamics are not a complete section arrangement. Most existing lead contours, basslines and harmonic sequences are still unverified; recognizability has not been certified.

| Track | BPM | Status | Main review need |
|---|---:|---|---|
| Babydoll | 84.05 | runtime-verified | Full source-timed transcription candidate and full-duration capture now exist; review the rendered hook for recognition, missed notes, slide fragmentation, guitar timbre and transient classification before approval. |
| Without Me | 112 | runtime-verified | The tonal transpose improves aggregate pitch-class fit, but does not establish the famous riff. The current G/Eb/F/D progression and eighth-note bass are unverified; measured source bass strongly favors G/D. The separated instrumental probe returned no robust f0 sequence, so no replacement riff was guessed. |
| Everyday Normal Guy 2 | 90 | runtime-verified | Mixed-source key estimates conflict and the note probe is sparse. Original A-minor loop retained. Transcribe the recurring instrumental phrase and bass in isolation before changing harmony. Source dynamics/end are implemented; melody, groove and form orchestration are not approved. |
| Sailor Song | 94.85 | runtime-verified | 94.85 BPM is the strongest refined periodicity in the selected window, with 63/126/190 alternatives. Meter/downbeat and the six-subdivision drum grid remain unresolved. B-centered transpose does not certify the B/E/G#m/F# harmonic sequence or guitar voicings. |
| Can't Tell Me Nothing | 80 | runtime-verified | F-centered pitch repair and measured headroom are retained. The Fm/Db/Ab/Eb loop, sampled vocal motif and drum placement are unverified. Sparse full-mix note detections were not promoted to a melody. |
| Love Me Not | 114 | runtime-verified | 114 BPM and C-centered pitch fit improve measured alignment. Borrowed harmony/relative-mode details and vocal lead remain unverified. The 16.67 s source energy rise is reflected by the continuous envelope; it is not labeled as a confirmed chorus boundary. |
| I Thought I Saw Your Face Today | 78 | runtime-verified | 78 BPM is a fixed approximation; source periodicity varies. G-centered transpose is not a complete transcription of the piano, voice or bass. Opening full-mix detections mix registers/instruments and were not substituted as a lead. |
| Lonely | 90 | runtime-verified | F-centered transpose and the eight-subdivision kick repair are retained. The sampled vocal motif, Fm/Db/Bbm/C progression, bass and snare placement need source listening. Source energy/end are followed; the repeating lead is still a draft contour. |

## Evidence and rejected changes

`adjustments.json` records each discrete adjustment, attempt number and before/after hashes. No entire song was rewritten. The low-margin Everyday Normal Guy 2 pitch suggestion was rejected and its notes retained. Full-mix Basic Pitch outputs are kept as candidates, not authoritative charts. MDX/pYIN probes for Babydoll and Without Me were too sparse for complete lead replacement (12 and 0 accepted short notes). Babydoll opening voicings have explicit event provenance; no missing pitches were filled in.

Use `../review.html` for local reference/baseline/candidate comparisons. They show the actual first windows with independent volume controls. Loop phase, voicing and source downbeats are not fully aligned. A same-window feature comparison cannot replace phrase-by-phrase listening.

## Next approval pass

For each track, compare its principal motif and bass against the source anchor in preserved/INTEGRATION_GUIDE.md; resolve the listed meter/harmony questions; transcribe semantic sections and transitions from listening; then capture complete arrangements and measure loudness/true peak. Record source/render intervals and reviewer observations before raising status to listening-reviewed or approved. No additional 350-song catalog work has begun.
