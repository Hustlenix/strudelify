# Eminem — Without Me

Status: **MEASURED REFERENCE WORKSHEET / TRANSCRIPTION NOT YET VERIFIED BY LISTENING**.
This document is an engineering handoff, not a certified note-for-note chart. No critical listening or perceptual fidelity assessment was performed. Low-confidence candidates must be auditioned before use.

## Source and usable segment

- Filename: `Eminem - Without Me (Official Music Video) - EminemVEVO.mp3`
- Original location: `C:\Users\LalithReddy.b\media\playlists\Eminem - Without Me (Official Music Video) - EminemVEVO.mp3`
- SHA256: `049b1f8d488ef6577a647e40159b6eda8e38855aef39031cbe57ff703630c06c`
- Full decoded length: 4:57.624 (297.624 s).
- Analysis segment: 0–4:57.624; FULL_FILE_EXAMINED. Full source decoded. Video pre/post-roll identity remains unverified without listening.
- Endpoint confidence: HIGH for file end, not semantic song end.
- Excluded tail: 0.0 s. No excluded tail.
- Reference peak (decoded mono): 2.416 dBFS; 10533 samples at or above 0 dBFS. This does not certify the original stereo master against clipping.

Apple catalog identity cross-check: [Without Me](https://music.apple.com/us/album/without-me/1440821542?i=1440821643&uo=4); catalog duration 290.120 s. Strongest normalized waveform match: {'source_offset_s': 54.499, 'absolute_correlation': 0.967}. Correlation is a signal statistic, not a perceptual similarity score.

## Tempo, meter, and rhythmic feel

- Beat-tracker estimate: **112.347 BPM**; half-time 56.174, double-time 224.694.
- Confidence: MEDIUM for periodicity; beat level and drift require listening. Beat-interval coefficient of variation: 0.027558216000532477.
- Autocorrelation candidates: `[{'bpm': 112.35, 'autocorrelation': 69768.773}, {'bpm': 56.17, 'autocorrelation': 68451.234}, {'bpm': 74.9, 'autocorrelation': 48694.477}, {'bpm': 84.72, 'autocorrelation': 29589.984}, {'bpm': 166.71, 'autocorrelation': 28760.307}]`. These include rhythmic multiples; the largest peak is not automatically the musical beat.
- Meter: **4/4 is an UNVERIFIED working hypothesis**, not a measured time-signature result.
- Swing, backbeat placement, kick/snare identity, accents, and rap/melodic phrasing: **PENDING listening**. Onset timestamps are measured transients from a full mix, not a drum transcription.

## Tonal center and chord chart

Profile fits: `[{'key': 'G minor', 'profile_correlation': 0.6432}, {'key': 'G major', 'profile_correlation': 0.6169}, {'key': 'D major', 'profile_correlation': 0.2931}, {'key': 'E minor', 'profile_correlation': 0.2728}]`. Confidence: LOW/MEDIUM: global chroma profile fit on mixed audio, relative modes may be ambiguous.

Common triad candidates: Gm (60 bars), G (34 bars), C (14 bars), Cm (13 bars), D# (7 bars), Em (6 bars). Counts are not an ordered progression. The table below preserves the first 16 inferred bars; the complete ordered chart is in `timelines/02-without-me.json` and `transcriptions/02-without-me-observations.json`.

Bar duration uses four beats at the estimated tempo, starting at source zero. **The downbeat has not been established.** Triad-only fitting cannot certify extensions, inversions, borrowed chords, or harmonic rhythm. Low margins mean competing chords fit almost equally well. Do not treat these rows as confirmed changes.

| Start | End | Triad candidate | Alternative | Cosine margin |
|---|---|---|---|---|
| 0:00.000 | 0:02.140 | C | Cm | 0.023 |
| 0:02.140 | 0:04.270 | C | Cm | 0.016 |
| 0:04.270 | 0:06.410 | C# | C#m | 0.001 |
| 0:06.410 | 0:08.540 | Gm | Cm | 0.023 |
| 0:08.540 | 0:10.680 | G | Gm | 0.005 |
| 0:10.680 | 0:12.820 | G#m | E | 0.005 |
| 0:12.820 | 0:14.950 | D | Dm | 0.004 |
| 0:14.950 | 0:17.090 | Gm | D# | 0.002 |
| 0:17.090 | 0:19.230 | G | Cm | 0.008 |
| 0:19.230 | 0:21.360 | Gm | D# | 0.011 |
| 0:21.360 | 0:23.500 | Gm | G | 0.01 |
| 0:23.500 | 0:25.630 | D# | Gm | 0.008 |
| 0:25.630 | 0:27.770 | Cm | G | 0.0 |
| 0:27.770 | 0:29.910 | Gm | D# | 0.009 |
| 0:29.910 | 0:32.040 | Gm | G | 0.012 |
| 0:32.040 | 0:34.180 | Gm | D# | 0.002 |

## Bass and melodic observations

- Low-frequency spectral peak candidates (40–250 Hz): **G2, G1, D2, F#2, F#1, D#2**.
- Upper-register spectral peak candidates (250–1500 Hz): **D4, F4, G4, D5, C#5, D#5**.
- Confidence: **LOW**. A prominent spectral peak may be an overtone, accompaniment, or vocal component. Counts measure frames, not note durations.
- Timestamped first-16-second observations are supplied in the transcription JSON. Exact bass rhythms, note lengths, lead phrases, and motif identities remain **PENDING**.
- `transcriptions/02-without-me-probe.strudel` sonifies one candidate low-register peak per second. It is a diagnostic probe, not a song motif, bass transcription, or cover.
- Reference clips: [02-without-me-intro.wav](../transcriptions/02-without-me-intro.wav) (0–10 s), [02-without-me-anchor.wav](../transcriptions/02-without-me-anchor.wav) (0:54.499–1:04.499).

## Percussion and instrumentation handoff

Measured full-mix onset positions, first 32 seconds: `[0.685, 0.952, 1.393, 1.823, 2.136, 2.252, 2.694, 3.111, 3.553, 3.982, 4.876, 5.724, 6.293, 6.664, 7.001, 7.837, 8.057, 8.777, 8.847, 14.327, 14.605, 14.849, 15.139, 15.383, 15.685, 15.917, 16.219, 16.463, 16.985, 17.519, 18.054, 18.599, 19.133, 19.412, 19.609, 19.679, 19.958, 20.213, 20.48, 20.735, 20.91, 21.026, 21.165, 21.281, 21.745, 21.827, 22.105, 22.338, 22.616, 22.872, 23.15, 23.406, 23.708, 23.94, 24.474, 24.764, 25.008, 25.507, 25.832, 26.076, 26.587, 26.912, 27.144, 27.678, 27.968, 28.212, 28.502, 28.758, 29.037, 29.28, 29.466, 29.571, 29.826, 30.105, 30.348, 31.184, 31.417, 31.707, 31.962]`.
First align a downbeat by listening; then classify kick/snare/hat events and measure off-grid offsets. Do not quantize these transient detections directly into a drum groove.

Strudel sound-design recommendation (an audition starting point, **not an observed instrument identification**): Audition a narrow pulse or filtered saw for the main pitched motif, a short bass, and dry drum samples. Use documented synth voices or explicitly loaded sample maps. Check registry names and actual fetched audio; a pleasant sound is not proof of fidelity.

## Musical timeline and dynamics

The boundaries below are automatic changes in mixed-audio MFCC/chroma texture over adjacent five-second windows. Confidence is LOW for musical section boundaries. Section letters distinguish intervals, not repeated-chorus identities. Intro/verse/chorus/bridge/outro labels remain **PENDING listening**.

| Segment | Start | End | RMS dBFS | Local key candidate | Function |
|---|---|---|---|---|---|
| A | 0:00.000 | 0:13.510 | -17.47 | G# major | Unassigned |
| B | 0:13.510 | 0:28.420 | -10.47 | G minor | Unassigned |
| C | 0:28.420 | 0:57.910 | -10.19 | G minor | Unassigned |
| D | 0:57.910 | 1:40.820 | -10.1 | G major | Unassigned |
| E | 1:40.820 | 2:40.680 | -10.05 | G major | Unassigned |
| F | 2:40.680 | 3:12.730 | -9.98 | G minor | Unassigned |
| G | 3:12.730 | 3:49.090 | -10.11 | G minor | Unassigned |
| H | 3:49.090 | 4:02.180 | -10.01 | G minor | Unassigned |
| I | 4:02.180 | 4:21.410 | -10.17 | G minor | Unassigned |
| J | 4:21.410 | 4:52.620 | -10.76 | G minor | Unassigned |
| K | 4:52.620 | 4:57.620 | -26.29 | G minor | Unassigned |

Match rises/falls in density and level at these candidate transitions after listening. RMS differences indicate energy changes, not necessarily performance dynamics or chorus boundaries.

## Five elements to preserve

1. The actual anchor phrase at 0:54.499–1:04.499 (audio supplied; exact melodic transcription PENDING).
2. The bass register and contour: strongest low-frequency peak candidates G2, G1, D2, F#2, F#1, D#2; verify fundamentals before using them as notes.
3. The harmonic identity: G minor / G major profile candidates and ordered bar-level triad chart below; no generic chord loop substituted.
4. The source attack pattern: onset timestamps in the first 32 seconds and beat-level ambiguity at 112.35 BPM; preserve syncopation after downbeat alignment.
5. The source density and dynamic changes at the measured textural boundaries; use the per-section levels rather than a constant full-band loop.

## Three highest-impact implementation priorities

1. Validate the main phrase at 0:54.499–1:04.499 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 112.35 BPM, half-time 56.17, and strongest autocorrelation candidate 112.35; confirm G minor against G major, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–4:57.624; verify video pre/post-roll and assign verse/chorus labels by listening.

These are reference-driven priorities, not findings against an arrangement that has not yet been supplied.
