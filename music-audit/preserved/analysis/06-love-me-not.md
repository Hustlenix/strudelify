# Ravyn Lenae — Love Me Not

Status: **MEASURED REFERENCE WORKSHEET / TRANSCRIPTION NOT YET VERIFIED BY LISTENING**.
This document is an engineering handoff, not a certified note-for-note chart. No critical listening or perceptual fidelity assessment was performed. Low-confidence candidates must be auditioned before use.

## Source and usable segment

- Filename: `Ravyn Lenae - Love Me Not (Lyrics) - Vibely.mp3`
- Original location: `C:\Users\LalithReddy.b\media\playlists\Ravyn Lenae - Love Me Not (Lyrics) - Vibely.mp3`
- SHA256: `87075555d3cba0e310b0711c83aced762326c81912671fb20ead78d85b32f65d`
- Full decoded length: 29:47.376 (1787.376 s).
- Analysis segment: 0–3:33.067; IDENTIFIED_REPEAT_CYCLE. Named Apple catalog preview matches the local file. Recurring intro and whole-cycle waveform correlation identify one local loop.
- Endpoint confidence: HIGH for repetition boundary; semantic intro/outro labels unverified.
- Excluded tail: 1574.309 s. REPEATED SONG detected; remaining tail not exhaustively identity-certified.
- Reference peak (decoded mono): 3.615 dBFS; 324768 samples at or above 0 dBFS. This does not certify the original stereo master against clipping.

Apple catalog identity cross-check: [Love Me Not](https://music.apple.com/us/album/love-me-not/1743852410?i=1743852427&uo=4); catalog duration 213.467 s. Strongest normalized waveform match: {'source_offset_s': 270.176871, 'absolute_correlation': 0.9839}. Correlation is a signal statistic, not a perceptual similarity score.

Long-record investigation: intro recurrence period 213.067 s; whole-cycle correlation 0.9971. Additional intro/preview matches are in the JSON. This establishes repetition, while unmatched intervening portions remain unidentified.

## Tempo, meter, and rhythmic feel

- Beat-tracker estimate: **114.844 BPM**; half-time 57.422, double-time 229.688.
- Confidence: MEDIUM for periodicity; beat level and drift require listening. Beat-interval coefficient of variation: 0.03313427844594826.
- Autocorrelation candidates: `[{'bpm': 56.79, 'autocorrelation': 18991.164}, {'bpm': 114.84, 'autocorrelation': 17403.258}, {'bpm': 76.0, 'autocorrelation': 16810.6}, {'bpm': 64.6, 'autocorrelation': 12217.438}, {'bpm': 90.67, 'autocorrelation': 12117.026}]`. These include rhythmic multiples; the largest peak is not automatically the musical beat.
- Meter: **4/4 is an UNVERIFIED working hypothesis**, not a measured time-signature result.
- Swing, backbeat placement, kick/snare identity, accents, and rap/melodic phrasing: **PENDING listening**. Onset timestamps are measured transients from a full mix, not a drum transcription.

## Tonal center and chord chart

Profile fits: `[{'key': 'C major', 'profile_correlation': 0.8196}, {'key': 'A minor', 'profile_correlation': 0.7741}, {'key': 'E minor', 'profile_correlation': 0.5415}, {'key': 'F major', 'profile_correlation': 0.4957}]`. Confidence: LOW/MEDIUM: global chroma profile fit on mixed audio, relative modes may be ambiguous.

Common triad candidates: Am (30 bars), C (30 bars), F (10 bars), Dm (8 bars), Fm (7 bars), D (4 bars). Counts are not an ordered progression. The table below preserves the first 16 inferred bars; the complete ordered chart is in `timelines/06-love-me-not.json` and `transcriptions/06-love-me-not-observations.json`.

Bar duration uses four beats at the estimated tempo, starting at source zero. **The downbeat has not been established.** Triad-only fitting cannot certify extensions, inversions, borrowed chords, or harmonic rhythm. Low margins mean competing chords fit almost equally well. Do not treat these rows as confirmed changes.

| Start | End | Triad candidate | Alternative | Cosine margin |
|---|---|---|---|---|
| 0:00.000 | 0:02.090 | F | Am | 0.026 |
| 0:02.090 | 0:04.180 | Em | E | 0.006 |
| 0:04.180 | 0:06.270 | Am | F | 0.034 |
| 0:06.270 | 0:08.360 | Am | E | 0.008 |
| 0:08.360 | 0:10.450 | Am | F | 0.055 |
| 0:10.450 | 0:12.540 | Am | Em | 0.021 |
| 0:12.540 | 0:14.630 | Am | A | 0.063 |
| 0:14.630 | 0:16.720 | Am | A | 0.023 |
| 0:16.720 | 0:18.810 | Fm | F | 0.007 |
| 0:18.810 | 0:20.900 | C | Am | 0.023 |
| 0:20.900 | 0:22.990 | Fm | F | 0.035 |
| 0:22.990 | 0:25.080 | C | Cm | 0.034 |
| 0:25.080 | 0:27.170 | Fm | F | 0.054 |
| 0:27.170 | 0:29.260 | C | Am | 0.016 |
| 0:29.260 | 0:31.350 | Fm | F | 0.016 |
| 0:31.350 | 0:33.440 | Am | C | 0.009 |

## Bass and melodic observations

- Low-frequency spectral peak candidates (40–250 Hz): **F2, C2, C3, A2, G2, E3**.
- Upper-register spectral peak candidates (250–1500 Hz): **D5, C4, C5, E4, F4, E5**.
- Confidence: **LOW**. A prominent spectral peak may be an overtone, accompaniment, or vocal component. Counts measure frames, not note durations.
- Timestamped first-16-second observations are supplied in the transcription JSON. Exact bass rhythms, note lengths, lead phrases, and motif identities remain **PENDING**.
- `transcriptions/06-love-me-not-probe.strudel` sonifies one candidate low-register peak per second. It is a diagnostic probe, not a song motif, bass transcription, or cover.
- Reference clips: [06-love-me-not-intro.wav](../transcriptions/06-love-me-not-intro.wav) (0–10 s), [06-love-me-not-anchor.wav](../transcriptions/06-love-me-not-anchor.wav) (0:57.110–1:07.110).

## Percussion and instrumentation handoff

Measured full-mix onset positions, first 32 seconds: `[0.499, 1.823, 2.345, 2.694, 3.715, 4.319, 4.737, 6.037, 6.56, 8.533, 8.94, 10.252, 10.774, 11.076, 11.447, 12.144, 12.736, 13.154, 14.466, 14.977, 15.279, 15.662, 16.614, 16.834, 16.962, 17.125, 17.345, 17.636, 17.879, 18.042, 18.146, 18.402, 18.657, 18.924, 19.075, 19.203, 19.447, 19.981, 20.306, 20.515, 20.77, 21.037, 21.177, 21.56, 21.838, 22.094, 22.396, 22.872, 23.139, 23.406, 23.661, 24.195, 24.718, 24.985, 25.252, 25.507, 25.658, 25.763, 26.053, 26.308, 26.645, 26.831, 27.086, 27.353, 27.609, 27.876, 28.41, 28.677, 28.909, 29.199, 29.455, 29.722, 29.977, 30.256, 30.29, 30.511, 30.79, 31.022, 31.3, 31.568, 31.811]`.
First align a downbeat by listening; then classify kick/snare/hat events and measure off-grid offsets. Do not quantize these transient detections directly into a drum groove.

Strudel sound-design recommendation (an audition starting point, **not an observed instrument identification**): Audition a rounded electric-bass-like voice, short harmonic stabs, and crisp restrained percussion. Use documented synth voices or explicitly loaded sample maps. Check registry names and actual fetched audio; a pleasant sound is not proof of fidelity.

## Musical timeline and dynamics

The boundaries below are automatic changes in mixed-audio MFCC/chroma texture over adjacent five-second windows. Confidence is LOW for musical section boundaries. Section letters distinguish intervals, not repeated-chorus identities. Intro/verse/chorus/bridge/outro labels remain **PENDING listening**.

| Segment | Start | End | RMS dBFS | Local key candidate | Function |
|---|---|---|---|---|---|
| A | 0:00.000 | 0:16.670 | -30.6 | A minor | Unassigned |
| B | 0:16.670 | 1:16.250 | -8.52 | C major | Unassigned |
| C | 1:16.250 | 1:58.790 | -10.22 | C major | Unassigned |
| D | 1:58.790 | 2:32.040 | -8.05 | C major | Unassigned |
| E | 2:32.040 | 3:05.200 | -16.37 | A minor | Unassigned |
| F | 3:05.200 | 3:22.520 | -7.78 | C major | Unassigned |
| G | 3:22.520 | 3:33.070 | -26.17 | E major | Unassigned |

Match rises/falls in density and level at these candidate transitions after listening. RMS differences indicate energy changes, not necessarily performance dynamics or chorus boundaries.

## Five elements to preserve

1. The actual anchor phrase at 0:57.110–1:07.110 (audio supplied; exact melodic transcription PENDING).
2. The bass register and contour: strongest low-frequency peak candidates F2, C2, C3, A2, G2, E3; verify fundamentals before using them as notes.
3. The harmonic identity: C major / A minor profile candidates and ordered bar-level triad chart below; no generic chord loop substituted.
4. The source attack pattern: onset timestamps in the first 32 seconds and beat-level ambiguity at 114.84 BPM; preserve syncopation after downbeat alignment.
5. The source density and dynamic changes at the measured textural boundaries; use the per-section levels rather than a constant full-band loop.

## Three highest-impact implementation priorities

1. Validate the main phrase at 0:57.110–1:07.110 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 114.84 BPM, half-time 57.42, and strongest autocorrelation candidate 56.79; confirm C major against A minor, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–3:33.067; use one identified local cycle, not the full 30-minute file.

These are reference-driven priorities, not findings against an arrangement that has not yet been supplied.


Diagnostic exception: no usable low-register candidates were detected in the initial 16 seconds. The probe intentionally contains only rests; this does not establish that the source lacks bass.
