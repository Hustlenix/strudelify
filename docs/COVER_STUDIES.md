# Restored instrumental cover studies

Publication request: 19 October 2026. The owner asked “Deploy them too” after being
told that Babydoll and the other seven arrangements were absent from the public catalog.
This restores those exact existing Strudel scores alongside the six originals.

| Track | Original artist | Current review status |
|---|---|---|
| Babydoll | Dominic Fike | Runtime verified; musical review unfinished |
| Without Me | Eminem | Runtime verified; hook/harmony still incomplete |
| Everyday Normal Guy 2 | Jon Lajoie | Runtime verified; instrumental rendition, no rap vocal |
| Sailor Song | Gigi Perez | Runtime verified; musical review unfinished |
| Can't Tell Me Nothing | Kanye West | Runtime verified; hook/harmony still incomplete |
| Love Me Not | Ravyn Lenae | Runtime verified; musical review unfinished |
| I Thought I Saw Your Face Today | She & Him | Runtime verified; musical review unfinished |
| Lonely | Akon | Runtime verified; musical review unfinished |

These are experimental synthesized instrumental arrangements, not the original artist
recordings or approved faithful reproductions. Artist names identify the original songs.
No original MP3, separated stem, commercial album artwork or lyric transcript is included.
The abstract SVG thumbnails are the existing project artwork.

## Provenance and rights fields

The existing scores are unchanged apart from release line-ending normalization.
The current catalog retains `runtime-verified` and `unreviewed`; publishing them does
not create a human listening pass or change them to musically approved.
Matching prior full-duration technical measurements are preserved in
`release-audit/reports/covers-baseline.json`. Fresh player checks are separate evidence.

The catalog records `owner-requested-study`, not `cleared` or `project-original`.
The owner's publication instruction is not represented as permission from the
underlying song rights holders. Underlying composition rights remain reserved;
the application's open-source license does not grant rights in third-party songs.
No independent composition-rights clearance is recorded in this project.

## Drum-bank dependency

The arrangements retain their existing RolandTR909 percussion. Only the four
required instrument mappings are included in `assets/samples/roland-tr909.json`.
They load lazily when a cover needs them; original tracks keep their native synths.
The sample URLs are pinned to upstream commit
`15eac73c5e878550f91d864a4863e014799403f1` of
[tidal-drum-machines](https://github.com/ritchse/tidal-drum-machines).
The mapping was selected from the official
[dough-samples registry](https://github.com/felixroos/dough-samples/blob/main/tidal-drum-machines.json).
No sample audio bytes are copied into this repository or release archive.
The upstream README does not establish individual sample licensing; no CC0 or
other sample-rights clearance is claimed here. These are existing score dependencies,
not newly asserted project-owned samples.

The release still uses an exact file allowlist and per-score hashes. Study publication
requires an explicit owner instruction in the dispatch record; arbitrary additional
catalog items, commercial recordings and lyrics are not admitted by that instruction.
