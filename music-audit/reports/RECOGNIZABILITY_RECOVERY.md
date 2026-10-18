# Recognizability failure and live catalog mismatch

Recorded 18 October 2026. Owner feedback: every song heard on the public site sounds like
random beats rather than the intended song. This is negative owner feedback about the public
experience; it is not a completed listening review of the separate eight local cover drafts.

## Reproduced public-site mismatch

At 02:26 UTC, a read-only inspection of
<https://hustlenix.github.io/strudelify/app.js> found a constant catalog with these six entries:
Afterglow, Greenline, Paper Moon, Soft Focus, Tiny Hours and Wide Awake. All are credited to
Strudelify and load `tracks/<demo-id>.strudel`. All six URLs returned HTTP 200.

The application source does not reference `tracks/covers/catalog.json`. That catalog URL and
all eight corresponding `tracks/covers/*.strudel` URLs returned HTTP 404. The requested cover
catalog therefore is not the bundled music on this deployed page. Browser-local user-created
tracks are separate and were not inspected; this check cannot identify a particular local
saved track or claim which title the owner clicked.

Reproduction, from the music worktree:

```powershell
rtk proxy python -X utf8 music-audit/diagnostics/live_catalog.py
```

`live-catalog.json` records URLs, response statuses, the application source hash and the six
bundled entries. This is a catalog/resource check, not an audio listening test.

## Separate composition failure

The eight local cover drafts are also not musically approved. The previous audit established
runtime operation, limited headroom measurements and finite endings. It did not establish
correct complete melodies, basslines, harmony or section arrangements. Aggregate pitch-class
fit cannot validate a hook's note order or phrasing. Following an MP3's energy envelope cannot
turn an unrelated loop into the source song.

Concrete examples from the existing files and audit:

- Babydoll still returns to a G/D/Em/C accompaniment after its measured 0–4.37 s opening;
  the opening source observations contain D/F/A and C#/E voicings. Its later melody is unverified.
- Without Me still uses an unverified four-bar lead and G/Eb/F/D bass/chord sequence;
  the source bass observations favor G/D. No famous riff was certified by the transpose.
- Sailor Song still has unresolved meter/downbeat and six-subdivision drum-grid questions.
- The remaining five have the specific lead, bass, harmony and groove gaps documented in
  `MUSICAL_QUALITY.md` and `KNOWN_ISSUES.md`.

Publishing these eight drafts would not, by itself, fix the owner's musical complaint.

## Recovery order and release gate

1. Defer new 100-song production. Keep the confirmed 100-song Global / English plan, but
   repair the existing music first. No new arrangements have been started.
2. Reconstruct each existing song's principal recognizable phrase from its actual supplied
   recording, with melody, harmony, bass and timing evidence. Work serially in the original order.
3. Make source/render A/B examples for the actual phrase. Reject generic substitution. Record
   uncertainty and source timestamps; do not promote detector output solely because it exists.
4. Complete the whole musical structure, including section contrasts, transitions and ending.
5. Run the musical runtime checks and full-duration audio measurements, then obtain real
   comparative listening observations. Preserve separate technical and musical statuses.
6. Resume new-song production only after the existing eight have passed the principal-phrase
   and full-form listening gate. A negative review must identify a specific correction before
   another attempt; keep the existing three-attempt limit.

Each song's acceptance record must include the actual reference version, compared intervals,
reviewer identity, recognition observations, open issues and the tested source hash. Fidelity
scores remain null unless a defined review actually produces one. No song is approved here.

## OpenCode integration handoff

OpenCode owns the application/player; Codex's permitted edit scope remains `tracks/covers/**`
and `music-audit/**`. This report requests correction of the catalog mismatch in that ownership
workflow. It does not authorize merging or deploying the eight drafts as faithful covers.

Before a future release, confirm that a selected cover resolves to the intended catalog entry
and complete Strudel source, and that its exact music revision has the required musical review.
Verify the live URLs and selected recording after integration. Keep the six originals identified
as originals; do not relabel their audio as the requested commercial songs.

This diagnostic changes no application code or musical notes, and does not claim the live site
or the eight compositions have been repaired. Original recordings remain read-only.
