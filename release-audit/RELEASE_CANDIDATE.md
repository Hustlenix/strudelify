# MVP recovery review candidate

Branch: `codex/mvp-recovery`, isolated checkout `C:\Users\LalithReddy.b\strudelify-catalog`.
One Codex implementation agent. No OpenCode checkout edits, no music expansion, no automatic merge
or deployment. Source commit and exact preview file hashes are recorded in `reports/preview-build.json`.
The build must be regenerated from the committed implementation before final review.

## Reconciled public baseline

- PR #3 is merged. PR #4 was already merged at main
  `0b6e42ce2fc1f236df8f673470724a564a1d1c5f`, 18 October 2026.
- Pages run `39116032718` succeeded. Fresh checks confirm all 28 public HTML/script/style/catalog/
  score/lyric/art resources match that main baseline after LF normalization.
- The existing [public site](https://hustlenix.github.io/strudelify/) passed the preserved 17-case
  real browser regression suite again. This does not make the songs musically approved.
- The supplied issue/spec snapshot describing PR #4 as draft and main as `fb68de7` is outdated.
  The current baseline is preserved; no second blind merge was attempted.
- The currently public site still contains the older studies and lyric drafts. A local candidate
  cannot retract those deployed bytes or Git history. Publication clearance remains unresolved.

## Proposed candidate changes

1. Native Play/Pause/Resume preserves the audio clock and session. Stop remains a hard reset.
   A reproduced first-Pause failure led to explicit first-gesture/worklet initialization before
   playback. Existing cancellation, serialized evaluations and cross-tab ownership are retained.
2. Mobile Stop, Next and Previous controls are now usable with 40–44px control areas. Complete
   actual View code remains available. Source-loading failure exposes retry and clears its cache.
3. Six existing project-original synth patterns are included in `tracks/catalog.json` as drafts.
   The six score files themselves are unchanged. Rights and human review are separate fields.
4. The public artifact is explicitly allowlisted. Eight commercial-song study scores, lyric
   transcripts, reference audio, stems, models, private comparisons and audit folders are excluded.
   All study sources and strongest previous versions remain in the preserved music worktree/history.
5. Explicit listener feedback links open a GitHub issue draft with track, position, browser,
   viewport and build context. Submission requires the visitor's GitHub sign-in and action;
   nothing is sent automatically. A reusable issue form is included. No analytics added.
6. Source/attribution links, the upstream Strudel AGPL text, asset ledger, all 40 resource decisions,
   locked dev browser tooling and a non-deploying PR-check workflow are included.

## Technical evidence

`reports/player-chromium.json` and `reports/player-firefox.json` record actual runtime and
WebAudio output under normal autoplay policy. Each run records browser version and artifact
hashes. Tests cover catalog, navigation, exact code, trusted-click audio, pause/resume,
delayed-load cancellation, injected source failure/retry, rapid switching, Next/Previous,
all six original audio outputs and quiet Stop, syntax recovery, finite-ending fixture,
editor cleanup, search, feedback URL, fresh 390px mobile controls and cooperating-tab ownership.

Desktop 1280×900 and mobile 390×844 screenshots are local `artifacts/` files. Screenshot
inspection and browser click checks are separate evidence. Headless desktop viewport testing
does not establish real iOS/Android hardware success or five to ten actual listener sessions.

The Stop probe excludes OfflineAudioContext reverb impulse generation and allows queued
pre-suspension probe buffers to drain before measuring silence. This avoids confusing offline
impulse construction or stale observer callbacks with ongoing hardware output.

## Musical gate and feedback

See [MUSIC_RECOGNITION.md](MUSIC_RECOGNITION.md) and `reports/music-review.json` for all eight.
Babydoll has earlier partial-recognition feedback only; its current intonation revision needs
fresh listening. Without Me and Can't Tell Me Nothing still have unresolved signature motifs.
No automatic fidelity score, listening approval, verse boundary or audience response is invented.

Eight local 15-second A/B pairs and a title-blind feedback page are ready in ignored
`private/listening/`. All source MP3 copies and preserved score/art/lyric files are hash-checked.
There is no evidence yet of five to ten independent real listeners. Their responses are an
outstanding release gate, not an automated task marked complete.

## Publication decisions

- Resolve Strudel's AGPL integrated-application/source-sharing obligations and maintainer naming
  request. Source, attribution and license text are present; existing MIT source notice is preserved.
  No name or whole-project license change has been silently made.
- Record appropriate permission before publishing commercial arrangements or lyrics. An open
  source code license and chart popularity do not establish music publication permission.
- Approve the original-only artifact and a deployment mechanism that publishes its allowlist,
  rather than the repository root. No automatic deployment is proposed by the check workflow.

## Next three pilots and production scope

`planning/backlog.json` preserves 100 unfilled slots and the confirmed 60/20/10/10 allocation.
`planning/research-batch-01.json` records ten candidates. Patient Zero, Solar Eclipse and Nicole
Kidman have current primary chart/recording evidence in [planning/README.md](planning/README.md).
They are research pilots only. Displayed recording-edition dates are distinguished from an
authenticated earliest release date; missing data stays null.

The MVP's music, publication and real-listener gates precede producing these pilots one by one.
No 100-song generation loop has started. Public catalog entries can be added through metadata
and score files; future licensed sampled instruments need their own provenance and release gate.

## Review workflow

Install locked audit tooling with `npm ci` inside `release-audit/`. Run `build_preview.py` into a
new preview directory, then `player-checks.mjs <preview-directory> chromium` and `firefox`.
Serve only the selected preview directory on loopback for owner review. Never serve the
repository root as the proposed public release. Preserve failed attempts instead of destructive
cleanup. After review, the owner can approve a concrete merge/deployment; this candidate stops
at that gate.
