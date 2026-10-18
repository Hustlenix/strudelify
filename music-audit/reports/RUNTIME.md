# Runtime evaluation — current music recovery

Eight current score files pass actual Strudel 1.2.6 parsing, REPL evaluation, bounded event queries,
named instrument checks and real full-duration stereo WebAudio captures. Negative controls verify that
missing banks and silence are rejected. Original-source hashes match all 16 preserved album/playlist files.

`recovery/current-status.json` is the current hash/measurement index. Each track has `-runtime.json`,
`-capture.json` and `-metrics.json`. Raw PCM, WAV renders, source excerpts, stems and models stay ignored.
Only code, metadata, transcripts and reports are committed. Audio proof establishes signal generation,
duration and measured headroom; it does not establish musical recognition or approval.

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

Application transport/lyrics checks are recorded separately in `playback-regressions.json`.

Additional hardware-only recheck: 18 seconds per current score, actual AudioContext identified explicitly, all eight pass with zero full-scale samples; all three negative/positive controls pass. See hardware-recheck-browser.json. Offline impulse generation is excluded.
