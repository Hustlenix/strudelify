# Music recognition gate

18 October 2026. Eight source arrangements are preserved at music branch
`d3ce425a040bbb4e39dad27edcac372d6c2a16c3`. Their technical status remains
`runtime-verified`. No detector result, code length, note count or loudness measurement
is treated as a listening review. No automatic fidelity scores are assigned.

| Study | Existing evidence and remaining musical fault | Recognition decision |
|---|---|---|
| Babydoll — Dominic Fike | Owner described the earlier version as partly recognizable. The later measured intonation revision has no fresh human assessment; missing guitar articulation, phrasing and notes remain possible. | Benchmark first; not approved. |
| Without Me — Eminem | Bass correction only. Main identifying riff and upper harmony unresolved after bounded analysis. | Recognition not established; cannot claim faithful cover. |
| Everyday Normal Guy 2 — Jon Lajoie | Source-timed instrumental events; spoken rap omitted. Timing and instrumental identity need A/B listening. | Unreviewed instrumental study. |
| Sailor Song — Gigi Perez | Source-timed lead/accompaniment; note fragments, meter and instrumentation need listening. | Unreviewed instrumental study. |
| Can't Tell Me Nothing — Kanye West | Bass correction only; sampled motif and upper harmony unresolved. Sparse detector evidence did not justify another whole-score rewrite. | Recognition not established; cannot claim faithful cover. |
| Love Me Not — Ravyn Lenae | Source-timed lead/accompaniment; timbre, phrasing and missing notes uncertain. | Unreviewed instrumental study. |
| I Thought I Saw Your Face Today — She & Him | Source-timed melody/accompaniment; percussion classification remains uncertain. | Unreviewed instrumental study. |
| Lonely — Akon | Source-derived pitch material; voice octave errors and sparse accompaniment possible. | Unreviewed instrumental study. |

## Owner's new excerpt review

The owner returned actual feedback for all eight anonymous cases. The title choices matched
Babydoll, She & Him, Everyday Normal Guy 2 and Love Me Not, but the owner still described the
sound as off or not good. Sailor Song, Lonely, Without Me and Can't Tell Me Nothing were
“Unsure / none.” This is qualitative feedback, not a fidelity score. Whether the references
were revealed before choosing is unknown, so do not claim a controlled blind-test result.

The owner specifically said only the reviewed Everyday Normal Guy 2 passage (12.05–27.05s)
was correct. Preserve it; do not generalize that observation to the full arrangement. All eight
full songs remain unapproved. Verbatim comments and exact hidden-case mapping are recorded in
`reports/music-review.json`. Do not ask the owner for numeric ratings of unrecognizable clips.

Babydoll's first bounded follow-up is a private lead-phrasing experiment. It uses the existing
recording's F0 and vocal RMS curves within previously corroborated pitch regions, preserving
source slides/envelopes instead of retriggering every short fragment. Accompaniment, bass,
drum timing, form and ending remain unchanged. It is kept separately under `experiments/`,
with runtime/capture evidence and no claim that it sounds better until listening supports that.

All eight have earlier matching full-duration WebAudio captures with no clipped/nonfinite
samples. Those are runtime/signal checks, not recognition. Their exact source hashes,
durations and measurements remain in the preserved music audit.

## Private comparisons

`listening_review.py` prepares eight actual 15-second supplied-recording versus current-render
pairs in the ignored `private/listening/` directory. The report `reports/music-review.json`
records exact source-file identity, hashes, selected intervals and preparation. Selection uses
an observed lead onset as a **candidate** interval. A human must first confirm that the interval
contains the principal recognizable passage. No verse/chorus boundaries are invented.

Excerpts are anonymously shuffled. Play synthesized audio first, select a likely song or
“Unsure / none,” record a concrete difference, then reveal the matching source. Loudness is
normalized only on the excerpt copies. The answer mapping and recordings stay private.
The page exports the listener's own JSON; it does not submit anything or invent responses.

The catalog scores remain unchanged. The new owner review now supports a separate Babydoll
phrasing experiment; the strongest prior version stays preserved. Correct one melody/rhythm/harmony/timbre fault,
render and compare, keep the better version, and record no more than three failed attempts.
Then check the full form, variation, transitions and ending. Do not convert detector events
into unsupported claims about song structure.

## Human review still required

- Listening comparison of Babydoll's separate phrasing experiment before adoption.
- Principal-phrase identification and actionable A/B feedback for all eight.
- Independent title-blind identification where feasible; record whether the reference/title was revealed.
- Full-form listening for sections, transitions, repetition and intentional ending.
- Five to ten real desktop/mobile listeners for the proposed public MVP. None are fabricated here.

Commercial studies and their lyric drafts are excluded from the proposed public artifact.
This preserves the six project-original patterns as honestly labeled drafts for feedback.
No track enters the 100-song count until publication permission, technical validation and
the defined human recognition review are recorded.
