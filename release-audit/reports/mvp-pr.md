## Review candidate for issue #5

This PR prepares an incremental MVP review build. **Do not merge or deploy automatically.**
The public main baseline remains `0b6e42ce2fc1f236df8f673470724a564a1d1c5f`.

### Changes

- Real Pause/Resume preserves audio position; Stop remains a hard reset. Fixed first-gesture
  initialization and a reproduced stale-resume/new-selection race.
- Accessible mobile Stop/Next/Previous, source-error retry, complete actual View code and
  explicit GitHub listener-feedback drafts/form.
- Original-only public catalog and allowlisted preview artifact; native synths only.
  Eight commercial-song studies remain preserved for private review. Automatic commercial
  lyric files are removed from this branch tip after exact private preservation.
- Strudel source/license/copyright links, provenance ledger and decisions for all 40 supplied
  kit resources. No backend, framework, UI-system or production dependency migration.
- Locked Playwright tooling and a PR-check workflow that does not deploy.
- Private title-blind A/B fixtures, honest recognition status and the preserved 100-slot plan
  with ten researched candidates and three deferred research pilots.

### Evidence

Exact tested source: `84cb9525db54b583926e3d00a305ca2d3f6a8523`. See
`release-audit/reports/final-result.json` and `FINAL_RESULT.md` for source/resource hashes.
Final report-only commits retain the same runtime payload.

- 18 actual player/UI/audio checks per browser in Chromium and Firefox, including 1280px
  desktop and fresh 390px mobile controls.
- Existing public baseline rechecked: 17 browser checks passed and all 28 deployed text
  resources match the expected main build.
- All 16 source-recording copies unchanged. Existing scores and art preserved; lyric drafts
  preserved privately and in prior music/Git history.
- Actual desktop/mobile screenshots: `release-audit/evidence/`.

### Still open

No commercial-song study is approved. The owner has now reviewed eight excerpts: four title
selections with continued negative quality comments, and four “Unsure / none” responses.
Only Everyday Normal Guy 2's 12.05–27.05s passage received a positive passage-specific comment;
its full arrangement is not approved. Reference-reveal state is unknown, so no controlled
blind-test result or fidelity score is claimed. Five to ten independent real listener sessions remain pending.

One separate private Babydoll lead-phrasing trial uses the measured F0/envelope curves within
corroborated note regions. It has a real 101.12-second capture, -18.7 LUFS, -1.6 dBTP and no
clipped/nonfinite samples. It remains unreviewed and unadopted. The experiment score and all
audio/control-frame material stay ignored/private; only the method and audit evidence are in this PR.

Integrated-app license/naming and commercial composition/lyric permission decisions remain
open. The current public site still serves the older studies/lyrics until a reviewed replacement
is approved; this branch cannot remove already published history by itself.

Local owner preview: http://127.0.0.1:4189/
Private listening page: http://127.0.0.1:4188/ (commercial reference audio stays local).
Labeled Babydoll old/new/reference comparison: http://127.0.0.1:4188/babydoll.html.
These are loopback review URLs, not public deployments.

The 100-song composition loop remains stopped. Read `release-audit/RELEASE_CANDIDATE.md`,
`MUSIC_RECOGNITION.md`, `RESOURCE_DECISIONS.md` and `THIRD_PARTY_ASSETS.md` before release approval.

Linux CI run 39120991230 passed all 18 checks in Chromium and Firefox on the corrected transport. See reports/ci-verified.json.
