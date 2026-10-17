# She & Him — I Thought I Saw Your Face Today

Status: **MEASURED REFERENCE WORKSHEET / TRANSCRIPTION NOT YET VERIFIED BY LISTENING**.
This document is an engineering handoff, not a certified note-for-note chart. No critical listening or perceptual fidelity assessment was performed. Low-confidence candidates must be auditioned before use.

## Source and usable segment

- Filename: `She & Him - I Thought I Saw Your Face Today (Official Lyric Video) - SheandHimOfficial.mp3`
- Original location: `C:\Users\LalithReddy.b\media\playlists\She & Him - I Thought I Saw Your Face Today (Official Lyric Video) - SheandHimOfficial.mp3`
- SHA256: `1861af86641b0f7f0ae353a8fe40cf4e54c433e7c5e60cdda37eca68855af6a4`
- Full decoded length: 2:50.400 (170.4 s).
- Analysis segment: 0–2:50.400; FULL_FILE_EXAMINED. Full source decoded. Video pre/post-roll identity remains unverified without listening.
- Endpoint confidence: HIGH for file end, not semantic song end.
- Excluded tail: 0.0 s. No excluded tail.
- Reference peak (decoded mono): 2.386 dBFS; 1683 samples at or above 0 dBFS. This does not certify the original stereo master against clipping.

Apple catalog identity cross-check: [I Thought I Saw Your Face Today](https://music.apple.com/us/album/i-thought-i-saw-your-face-today/1839131582?i=1839131590&uo=4); catalog duration 170.333 s. Strongest normalized waveform match: {'source_offset_s': 0.023, 'absolute_correlation': 0.9565}. Correlation is a signal statistic, not a perceptual similarity score.

## Tempo, meter, and rhythmic feel

- Beat-tracker estimate: **156.605 BPM**; half-time 78.303, double-time 313.210.
- Confidence: MEDIUM for periodicity; beat level and drift require listening. Beat-interval coefficient of variation: 0.049232794138404666.
- Autocorrelation candidates: `[{'bpm': 79.51, 'autocorrelation': 9257.065}, {'bpm': 156.61, 'autocorrelation': 9061.999}, {'bpm': 105.47, 'autocorrelation': 7123.091}, {'bpm': 63.8, 'autocorrelation': 7059.926}]`. These include rhythmic multiples; the largest peak is not automatically the musical beat.
- Meter: **4/4 is an UNVERIFIED working hypothesis**, not a measured time-signature result.
- Swing, backbeat placement, kick/snare identity, accents, and rap/melodic phrasing: **PENDING listening**. Onset timestamps are measured transients from a full mix, not a drum transcription.

## Tonal center and chord chart

Profile fits: `[{'key': 'G major', 'profile_correlation': 0.76}, {'key': 'D major', 'profile_correlation': 0.6223}, {'key': 'B minor', 'profile_correlation': 0.5237}, {'key': 'E minor', 'profile_correlation': 0.5014}]`. Confidence: LOW/MEDIUM: global chroma profile fit on mixed audio, relative modes may be ambiguous.

Common triad candidates: G (35 bars), Am (21 bars), Em (19 bars), D (12 bars), Bm (5 bars), D# (4 bars). Counts are not an ordered progression. The table below preserves the first 16 inferred bars; the complete ordered chart is in `timelines/07-i-thought-i-saw-your-face-today.json` and `transcriptions/07-i-thought-i-saw-your-face-today-observations.json`.

Bar duration uses four beats at the estimated tempo, starting at source zero. **The downbeat has not been established.** Triad-only fitting cannot certify extensions, inversions, borrowed chords, or harmonic rhythm. Low margins mean competing chords fit almost equally well. Do not treat these rows as confirmed changes.

| Start | End | Triad candidate | Alternative | Cosine margin |
|---|---|---|---|---|
| 0:00.000 | 0:01.530 | F#m | D | 0.045 |
| 0:01.530 | 0:03.070 | Bm | D | 0.035 |
| 0:03.070 | 0:04.600 | D | G | 0.05 |
| 0:04.600 | 0:06.130 | G | Em | 0.063 |
| 0:06.130 | 0:07.660 | Bm | D | 0.003 |
| 0:07.660 | 0:09.200 | G | E | 0.028 |
| 0:09.200 | 0:10.730 | D | Dm | 0.065 |
| 0:10.730 | 0:12.260 | Em | G | 0.158 |
| 0:12.260 | 0:13.790 | Bm | G | 0.017 |
| 0:13.790 | 0:15.330 | Am | F | 0.029 |
| 0:15.330 | 0:16.860 | D | Dm | 0.024 |
| 0:16.860 | 0:18.390 | G | Em | 0.047 |
| 0:18.390 | 0:19.920 | Em | C | 0.105 |
| 0:19.920 | 0:21.460 | Am | A | 0.127 |
| 0:21.460 | 0:22.990 | Am | A | 0.042 |
| 0:22.990 | 0:24.520 | G | Em | 0.108 |

## Bass and melodic observations

- Low-frequency spectral peak candidates (40–250 Hz): **G2, A2, D#2, G#2, D3, E2**.
- Upper-register spectral peak candidates (250–1500 Hz): **A4, B4, D4, E4, G4, B5**.
- Confidence: **LOW**. A prominent spectral peak may be an overtone, accompaniment, or vocal component. Counts measure frames, not note durations.
- Timestamped first-16-second observations are supplied in the transcription JSON. Exact bass rhythms, note lengths, lead phrases, and motif identities remain **PENDING**.
- `transcriptions/07-i-thought-i-saw-your-face-today-probe.strudel` sonifies one candidate low-register peak per second. It is a diagnostic probe, not a song motif, bass transcription, or cover.
- Reference clips: [07-i-thought-i-saw-your-face-today-intro.wav](../transcriptions/07-i-thought-i-saw-your-face-today-intro.wav) (0–10 s), [07-i-thought-i-saw-your-face-today-anchor.wav](../transcriptions/07-i-thought-i-saw-your-face-today-anchor.wav) (0:00.023–0:10.023).

## Percussion and instrumentation handoff

Measured full-mix onset positions, first 32 seconds: `[0.197, 0.848, 0.952, 2.45, 3.297, 4.331, 4.702, 5.143, 6.432, 7.198, 7.605, 7.744, 8.069, 8.417, 8.58, 9.683, 10.333, 11.215, 12.817, 13.607, 13.92, 14.42, 15.186, 15.94, 17.113, 17.578, 18.332, 19.087, 19.818, 21.06, 21.316, 21.502, 23.046, 23.8, 24.555, 25.333, 26.018, 26.889, 27.191, 27.655, 28.41, 29.942, 30.732, 31.533, 31.881]`.
First align a downbeat by listening; then classify kick/snare/hat events and measure off-grid offsets. Do not quantize these transient detections directly into a drum groove.

Strudel sound-design recommendation (an audition starting point, **not an observed instrument identification**): Audition soft piano/plucked harmony and a gentle sustained melody; avoid forcing every layer onto a rigid drum grid. Use documented synth voices or explicitly loaded sample maps. Check registry names and actual fetched audio; a pleasant sound is not proof of fidelity.

## Musical timeline and dynamics

The boundaries below are automatic changes in mixed-audio MFCC/chroma texture over adjacent five-second windows. Confidence is LOW for musical section boundaries. Section letters distinguish intervals, not repeated-chorus identities. Intro/verse/chorus/bridge/outro labels remain **PENDING listening**.

| Segment | Start | End | RMS dBFS | Local key candidate | Function |
|---|---|---|---|---|---|
| A | 0:00.000 | 0:05.340 | -13.48 | B minor | Unassigned |
| B | 0:05.340 | 0:31.860 | -13.83 | G major | Unassigned |
| C | 0:31.860 | 1:02.600 | -11.21 | G major | Unassigned |
| D | 1:02.600 | 2:43.100 | -10.94 | G major | Unassigned |
| E | 2:43.100 | 2:50.400 | -45.54 | G major | Unassigned |

Match rises/falls in density and level at these candidate transitions after listening. RMS differences indicate energy changes, not necessarily performance dynamics or chorus boundaries.

## Five elements to preserve

1. The actual anchor phrase at 0:00.023–0:10.023 (audio supplied; exact melodic transcription PENDING).
2. The bass register and contour: strongest low-frequency peak candidates G2, A2, D#2, G#2, D3, E2; verify fundamentals before using them as notes.
3. The harmonic identity: G major / D major profile candidates and ordered bar-level triad chart below; no generic chord loop substituted.
4. The source attack pattern: onset timestamps in the first 32 seconds and beat-level ambiguity at 156.60 BPM; preserve syncopation after downbeat alignment.
5. The source density and dynamic changes at the measured textural boundaries; use the per-section levels rather than a constant full-band loop.

## Three highest-impact implementation priorities

1. Validate the main phrase at 0:00.023–0:10.023 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 156.60 BPM, half-time 78.30, and strongest autocorrelation candidate 79.51; confirm G major against D major, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–2:50.400; verify video pre/post-roll and assign verse/chorus labels by listening.

These are reference-driven priorities, not findings against an arrangement that has not yet been supplied.
