# Dominic Fike — Babydoll

Status: **MEASURED REFERENCE WORKSHEET / TRANSCRIPTION NOT YET VERIFIED BY LISTENING**.
This document is an engineering handoff, not a certified note-for-note chart. No critical listening or perceptual fidelity assessment was performed. Low-confidence candidates must be auditioned before use.

## Source and usable segment

- Filename: `Dominic Fike - Babydoll (Lyrics) - 7clouds.mp3`
- Original location: `C:\Users\LalithReddy.b\media\playlists\Dominic Fike - Babydoll (Lyrics) - 7clouds.mp3`
- SHA256: `f4f8c5c821cf3b03f96b78bae00a9314878a94c0519a561378a6369c468abbad`
- Full decoded length: 1:38.112 (98.112 s).
- Analysis segment: 0–1:38.112; FULL_FILE_EXAMINED. Full source decoded. Video pre/post-roll identity remains unverified without listening.
- Endpoint confidence: HIGH for file end, not semantic song end.
- Excluded tail: 0.0 s. No excluded tail.
- Reference peak (decoded mono): 2.824 dBFS; 13520 samples at or above 0 dBFS. This does not certify the original stereo master against clipping.

Apple catalog identity cross-check: [Babydoll](https://music.apple.com/us/album/babydoll/1438243719?i=1438243880&uo=4); catalog duration 97.960 s. Strongest normalized waveform match: {'source_offset_s': 48.114, 'absolute_correlation': 0.9967}. Correlation is a signal statistic, not a perceptual similarity score.

## Tempo, meter, and rhythmic feel

- Beat-tracker estimate: **166.709 BPM**; half-time 83.354, double-time 333.417.
- Confidence: MEDIUM for periodicity; beat level and drift require listening. Beat-interval coefficient of variation: 0.02967803699040933.
- Autocorrelation candidates: `[{'bpm': 56.17, 'autocorrelation': 14129.093}, {'bpm': 83.35, 'autocorrelation': 13396.112}, {'bpm': 166.71, 'autocorrelation': 12622.963}, {'bpm': 105.47, 'autocorrelation': 10712.106}, {'bpm': 117.45, 'autocorrelation': 9980.726}]`. These include rhythmic multiples; the largest peak is not automatically the musical beat.
- Meter: **4/4 is an UNVERIFIED working hypothesis**, not a measured time-signature result.
- Swing, backbeat placement, kick/snare identity, accents, and rap/melodic phrasing: **PENDING listening**. Onset timestamps are measured transients from a full mix, not a drum transcription.

## Tonal center and chord chart

Profile fits: `[{'key': 'A minor', 'profile_correlation': 0.6558}, {'key': 'A major', 'profile_correlation': 0.402}, {'key': 'C major', 'profile_correlation': 0.3813}, {'key': 'E minor', 'profile_correlation': 0.3338}]`. Confidence: LOW/MEDIUM: global chroma profile fit on mixed audio, relative modes may be ambiguous.

Common triad candidates: Am (19 bars), A (9 bars), Gm (8 bars), Em (6 bars), Dm (6 bars), G (5 bars). Counts are not an ordered progression. The table below preserves the first 16 inferred bars; the complete ordered chart is in `timelines/01-babydoll.json` and `transcriptions/01-babydoll-observations.json`.

Bar duration uses four beats at the estimated tempo, starting at source zero. **The downbeat has not been established.** Triad-only fitting cannot certify extensions, inversions, borrowed chords, or harmonic rhythm. Low margins mean competing chords fit almost equally well. Do not treat these rows as confirmed changes.

| Start | End | Triad candidate | Alternative | Cosine margin |
|---|---|---|---|---|
| 0:00.000 | 0:01.440 | Am | A | 0.003 |
| 0:01.440 | 0:02.880 | A | C#m | 0.052 |
| 0:02.880 | 0:04.320 | Am | A | 0.017 |
| 0:04.320 | 0:05.760 | Am | A | 0.055 |
| 0:05.760 | 0:07.200 | Gm | G | 0.01 |
| 0:07.200 | 0:08.640 | G | Gm | 0.047 |
| 0:08.640 | 0:10.080 | D | Gm | 0.02 |
| 0:10.080 | 0:11.520 | Gm | D# | 0.056 |
| 0:11.520 | 0:12.960 | A | Am | 0.006 |
| 0:12.960 | 0:14.400 | Am | A | 0.118 |
| 0:14.400 | 0:15.840 | Am | A | 0.084 |
| 0:15.840 | 0:17.280 | Em | C | 0.008 |
| 0:17.280 | 0:18.720 | Am | F | 0.02 |
| 0:18.720 | 0:20.150 | D | Dm | 0.019 |
| 0:20.150 | 0:21.590 | F | Cm | 0.015 |
| 0:21.590 | 0:23.030 | F | Am | 0.033 |

## Bass and melodic observations

- Low-frequency spectral peak candidates (40–250 Hz): **G2, F2, C2, A1, A2, D2**.
- Upper-register spectral peak candidates (250–1500 Hz): **A4, E5, G4, C5, G#4, G5**.
- Confidence: **LOW**. A prominent spectral peak may be an overtone, accompaniment, or vocal component. Counts measure frames, not note durations.
- Timestamped first-16-second observations are supplied in the transcription JSON. Exact bass rhythms, note lengths, lead phrases, and motif identities remain **PENDING**.
- `transcriptions/01-babydoll-probe.strudel` sonifies one candidate low-register peak per second. It is a diagnostic probe, not a song motif, bass transcription, or cover.
- Reference clips: [01-babydoll-intro.wav](../transcriptions/01-babydoll-intro.wav) (0–10 s), [01-babydoll-anchor.wav](../transcriptions/01-babydoll-anchor.wav) (0:48.114–0:58.114).

## Percussion and instrumentation handoff

Measured full-mix onset positions, first 32 seconds: `[0.197, 0.766, 1.115, 1.265, 1.614, 1.834, 2.194, 2.334, 2.682, 2.914, 3.053, 3.622, 3.971, 4.133, 4.458, 4.632, 4.702, 5.201, 5.55, 5.759, 5.898, 6.177, 6.478, 6.838, 6.989, 7.338, 7.558, 7.906, 8.034, 8.406, 8.615, 8.754, 9.323, 9.671, 9.81, 10.17, 10.379, 10.832, 11.262, 11.61, 12.005, 12.202, 12.365, 12.574, 12.713, 12.945, 13.096, 13.282, 13.433, 13.781, 14.141, 14.362, 14.501, 14.872, 15.058, 15.244, 15.453, 15.569, 15.813, 15.94, 16.149, 16.637, 16.985, 17.218, 17.345, 17.926, 18.088, 18.286, 18.982, 19.331, 19.47, 19.841, 20.05, 20.201, 20.573, 20.759, 21.142, 21.258, 21.525, 21.676, 21.815, 22.349, 22.698, 22.941, 23.429, 23.626, 23.789, 23.998, 24.149, 24.369, 24.52, 24.706, 25.217, 25.554, 26.297, 26.482, 26.668, 26.877, 27.005, 27.562, 27.713, 28.073, 28.444, 28.642, 28.781, 29.141, 29.338, 29.513, 29.71, 29.849, 30.093, 30.221, 30.407, 30.557, 30.766, 30.894, 31.266, 31.475, 31.637, 31.997]`.
First align a downbeat by listening; then classify kick/snare/hat events and measure off-grid offsets. Do not quantize these transient detections directly into a drum groove.

Strudel sound-design recommendation (an audition starting point, **not an observed instrument identification**): Try a short-decay plucked voice for the pitched motif, a rounded bass voice, and restrained percussion. Use documented synth voices or explicitly loaded sample maps. Check registry names and actual fetched audio; a pleasant sound is not proof of fidelity.

## Musical timeline and dynamics

The boundaries below are automatic changes in mixed-audio MFCC/chroma texture over adjacent five-second windows. Confidence is LOW for musical section boundaries. Section letters distinguish intervals, not repeated-chorus identities. Intro/verse/chorus/bridge/outro labels remain **PENDING listening**.

| Segment | Start | End | RMS dBFS | Local key candidate | Function |
|---|---|---|---|---|---|
| A | 0:00.000 | 0:12.170 | -13.17 | A minor | Unassigned |
| B | 0:12.170 | 0:42.960 | -8.26 | A minor | Unassigned |
| C | 0:42.960 | 0:57.400 | -8.99 | A minor | Unassigned |
| D | 0:57.400 | 1:14.810 | -9.38 | A minor | Unassigned |
| E | 1:14.810 | 1:33.110 | -7.83 | A minor | Unassigned |
| F | 1:33.110 | 1:38.110 | -11.89 | G minor | Unassigned |

Match rises/falls in density and level at these candidate transitions after listening. RMS differences indicate energy changes, not necessarily performance dynamics or chorus boundaries.

## Five elements to preserve

1. The actual anchor phrase at 0:48.114–0:58.114 (audio supplied; exact melodic transcription PENDING).
2. The bass register and contour: strongest low-frequency peak candidates G2, F2, C2, A1, A2, D2; verify fundamentals before using them as notes.
3. The harmonic identity: A minor / A major profile candidates and ordered bar-level triad chart below; no generic chord loop substituted.
4. The source attack pattern: onset timestamps in the first 32 seconds and beat-level ambiguity at 166.71 BPM; preserve syncopation after downbeat alignment.
5. The source density and dynamic changes at the measured textural boundaries; use the per-section levels rather than a constant full-band loop.

## Three highest-impact implementation priorities

1. Validate the main phrase at 0:48.114–0:58.114 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 166.71 BPM, half-time 83.35, and strongest autocorrelation candidate 56.17; confirm A minor against A major, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–1:38.112; verify video pre/post-roll and assign verse/chorus labels by listening.

These are reference-driven priorities, not findings against an arrangement that has not yet been supplied.
