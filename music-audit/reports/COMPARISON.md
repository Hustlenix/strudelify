# Recording / render feature comparison

These are cosine similarities of averaged harmonic pitch classes, **not fidelity scores**.
They cannot certify motif order, chord order, groove, instrument identity or recognizability.
Baseline renders cover 24 seconds and candidates cover 32 seconds, so phase and duration differ.
The source intervals (usually 16–80 s) and exact capture durations are recorded in
`capture-comparisons.json`. This is supporting engineering evidence, not aligned critical listening.

| Track | Baseline cosine | Candidate cosine |
|---|---:|---:|
| Babydoll | 0.83336 | 0.85429 |
| Without Me | 0.56519 | 0.79514 |
| Everyday Normal Guy 2 | 0.84317 | 0.85032 |
| Sailor Song | 0.80288 | 0.94240 |
| Can't Tell Me Nothing | 0.70442 | 0.84535 |
| Love Me Not | 0.81209 | 0.94184 |
| I Thought I Saw Your Face Today | 0.86073 | 0.96026 |
| Lonely | 0.68807 | 0.82007 |

The bounded **Babydoll 0–4.37 s opening** comparison improves from 0.64859 to 0.86390.
This supports retaining the 15-event opening voicing repair. It uses the same recording from
which notes were selected, so it is not independent blind transcription validation and does not
certify articulation or timbre likeness.

Human comparative listening has not been performed. The local A/B page supplies the actual
reference, baseline and candidate audio for the next review. All catalog statuses remain
`runtime-verified`, and all perceptual fidelity scores remain null.
