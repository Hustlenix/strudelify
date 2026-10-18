# Next 100 songs — Strudelify music production plan

Planning date: **18 October 2026, Asia/Calcutta**.

## Scope and assumptions

Plan **100 additional individual songs**, delivered sequentially in **10 batches of 10**.
These batches are release collections, not claims that the songs belong to a new artist album.
If the owner means 100 complete albums, inventory each album's actual track list and re-estimate
the scope before production. The optional regional preference is pending; the provisional mix
is global hits plus Indian songs. This plan does not start 100 arrangements or a background job.

The existing eight are separate from these 100. Their current catalog status is runtime-verified;
full melody, bass, harmonic structure and critical listening remain incomplete. Their audit is
the regression baseline, not evidence that the fidelity workflow is finished. No existing
arrangement is discarded to make room for the expansion.

## 1. A rolling selection process keeps the catalog current

Reserve 100 slots now, but lock only the next **10 titles**. Recheck the candidate shortlist
immediately before each song starts. Later batches can use later viral releases instead of
filling a frozen list with songs that stopped trending months earlier.

Provisional allocations, with no duplicate counting between lanes:

| Lane | Per batch | Total |
|---|---:|---:|
| Global pop / R&B / other mainstream releases | 5 | 50 |
| Hindi / Indian film or independent music | 1 | 10 |
| Tamil music | 1 | 10 |
| Other Indian languages / Punjabi | 1 | 10 |
| Global dance / Latin / Afrobeats / K-pop | 1 | 10 |
| Emerging breakout, any region | 1 | 10 |
| **Total** | **10** | **100** |

Selection requirements:

1. Confirm title, artist, exact recording/version and original album using an official artist,
   label or service release page. Album, release date, BPM, key and duration stay null until checked.
2. Record a dated recent demand signal: chart position, measured gain or platform trend metric.
   Target trend evidence no older than 14 days at selection, and refresh it within 48 hours of coding.
3. Require a separate current growth/viral signal before calling a song **viral**. A chart listing,
   a cumulative view count, or one creator's upload is not sufficient by itself. Two charts can
   corroborate popularity but do not automatically prove short-form virality.
4. Prefer recent releases: planning target at least 80 of the 100 released within 90 days of
   their selection. Up to 20 may be explicitly labeled recent resurgences of older recordings.
   A fresh chart entry is not proof of a fresh release date.
5. Audition the recognizable hook and assess whether a synthesized instrumental arrangement can
   carry it. Rap-heavy or timbre-dependent songs need a verified instrumental motif or a convincing
   melodic treatment; a generic beat under the original title does not qualify.
6. Select only when the full exact reference recording is available for analysis/listening.
   A short preview can identify a release but cannot establish the whole song's structure.
7. Deduplicate by artist + recording identity + version. Distinguish clean/explicit, remix,
   live and sped-up recordings, and avoid counting alternate versions as new songs by default.

### Sources and current access limits

- [Billboard Hot 100, 17 October 2026](https://ca.billboard.com/charts/hot-100/2026-10-17): current chart candidates.
- [Official UK Singles Chart, 16 October 2026](https://www.officialcharts.com/charts/singles-chart/20261016/7501/): independent dated chart evidence.
- [Billboard Global Excl. US, 17 October 2026](https://ca.billboard.com/charts/billboard-global-excl-us/2026-10-17): international demand.
- [Spotify Charts](https://charts.spotify.com/home): currently presents a login gate to detailed charts.
- [YouTube Charts](https://charts.youtube.com/charts/TopSongs/global/weekly): chart entries were not available through text extraction in this research pass; use a permitted visible session/export when selecting.
- [TikTok trend discovery](https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/en): redirected to the current Creative Center; no dated song metrics were verified in this pass.

Do not substitute stale search snippets for inaccessible live trend data. Indian slots remain
unfilled until current regional evidence is verified. The ten named research candidates in
`candidates-2026-10-18.json` are **chart-verified candidates, not certified viral selections**.
Their references, release dates, arrangements and social-growth evidence are still pending.

### Initial research shortlist

These are investigation candidates as of 18 October, not the locked first batch. The regional
slots still need their own research. Positions refer to the dated sources linked above.

| Song | Artist as charted | Verified chart signal |
|---|---|---|
| Patient Zero | Taylor Swift | Hot 100 #1, 17 October |
| Solar Eclipse | Drake & Don Toliver | Hot 100 #5, 17 October |
| Nicole Kidman | ADELA | Hot 100 #9, 17 October |
| Draw You Out | Noah Kahan | Hot 100 #25, 17 October |
| Last Thing You Need | Morgan Wallen | Hot 100 #16, 17 October |
| Stop The Wedding | Ashe | UK #3, 16 October |
| Great Expectation | Sienna Spiro | UK #4, 16 October |
| My Body Isn't Ready | sombr | UK #10, 16 October |
| BbY WOW | Karol G with Judeline & rusowsky | Global Excl. US #1, 17 October |
| Loser | Tame Impala | Global Excl. US #20, 17 October |

Start the reference investigation with **Patient Zero** because of its current chart demand.
The first composition is selected only after its exact recording, release date, full reference,
current viral-growth evidence and suitability for a Strudel instrumental have been checked.
If it fails a selection gate, use the next qualified candidate and record the reason.

## 2. "Lengthy" means a full musical arrangement

Target the recording's full natural form. Most selections should support roughly **2:30–5:00**
of music, but preserve a genuinely shorter song or a longer evolving song when appropriate.
Do not stretch a two-minute song with repeated filler or count a four-bar loop as a full cover.

Each composition needs:

- Its principal melody, recognizable hook and important instrumental motifs.
- Documented chord voicings, inversions, harmonic rhythm and bass movement.
- Source-backed tempo, meter, downbeat placement and groove; preserve drift if it matters.
- Separate musical treatment for the actual sections that were heard in the recording.
- Musical transitions: pickups, fills, dropouts, connecting bass/lead phrases and an intentional ending.
- At least two contrasting roles/textures when the recording has them; synth/sample choices
  should fit the material without pretending to reproduce the original singer.

Section names and time/bar boundaries must come from reference evidence. If uncertain, use
timestamped section IDs and record the uncertainty. A source volume envelope alone does not
count as verse/chorus orchestration or a complete song structure.

## 3. Produce one song at a time

| Stage | Work | Evidence required to leave the stage |
|---|---|---|
| Reference | Identify the exact recording; preserve original bytes; inspect its whole form | Official recording link, local full-reference path, SHA-256, duration and dated trend evidence |
| Hook | Transcribe and code a 15–30 s principal phrase, including its bass/harmony | Corresponding source/render intervals and a recognizable motif review |
| Skeleton | Code complete harmonic movement, bass, drums and a timed section map | Event queries cover the whole source-backed form; no guessed chords or cuts treated as facts |
| Arrangement | Complete melodies, instrumentation, contrasts, transitions and ending | Full musical score/code with source observations and open questions |
| Runtime | Evaluate the exact script using the agreed production Strudel version | Real parser/REPL, all sections/transitions queried, named assets loaded, errors surfaced |
| Audio | Capture the **whole arrangement**, then measure and compare | Full-duration stereo capture, beginning/end checks, no non-finite/clipped PCM, documented mix readings |
| Listening | Compare hook, verse, chorus, transitions and ending against the full reference | Actual listener/reviewer, dated observations and source/render timestamps; fix specific failures |
| Handoff | Append the verified item and deliver its commit to OpenCode | Accurate catalog status, metadata, reports, source hash and commit SHA |

Keep one actively edited arrangement. A small waiting review queue can contain at most three
tracks; do not manufacture approval or fill the remaining queue with unreviewed generic loops.
Once the review queue reaches that limit, resolve its concrete issues before starting another.

Make one specific correction at a time. Compare the result, keep the better version and checkpoint
meaningful improvements. After three failed evidence-driven attempts on an issue, record the issue
and change the approach; do not churn through complete rewrites or mark the song approved.

## 4. Quality gates

### Musical recognition

The first three new songs are a workflow pilot. For each, a listener should be able to identify
the intended song from its principal phrase without relying on the title. Record what was
actually recognized and where. Do not claim a blind recognition test happened if no listener
performed it. Unclear results require a targeted melody/harmony/groove repair.

For the complete song, compare major sections and every transition. Track note timing, bass roots,
harmonic changes, groove and instrument balance as separate observations. Automatic pitch-class
cosine/DTW can help diagnose a problem but is not a fidelity score or a listening review.

### Runtime and audio

- Use the production-agreed runtime; the current audit baseline is Strudel **1.2.6**. Confirm
  integration compatibility before changing that dependency. Do not fix player code to conceal a song failure.
- Validate qualified samples such as `RolandTR909_bd`, including delayed-entry voices, and warm
  actual assets before judging the opening. Missing sample and missing resource controls must fail.
- Query every section and fine-grained windows around transitions; verify the note-onset cutoff
  after the intended ending and listen to effect tails.
- Capture complete stereo output. The old 32-second checks remain useful regression evidence,
  but are insufficient as approval for a full arrangement.
- Internal mix target: **-16 LUFS integrated, approximately ±2 LU**, with **true peak <= -1 dBTP**
  and zero non-finite or full-scale clipped samples. This is a proposed project target, not a claim
  about Spotify's requirements. Measure first, adjust musical balance and gain, and retain dynamics.
- Log sample resources, codec/capture settings, source-code hash and the exact tested commit.

Actual critical listening is required for `listening-reviewed`; approval additionally requires
the complete review checklist and no unresolved major musical or runtime defect. A full master
recording must not be uploaded/committed merely to make comparisons convenient.

## 5. Ten batches, all coded serially

| Batch | Additional-song slots | Special checkpoint |
|---|---|---|
| 1 | 001–010 | First three establish hook, full-form and listening quality; remaining seven reuse the validated process |
| 2 | 011–020 | Refresh selection; check consistent loudness and runtime resources across both batches |
| 3 | 021–030 | Review repetitive arrangements and correct missing section contrasts |
| 4 | 031–040 | Confirm source/recording identity, tempo ambiguity and version handling |
| 5 | 041–050 | Midpoint review of the complete catalog and unresolved major issues |
| 6 | 051–060 | Refresh regional selections and keep arrangements musically distinct |
| 7 | 061–070 | Recheck melodic recognizability, bass detail and transition quality |
| 8 | 071–080 | Review dense arrangements and delayed-entry sample resources |
| 9 | 081–090 | Recheck freshness of the remaining shortlist and full-duration audio evidence |
| 10 | 091–100 | Final catalog/order/metadata audit and complete handoff of 100 actual arrangements |

Every batch still follows the same gates; later checkpoints do not defer basic quality checks.
Release counts mean files that actually reached the stated review status, not reserved slots.

## 6. Files, metadata and ownership

```text
tracks/covers/
  catalog.json                         # existing eight preserved in their original order
  <artist>-<song>-<version>.strudel     # self-contained scored arrangement when real work begins
music-audit/
  plans/next-100/                      # this plan, candidates, reserved slots, brief template
  songs/<song-id>/
    reference.json                    # identity, private path/hash, duration, release/trend evidence
    transcription.json                # notes, rhythm, chords, confidence and source timestamps
    structure.json                    # evidence-backed sections, transitions and ending
    runtime.json
    audio-metrics.json
    listening.md
    known-issues.md
  artifacts/                          # ignored reference excerpts/stems/rendered audio
```

The production catalog keeps `id`, `title`, `artist`, `codeUrl`, `bpm`, `genre`, `status`.
Allowed catalog states remain `draft`, `runtime-verified`, `listening-reviewed`, `approved`.
Resolve `codeUrl` relative to the catalog. Append only actual arrangements; empty planning slots
must never enter the playable catalog. Real original-album metadata belongs in the music sidecar
until OpenCode agrees to extend its consumer contract; collections are not fabricated album metadata.

Codex edits only `tracks/covers/**` and `music-audit/**` in its own music worktree/branch.
OpenCode owns catalog consumption, app UI/player, collection presentation and deployment.
Handoffs can contain ten reviewed songs at a time, with individual commits and accurate statuses.
Public-release clearance is tracked separately. Original commercial MP3s remain read-only/private;
no commercial masters, full lyrics or source stems are added to Git.

## 7. Forecast after the pilot

Do not promise 100 faithful arrangements in a day or extrapolate from automatic loop generation.
Measure active transcription, arranging, repair and listening-review time for the first three.
Use those observations to forecast the next ten, then revise the forecast after each batch.
Calendar completion also depends on full-reference availability and actual listening review.

## Immediate next work when composition is started

1. Apply the owner's song-vs-album and regional choices to the reserved slots.
2. Verify current growth evidence and the exact full reference for the first candidate.
3. Code and compare its principal phrase before committing to the complete arrangement.
4. Finish its natural full form and full-duration validation before calling it finished.

This change creates a plan and research backlog only. It does not add 100 fake `.strudel` files,
alter existing music, change application code or imply that new songs are already playing on the website.
