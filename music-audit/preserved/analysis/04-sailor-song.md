# Gigi Perez — Sailor Song

Status: **MEASURED REFERENCE WORKSHEET / TRANSCRIPTION NOT YET VERIFIED BY LISTENING**.
This document is an engineering handoff, not a certified note-for-note chart. No critical listening or perceptual fidelity assessment was performed. Low-confidence candidates must be auditioned before use.

## Source and usable segment

- Filename: `Gigi Perez - Sailor Song (Lyrics) - Taggart Douds.mp3`
- Original location: `C:\Users\LalithReddy.b\media\playlists\Gigi Perez - Sailor Song (Lyrics) - Taggart Douds.mp3`
- SHA256: `60856062b32316672b3119c09b2cb1fe869d31649603481e3e71d3ed0a0285a0`
- Full decoded length: 29:57.384 (1797.384 s).
- Analysis segment: 0–3:29.533; IDENTIFIED_REPEAT_CYCLE. Named Apple catalog preview matches the local file. Recurring intro and whole-cycle waveform correlation identify one local loop.
- Endpoint confidence: HIGH for repetition boundary; semantic intro/outro labels unverified.
- Excluded tail: 1587.851 s. REPEATED SONG detected; remaining tail not exhaustively identity-certified.
- Reference peak (decoded mono): 3.623 dBFS; 23424 samples at or above 0 dBFS. This does not certify the original stereo master against clipping.

Apple catalog identity cross-check: [Sailor Song](https://music.apple.com/us/album/sailor-song/1770187509?i=1770187510&uo=4); catalog duration 211.979 s. Strongest normalized waveform match: {'source_offset_s': 1192.881179, 'absolute_correlation': 0.9745}. Correlation is a signal statistic, not a perceptual similarity score.

Long-record investigation: intro recurrence period 209.533 s; whole-cycle correlation 0.9942. Additional intro/preview matches are in the JSON. This establishes repetition, while unmatched intervening portions remain unidentified.

## Tempo, meter, and rhythmic feel

- Beat-tracker estimate: **126.048 BPM**; half-time 63.024, double-time 252.096.
- Confidence: MEDIUM for periodicity; beat level and drift require listening. Beat-interval coefficient of variation: 0.10869358332293938.
- Autocorrelation candidates: `[{'bpm': 63.02, 'autocorrelation': 9172.395}, {'bpm': 95.7, 'autocorrelation': 8827.999}, {'bpm': 191.41, 'autocorrelation': 8729.946}, {'bpm': 126.05, 'autocorrelation': 8275.555}, {'bpm': 76.0, 'autocorrelation': 7982.294}]`. These include rhythmic multiples; the largest peak is not automatically the musical beat.
- Meter: **4/4 is an UNVERIFIED working hypothesis**, not a measured time-signature result.
- Swing, backbeat placement, kick/snare identity, accents, and rap/melodic phrasing: **PENDING listening**. Onset timestamps are measured transients from a full mix, not a drum transcription.

## Tonal center and chord chart

Profile fits: `[{'key': 'B major', 'profile_correlation': 0.823}, {'key': 'D# minor', 'profile_correlation': 0.6923}, {'key': 'G# minor', 'profile_correlation': 0.6716}, {'key': 'F# major', 'profile_correlation': 0.4319}]`. Confidence: LOW/MEDIUM: global chroma profile fit on mixed audio, relative modes may be ambiguous.

Common triad candidates: B (58 bars), G#m (41 bars), D#m (9 bars), E (3 bars). Counts are not an ordered progression. The table below preserves the first 16 inferred bars; the complete ordered chart is in `timelines/04-sailor-song.json` and `transcriptions/04-sailor-song-observations.json`.

Bar duration uses four beats at the estimated tempo, starting at source zero. **The downbeat has not been established.** Triad-only fitting cannot certify extensions, inversions, borrowed chords, or harmonic rhythm. Low margins mean competing chords fit almost equally well. Do not treat these rows as confirmed changes.

| Start | End | Triad candidate | Alternative | Cosine margin |
|---|---|---|---|---|
| 0:00.000 | 0:01.900 | G#m | B | 0.038 |
| 0:01.900 | 0:03.810 | G#m | G# | 0.082 |
| 0:03.810 | 0:05.710 | G#m | B | 0.05 |
| 0:05.710 | 0:07.620 | G#m | E | 0.019 |
| 0:07.620 | 0:09.520 | G#m | B | 0.032 |
| 0:09.520 | 0:11.420 | G#m | D#m | 0.007 |
| 0:11.420 | 0:13.330 | D#m | G#m | 0.053 |
| 0:13.330 | 0:15.230 | D#m | B | 0.056 |
| 0:15.230 | 0:17.140 | G#m | E | 0.016 |
| 0:17.140 | 0:19.040 | B | G#m | 0.016 |
| 0:19.040 | 0:20.940 | G#m | G# | 0.057 |
| 0:20.940 | 0:22.850 | G#m | G# | 0.069 |
| 0:22.850 | 0:24.750 | G#m | G# | 0.137 |
| 0:24.750 | 0:26.660 | G#m | G# | 0.169 |
| 0:26.660 | 0:28.560 | B | Bm | 0.04 |
| 0:28.560 | 0:30.460 | G#m | B | 0.153 |

## Bass and melodic observations

- Low-frequency spectral peak candidates (40–250 Hz): **B1, G#1, E1, B2, G#3, B3**.
- Upper-register spectral peak candidates (250–1500 Hz): **B3, D#5, F#5, B4, A#5, F#4**.
- Confidence: **LOW**. A prominent spectral peak may be an overtone, accompaniment, or vocal component. Counts measure frames, not note durations.
- Timestamped first-16-second observations are supplied in the transcription JSON. Exact bass rhythms, note lengths, lead phrases, and motif identities remain **PENDING**.
- `transcriptions/04-sailor-song-probe.strudel` sonifies one candidate low-register peak per second. It is a diagnostic probe, not a song motif, bass transcription, or cover.
- Reference clips: [04-sailor-song-intro.wav](../transcriptions/04-sailor-song-intro.wav) (0–10 s), [04-sailor-song-anchor.wav](../transcriptions/04-sailor-song-anchor.wav) (0:24.148–0:34.148).

## Percussion and instrumentation handoff

Measured full-mix onset positions, first 32 seconds: `[0.186, 0.267, 1.521, 2.276, 2.508, 4.272, 4.505, 4.76, 4.992, 5.236, 5.561, 5.724, 6.165, 6.49, 6.653, 6.815, 7.001, 7.117, 7.43, 7.732, 8.046, 8.22, 8.371, 8.673, 8.998, 9.149, 9.334, 9.625, 9.95, 10.147, 10.263, 10.6, 10.762, 10.948, 11.099, 11.215, 11.738, 12.04, 12.167, 12.655, 12.806, 13.27, 13.479, 13.746, 14.095, 14.234, 14.698, 15.035, 15.325, 15.673, 15.836, 15.975, 16.149, 16.266, 16.614, 16.765, 16.939, 17.113, 17.229, 17.578, 17.752, 17.868, 18.193, 18.355, 18.518, 18.808, 19.319, 19.458, 19.76, 19.911, 20.376, 20.886, 21.026, 21.06, 21.328, 21.664, 21.838, 21.989, 22.291, 22.628, 22.93, 23.255, 23.417, 23.568, 23.87, 24.207, 24.369, 24.694, 24.822, 25.159, 25.461, 25.96, 26.122, 26.378, 27.028, 27.307, 27.643, 27.806, 27.945, 28.468, 28.897, 29.396, 29.559, 29.849, 29.977, 30.174, 30.337, 30.372, 30.476, 30.824, 30.964, 31.138, 31.393, 31.428, 31.765]`.
First align a downbeat by listening; then classify kick/snare/hat events and measure off-grid offsets. Do not quantize these transient detections directly into a drum groove.

Strudel sound-design recommendation (an audition starting point, **not an observed instrument identification**): Audition plucked or guitar-like harmonic voices with a sustained lead and a gradual density increase. Use documented synth voices or explicitly loaded sample maps. Check registry names and actual fetched audio; a pleasant sound is not proof of fidelity.

## Musical timeline and dynamics

The boundaries below are automatic changes in mixed-audio MFCC/chroma texture over adjacent five-second windows. Confidence is LOW for musical section boundaries. Section letters distinguish intervals, not repeated-chorus identities. Intro/verse/chorus/bridge/outro labels remain **PENDING listening**.

| Segment | Start | End | RMS dBFS | Local key candidate | Function |
|---|---|---|---|---|---|
| A | 0:00.000 | 0:05.060 | -37.4 | G# minor | Unassigned |
| B | 0:05.060 | 0:24.060 | -16.58 | G# minor | Unassigned |
| C | 0:24.060 | 1:04.550 | -19.6 | B major | Unassigned |
| D | 1:04.550 | 1:36.080 | -15.18 | B major | Unassigned |
| E | 1:36.080 | 3:04.090 | -12.82 | B major | Unassigned |
| F | 3:04.090 | 3:24.520 | -22.53 | B major | Unassigned |
| G | 3:24.520 | 3:29.530 | -27.01 | B major | Unassigned |

Match rises/falls in density and level at these candidate transitions after listening. RMS differences indicate energy changes, not necessarily performance dynamics or chorus boundaries.

## Five elements to preserve

1. The actual anchor phrase at 0:24.148–0:34.148 (audio supplied; exact melodic transcription PENDING).
2. The bass register and contour: strongest low-frequency peak candidates B1, G#1, E1, B2, G#3, B3; verify fundamentals before using them as notes.
3. The harmonic identity: B major / D# minor profile candidates and ordered bar-level triad chart below; no generic chord loop substituted.
4. The source attack pattern: onset timestamps in the first 32 seconds and beat-level ambiguity at 126.05 BPM; preserve syncopation after downbeat alignment.
5. The source density and dynamic changes at the measured textural boundaries; use the per-section levels rather than a constant full-band loop.

## Three highest-impact implementation priorities

1. Validate the main phrase at 0:24.148–0:34.148 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 126.05 BPM, half-time 63.02, and strongest autocorrelation candidate 63.02; confirm B major against D# minor, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–3:29.533; use one identified local cycle, not the full 30-minute file.

These are reference-driven priorities, not findings against an arrangement that has not yet been supplied.
