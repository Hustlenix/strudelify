# Jon Lajoie — Everyday Normal Guy 2

Status: **MEASURED REFERENCE WORKSHEET / TRANSCRIPTION NOT YET VERIFIED BY LISTENING**.
This document is an engineering handoff, not a certified note-for-note chart. No critical listening or perceptual fidelity assessment was performed. Low-confidence candidates must be auditioned before use.

## Source and usable segment

- Filename: `Everyday Normal Guy 2 - Jon Lajoie _ Wolfie’s Just Fine.mp3`
- Original location: `C:\Users\LalithReddy.b\media\playlists\Everyday Normal Guy 2 - Jon Lajoie _ Wolfie’s Just Fine.mp3`
- SHA256: `3115c9da69333f7543470ee5cfd27f36b377057883a45b9863c0ea2a37e0344d`
- Full decoded length: 3:41.256 (221.256 s).
- Analysis segment: 0–3:41.256; FULL_FILE_EXAMINED. Full source decoded. Video pre/post-roll identity remains unverified without listening.
- Endpoint confidence: HIGH for file end, not semantic song end.
- Excluded tail: 0.0 s. No excluded tail.
- Reference peak (decoded mono): 3.351 dBFS; 11146 samples at or above 0 dBFS. This does not certify the original stereo master against clipping.

Catalog identity cross-check: **PENDING**; no exact catalog artist/title match was found. Filename is not independent identity verification.

## Tempo, meter, and rhythmic feel

- Beat-tracker estimate: **90.666 BPM**; half-time 45.333, double-time 181.332.
- Confidence: MEDIUM for periodicity; beat level and drift require listening. Beat-interval coefficient of variation: 0.02527915594122196.
- Autocorrelation candidates: `[{'bpm': 178.21, 'autocorrelation': 47220.074}, {'bpm': 60.09, 'autocorrelation': 46408.613}, {'bpm': 90.67, 'autocorrelation': 45962.145}, {'bpm': 120.19, 'autocorrelation': 28978.367}, {'bpm': 71.78, 'autocorrelation': 28267.434}]`. These include rhythmic multiples; the largest peak is not automatically the musical beat.
- Meter: **4/4 is an UNVERIFIED working hypothesis**, not a measured time-signature result.
- Swing, backbeat placement, kick/snare identity, accents, and rap/melodic phrasing: **PENDING listening**. Onset timestamps are measured transients from a full mix, not a drum transcription.

## Tonal center and chord chart

Profile fits: `[{'key': 'D minor', 'profile_correlation': 0.4047}, {'key': 'A major', 'profile_correlation': 0.3933}, {'key': 'D major', 'profile_correlation': 0.3338}, {'key': 'A# major', 'profile_correlation': 0.292}]`. Confidence: LOW/MEDIUM: global chroma profile fit on mixed audio, relative modes may be ambiguous.

Common triad candidates: Dm (28 bars), A# (16 bars), A (9 bars), Gm (9 bars), Em (8 bars), D# (3 bars). Counts are not an ordered progression. The table below preserves the first 16 inferred bars; the complete ordered chart is in `timelines/03-everyday-normal-guy-2.json` and `transcriptions/03-everyday-normal-guy-2-observations.json`.

Bar duration uses four beats at the estimated tempo, starting at source zero. **The downbeat has not been established.** Triad-only fitting cannot certify extensions, inversions, borrowed chords, or harmonic rhythm. Low margins mean competing chords fit almost equally well. Do not treat these rows as confirmed changes.

| Start | End | Triad candidate | Alternative | Cosine margin |
|---|---|---|---|---|
| 0:00.000 | 0:02.650 | F#m | F# | 0.016 |
| 0:02.650 | 0:05.290 | Em | C | 0.101 |
| 0:05.290 | 0:07.940 | Em | C | 0.136 |
| 0:07.940 | 0:10.590 | Em | C | 0.144 |
| 0:10.590 | 0:13.240 | Em | C | 0.048 |
| 0:13.240 | 0:15.880 | Dm | F | 0.002 |
| 0:15.880 | 0:18.530 | A# | Gm | 0.061 |
| 0:18.530 | 0:21.180 | A | F#m | 0.014 |
| 0:21.180 | 0:23.820 | A# | Dm | 0.03 |
| 0:23.820 | 0:26.470 | A | Dm | 0.015 |
| 0:26.470 | 0:29.120 | A# | Gm | 0.022 |
| 0:29.120 | 0:31.760 | Dm | D | 0.014 |
| 0:31.760 | 0:34.410 | A# | Gm | 0.002 |
| 0:34.410 | 0:37.060 | Dm | D | 0.044 |
| 0:37.060 | 0:39.710 | A# | Gm | 0.022 |
| 0:39.710 | 0:42.350 | Dm | D | 0.025 |

## Bass and melodic observations

- Low-frequency spectral peak candidates (40–250 Hz): **G#1, A#3, A1, A3, G3, B3**.
- Upper-register spectral peak candidates (250–1500 Hz): **D5, D4, F4, A4, A#4, C#5**.
- Confidence: **LOW**. A prominent spectral peak may be an overtone, accompaniment, or vocal component. Counts measure frames, not note durations.
- Timestamped first-16-second observations are supplied in the transcription JSON. Exact bass rhythms, note lengths, lead phrases, and motif identities remain **PENDING**.
- `transcriptions/03-everyday-normal-guy-2-probe.strudel` sonifies one candidate low-register peak per second. It is a diagnostic probe, not a song motif, bass transcription, or cover.
- Reference clips: [03-everyday-normal-guy-2-intro.wav](../transcriptions/03-everyday-normal-guy-2-intro.wav) (0–10 s), [03-everyday-normal-guy-2-anchor.wav](../transcriptions/03-everyday-normal-guy-2-anchor.wav) (1:50.628–2:00.628).

## Percussion and instrumentation handoff

Measured full-mix onset positions, first 32 seconds: `[12.202, 13.293, 13.665, 14.571, 14.907, 15.232, 15.569, 15.743, 15.906, 16.08, 16.242, 16.567, 16.904, 17.241, 17.566, 17.903, 18.228, 18.402, 18.576, 18.739, 18.901, 19.226, 19.574, 19.911, 20.248, 20.573, 20.91, 21.084, 21.246, 21.409, 21.571, 21.908, 22.094, 22.245, 22.581, 22.756, 22.918, 23.243, 23.58, 23.917, 24.079, 24.242, 24.567, 24.787, 24.903, 25.136, 25.252, 25.588, 25.913, 26.122, 26.239, 26.575, 26.924, 27.109, 27.249, 27.55, 27.783, 27.91, 28.259, 28.456, 28.584, 28.909, 29.257, 29.907, 30.151, 30.488, 30.581, 30.813, 30.929, 31.242, 31.579, 31.904]`.
First align a downbeat by listening; then classify kick/snare/hat events and measure off-grid offsets. Do not quantize these transient detections directly into a drum groove.

Strudel sound-design recommendation (an audition starting point, **not an observed instrument identification**): Audition a dry bass/synth combination and compact kick/snare voices; preserve space for an instrumental substitute for the rap rhythm. Use documented synth voices or explicitly loaded sample maps. Check registry names and actual fetched audio; a pleasant sound is not proof of fidelity.

## Musical timeline and dynamics

The boundaries below are automatic changes in mixed-audio MFCC/chroma texture over adjacent five-second windows. Confidence is LOW for musical section boundaries. Section letters distinguish intervals, not repeated-chorus identities. Intro/verse/chorus/bridge/outro labels remain **PENDING listening**.

| Segment | Start | End | RMS dBFS | Local key candidate | Function |
|---|---|---|---|---|---|
| A | 0:00.000 | 0:04.970 | -28.31 | E minor | Unassigned |
| B | 0:04.970 | 2:58.790 | -11.39 | D minor | Unassigned |
| C | 2:58.790 | 3:25.780 | -12.31 | D minor | Unassigned |
| D | 3:25.780 | 3:41.260 | -16.59 | E minor | Unassigned |

Match rises/falls in density and level at these candidate transitions after listening. RMS differences indicate energy changes, not necessarily performance dynamics or chorus boundaries.

## Five elements to preserve

1. The actual anchor phrase at 1:50.628–2:00.628 (audio supplied; exact melodic transcription PENDING).
2. The bass register and contour: strongest low-frequency peak candidates G#1, A#3, A1, A3, G3, B3; verify fundamentals before using them as notes.
3. The harmonic identity: D minor / A major profile candidates and ordered bar-level triad chart below; no generic chord loop substituted.
4. The source attack pattern: onset timestamps in the first 32 seconds and beat-level ambiguity at 90.67 BPM; preserve syncopation after downbeat alignment.
5. The source density and dynamic changes at the measured textural boundaries; use the per-section levels rather than a constant full-band loop.

## Three highest-impact implementation priorities

1. Validate the main phrase at 1:50.628–2:00.628 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 90.67 BPM, half-time 45.33, and strongest autocorrelation candidate 178.21; confirm D minor against A major, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–3:41.256; verify video pre/post-roll and assign verse/chorus labels by listening.

These are reference-driven priorities, not findings against an arrangement that has not yet been supplied.
