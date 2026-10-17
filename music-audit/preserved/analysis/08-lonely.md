# Akon — Lonely

Status: **MEASURED REFERENCE WORKSHEET / TRANSCRIPTION NOT YET VERIFIED BY LISTENING**.
This document is an engineering handoff, not a certified note-for-note chart. No critical listening or perceptual fidelity assessment was performed. Low-confidence candidates must be auditioned before use.

## Source and usable segment

- Filename: `Akon - Lonely (Official Music Video) - AkonVEVO.mp3`
- Original location: `C:\Users\LalithReddy.b\media\playlists\Akon - Lonely (Official Music Video) - AkonVEVO.mp3`
- SHA256: `6f84d36dfa0130620d3846ab72d87a80f16dbfcbd22a3b172f81539ab0743fd0`
- Full decoded length: 4:23.064 (263.064 s).
- Analysis segment: 0–4:23.064; FULL_FILE_EXAMINED. Full source decoded. Video pre/post-roll identity remains unverified without listening.
- Endpoint confidence: HIGH for file end, not semantic song end.
- Excluded tail: 0.0 s. No excluded tail.
- Reference peak (decoded mono): 1.286 dBFS; 12 samples at or above 0 dBFS. This does not certify the original stereo master against clipping.

Apple catalog identity cross-check: [Lonely](https://music.apple.com/us/album/lonely/1446019188?i=1446019275&uo=4); catalog duration 235.067 s. Strongest normalized waveform match: {'source_offset_s': 68.782, 'absolute_correlation': 0.4094}. Correlation is a signal statistic, not a perceptual similarity score.

## Tempo, meter, and rhythmic feel

- Beat-tracker estimate: **90.666 BPM**; half-time 45.333, double-time 181.332.
- Confidence: MEDIUM for periodicity; beat level and drift require listening. Beat-interval coefficient of variation: 0.02744106361728319.
- Autocorrelation candidates: `[{'bpm': 90.67, 'autocorrelation': 24636.322}, {'bpm': 184.57, 'autocorrelation': 18760.096}, {'bpm': 60.09, 'autocorrelation': 18705.303}, {'bpm': 120.19, 'autocorrelation': 17315.422}, {'bpm': 72.79, 'autocorrelation': 17204.178}]`. These include rhythmic multiples; the largest peak is not automatically the musical beat.
- Meter: **4/4 is an UNVERIFIED working hypothesis**, not a measured time-signature result.
- Swing, backbeat placement, kick/snare identity, accents, and rap/melodic phrasing: **PENDING listening**. Onset timestamps are measured transients from a full mix, not a drum transcription.

## Tonal center and chord chart

Profile fits: `[{'key': 'F minor', 'profile_correlation': 0.8497}, {'key': 'G# major', 'profile_correlation': 0.8194}, {'key': 'C# major', 'profile_correlation': 0.7069}, {'key': 'C minor', 'profile_correlation': 0.4684}]`. Confidence: LOW/MEDIUM: global chroma profile fit on mixed audio, relative modes may be ambiguous.

Common triad candidates: Fm (34 bars), G# (25 bars), C# (14 bars), F# (8 bars), Cm (3 bars), D#m (3 bars). Counts are not an ordered progression. The table below preserves the first 16 inferred bars; the complete ordered chart is in `timelines/08-lonely.json` and `transcriptions/08-lonely-observations.json`.

Bar duration uses four beats at the estimated tempo, starting at source zero. **The downbeat has not been established.** Triad-only fitting cannot certify extensions, inversions, borrowed chords, or harmonic rhythm. Low margins mean competing chords fit almost equally well. Do not treat these rows as confirmed changes.

| Start | End | Triad candidate | Alternative | Cosine margin |
|---|---|---|---|---|
| 0:00.000 | 0:02.650 | F#m | D | 0.012 |
| 0:02.650 | 0:05.290 | D | Dm | 0.027 |
| 0:05.290 | 0:07.940 | D | F#m | 0.035 |
| 0:07.940 | 0:10.590 | E | C# | 0.014 |
| 0:10.590 | 0:13.240 | C# | Fm | 0.003 |
| 0:13.240 | 0:15.880 | Fm | C# | 0.083 |
| 0:15.880 | 0:18.530 | Fm | G# | 0.119 |
| 0:18.530 | 0:21.180 | F# | F#m | 0.002 |
| 0:21.180 | 0:23.820 | G# | G#m | 0.033 |
| 0:23.820 | 0:26.470 | Fm | C# | 0.078 |
| 0:26.470 | 0:29.120 | Fm | G# | 0.017 |
| 0:29.120 | 0:31.760 | Fm | F | 0.017 |
| 0:31.760 | 0:34.410 | Cm | C | 0.022 |
| 0:34.410 | 0:37.060 | G#m | C#m | 0.01 |
| 0:37.060 | 0:39.710 | Fm | G# | 0.069 |
| 0:39.710 | 0:42.350 | F# | F#m | 0.007 |

## Bass and melodic observations

- Low-frequency spectral peak candidates (40–250 Hz): **C3, F3, B2, G2, G#2, D3**.
- Upper-register spectral peak candidates (250–1500 Hz): **G4, D#5, F4, C#5, C#4, C5**.
- Confidence: **LOW**. A prominent spectral peak may be an overtone, accompaniment, or vocal component. Counts measure frames, not note durations.
- Timestamped first-16-second observations are supplied in the transcription JSON. Exact bass rhythms, note lengths, lead phrases, and motif identities remain **PENDING**.
- `transcriptions/08-lonely-probe.strudel` sonifies one candidate low-register peak per second. It is a diagnostic probe, not a song motif, bass transcription, or cover.
- Reference clips: [08-lonely-intro.wav](../transcriptions/08-lonely-intro.wav) (0–10 s), [08-lonely-anchor.wav](../transcriptions/08-lonely-anchor.wav) (1:08.782–1:18.782).

## Percussion and instrumentation handoff

Measured full-mix onset positions, first 32 seconds: `[0.104, 13.305, 14.013, 14.396, 14.617, 15.256, 15.871, 15.987, 16.637, 17.287, 17.74, 17.949, 18.204, 18.425, 18.692, 19.737, 19.946, 20.596, 20.817, 21.014, 21.328, 21.92, 22.628, 23.208, 23.255, 23.429, 23.708, 23.8, 23.94, 24.59, 24.66, 25.043, 25.252, 25.902, 26.227, 26.517, 26.633, 27.283, 27.574, 28.398, 28.584, 29.362, 29.455, 29.64, 29.884, 30.035, 30.732, 30.952, 31.115, 31.475, 31.997]`.
First align a downbeat by listening; then classify kick/snare/hat events and measure off-grid offsets. Do not quantize these transient detections directly into a drum groove.

Strudel sound-design recommendation (an audition starting point, **not an observed instrument identification**): Audition a bright high lead to replace the recognizable pitched sample phrase, with a rounded bass and compact drum voices. Use documented synth voices or explicitly loaded sample maps. Check registry names and actual fetched audio; a pleasant sound is not proof of fidelity.

## Musical timeline and dynamics

The boundaries below are automatic changes in mixed-audio MFCC/chroma texture over adjacent five-second windows. Confidence is LOW for musical section boundaries. Section letters distinguish intervals, not repeated-chorus identities. Intro/verse/chorus/bridge/outro labels remain **PENDING listening**.

| Segment | Start | End | RMS dBFS | Local key candidate | Function |
|---|---|---|---|---|---|
| A | 0:00.000 | 0:12.910 | -13.96 | F# minor | Unassigned |
| B | 0:12.910 | 0:27.210 | -21.97 | F minor | Unassigned |
| C | 0:27.210 | 1:43.050 | -17.4 | G# major | Unassigned |
| D | 1:43.050 | 2:25.680 | -16.59 | F minor | Unassigned |
| E | 2:25.680 | 3:08.310 | -15.99 | C# major | Unassigned |
| F | 3:08.310 | 3:56.610 | -15.47 | F minor | Unassigned |
| G | 3:56.610 | 4:15.840 | -17.18 | G# major | Unassigned |
| H | 4:15.840 | 4:23.060 | -31.3 | D# minor | Unassigned |

Match rises/falls in density and level at these candidate transitions after listening. RMS differences indicate energy changes, not necessarily performance dynamics or chorus boundaries.

## Five elements to preserve

1. The actual anchor phrase at 1:08.782–1:18.782 (audio supplied; exact melodic transcription PENDING).
2. The bass register and contour: strongest low-frequency peak candidates C3, F3, B2, G2, G#2, D3; verify fundamentals before using them as notes.
3. The harmonic identity: F minor / G# major profile candidates and ordered bar-level triad chart below; no generic chord loop substituted.
4. The source attack pattern: onset timestamps in the first 32 seconds and beat-level ambiguity at 90.67 BPM; preserve syncopation after downbeat alignment.
5. The source density and dynamic changes at the measured textural boundaries; use the per-section levels rather than a constant full-band loop.

## Three highest-impact implementation priorities

1. Validate the main phrase at 1:08.782–1:18.782 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 90.67 BPM, half-time 45.33, and strongest autocorrelation candidate 90.67; confirm F minor against G# major, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–4:23.064; verify video pre/post-roll and assign verse/chorus labels by listening.

These are reference-driven priorities, not findings against an arrangement that has not yet been supplied.
