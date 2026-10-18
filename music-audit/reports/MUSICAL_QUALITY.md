# Musical quality review — 18 October 2026

These are instrumental review candidates. **No song is approved and all fidelity scores remain null.**
The owner listened to the earlier Babydoll render and described it as partly recognizable, not fully
correct. Measured vocal intonation was corrected afterward. The latest revision has fresh runtime/audio
evidence and retains `runtime-verified` until fresh listening. Other tracks still need comparative listening.

## Changes and remaining musical issues

### Babydoll

192 vocal-contour and 210 accompaniment events across 98.112 seconds replace the old guessed loop. After owner feedback of partial recognition, measured median cent offsets were restored to the 192 vocal notes. The revised pitch centers need fresh listening; guitar tone, missing notes and phrasing still need work.

### Without Me

269 measured G1/D2 bass events replace the unsupported four-root bass loop. Signature riff and upper harmony remain unresolved; do not advertise this as a faithful cover.

### Everyday Normal Guy 2

601 corroborated instrumental note events replace the old repeating tune/harmony across 221.256 seconds. Spoken rap is omitted from the melodic layer.

### Sailor Song

338 vocal-contour and 1116 accompaniment events follow the actual 209.533-second recording interval. Fixed six-subdivision replacement groove removed; meter metadata is still approximate.

### Can't Tell Me Nothing

206 corroborated low-note events replace the guessed bass progression. Sparse instrumental-hook evidence prevented a whole-score replacement. The sample motif and upper harmony remain unresolved.

### Love Me Not

394 vocal-contour and 631 accompaniment events span 213.067 seconds, with measured low notes and transient candidates. Timbre and missing/fragmented notes need listening.

### I Thought I Saw Your Face Today

258 vocal-contour and 558 accompaniment events span 170.4 seconds. Percussion is quiet because broad-band transients do not prove a drum instrument.

### Lonely

538 vocal-contour and 78 accompaniment events span 263.064 seconds, plus measured low notes/transients. Source C/E/F/G material replaces the guessed minor-key loop; sample-voice octave errors and sparse accompaniment need review.


## Complete capture measurements

Real Strudel 1.2.6/WebAudio captures cover each usable reference interval. The captured local score
hashes match the current local files; see `recovery/current-status.json` and per-track metrics/captures.
Line-ending normalization is disclosed separately. No original recording was altered.

| Song | Capture seconds | LUFS | True peak dBTP | Full-scale samples |
|---|---:|---:|---:|---:|
| Babydoll | 101.12 | -18.33 | -1.21 | 0 |
| Without Me | 300.03 | -19.72 | -2.47 | 0 |
| Everyday Normal Guy 2 | 224.09 | -21.60 | -2.55 | 0 |
| Sailor Song | 212.05 | -21.07 | -2.75 | 0 |
| Can't Tell Me Nothing | 274.09 | -21.18 | -3.76 | 0 |
| Love Me Not | 216.06 | -21.62 | -3.01 | 0 |
| I Thought I Saw Your Face Today | 173.06 | -20.51 | -6.40 | 0 |
| Lonely | 266.07 | -22.02 | -3.09 | 0 |

All captures contain finite signal and zero full-scale/non-finite samples. Loudness varies and several
tracks remain below the earlier -16±2 LUFS target. Conservative headroom is retained; this is not a
claim of consistent mastering or perceptual similarity. Gain changes preserve note timing and balance.

## Listening and transcription limits

- CREPE/YIN agreement supports pitch observations. It does not identify the intended singer/instrument.
- Basic Pitch/STFT agreement can retain overtones, miss voicing tones or fragment slides and sustained notes.
- Percussion classification is inferred from broad-band transient evidence, not isolated drum stems.
- Source event times preserve real rests and changes over the recording. No verse/chorus names were invented.
- Rap speech was not turned into arbitrary sung notes. Without Me and Can't Tell Me Nothing keep earlier
  upper parts while their hooks remain unresolved. Failed approaches are recorded, not repeatedly regenerated.
- The private `review.html` pairs actual recordings, earlier drafts and current full renders for A/B review.
- The 100-song expansion remains deferred until musical recognition improves.

## Lyrics

Timed lyric drafts are transcribed from the owner's supplied recordings with Whisper small.en, using
local vocal residuals where available. Phrase boundaries use measured word timestamps. No web lyrics
were scraped. Original MP3s, stems and model weights remain private/ignored. The panel identifies the
transcripts as automatic drafts. Wrong words, omitted low-confidence segments and timing errors remain
possible; no transcript has human approval. Timing follows the source, not an asserted exact vocal rendition.
