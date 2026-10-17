# Music runtime evaluation

All eight current file hashes pass real Strudel 1.2.6 evaluation, full-duration cycle queries, finite-ending checks, valid gain checks, named sample-bank lookup and stereo WebAudio capture. Catalog order, URLs, BPM and source hashes pass. Original MP3s are unchanged.

| Track | Events | Captured seconds | Baseline peak dBFS | Candidate peak dBFS | Samples >= 0 dBFS |
|---|---:|---:|---:|---:|---:|
| Babydoll | 816 | 32 | -0.415 | -2.802 | 0 |
| Without Me | 3961 | 32 | 0.897 | -3.536 | 0 |
| Everyday Normal Guy 2 | 1888 | 32.085 | -5.286 | -5.544 | 0 |
| Sailor Song | 1811 | 32.085 | -1.549 | -3.73 | 0 |
| Can't Tell Me Nothing | 1816 | 32 | 1.837 | -3.575 | 0 |
| Love Me Not | 2129 | 32 | -5.73 | -6.124 | 0 |
| I Thought I Saw Your Face Today | 1230 | 32.085 | 0.488 | -4.555 | 0 |
| Lonely | 1803 | 32.085 | -1.009 | -3.751 | 0 |

Node controls: valid pattern, invalid method, invalid syntax and silence behaved as expected. Browser controls: positive sine, missing qualified bank and silence behaved as expected.

These results establish technical behavior for the recorded hashes. Audio captures cover the first 32 seconds, not every musical section. Floating-point PCM was measured before file conversion. DAC clipping and full-track true-peak/LUFS mastering were not assessed. Sample resource URLs are recorded in final-browser.json.

Reproduce with the commands in ../README.md. Historical/pre-form capture failures are preserved separately; the HMR/network suspension was corrected by disabling file watching and repeating the capture.
