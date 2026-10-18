## Original-instrumental beta candidate for issue #5

Finite originals now start reliably after switching and stop at intentional endings. This PR prepares a restricted public artifact and explicit owner-approved publication. **Keep draft; do not merge or deploy automatically.**

### Changes

- Native Pause/Resume, hard Stop, cancellation/race fixes and mobile transport remain. New reproduced fix: Stop resets the active REPL clock; a finite score no longer inherits the preceding song cycle and misses its opening.
- Six original note patterns and sounds retained with finite sections, fading outros and measured constant level balance. Earlier versions preserved in Git and the separate music worktree.
- Original-only exact artifact allowlist, nested source archive inspection, SHA-256 manifest and complete source download with exact upstream runtime revision. Combined release licensing policy documented; prior MIT grants retained.
- Manual Pages publication and rollback workflows, actual-approval guard, 90-day immutable artifact retention, and post-deploy file/exclusion/player verification. Switch Pages from legacy root publishing to Actions after approval and before merging.
- Named complete-track local review with manual JSON export; contextual GitHub bug reports remain.

### Verification

Tested source: 56a2f46ab434c6586d20a2b293661a2e86f4a2db. See release-audit/reports/launch-continuation.json.

- Chromium and Firefox: 18 real WebAudio/player checks each passed locally.
- Six complete before/after captures: no clipping/nonfinite samples; final output -24.5 to -22.6 LUFS; all finite endings stop.
- 12 policy tests passed; three workflows passed actionlint 1.7.12. No cloud deployment or rollback rehearsal is claimed.
- Local file-serving rehearsal: 26 exact resources plus release.json and 19 withheld paths checked (45 recorded resource checks).
- 16 original recording copies unchanged; prior music/art/lyric resources preserved. No recordings, private comparisons, models or commercial lyric files in the artifact.

### Pending owner gates

Full listening acceptance of the included originals; physical phone/laptop smoke tests; public name choice or upstream naming permission; license/provenance confirmation; exact release approval. All six originals remain drafts. No commercial study is approved. Five to ten independent sessions are a post-launch feedback goal under the latest report.

The currently public site remains the older release. This PR preparation does not remove earlier Git history or external caches.

Owner review: http://127.0.0.1:4190/ ; actual candidate: http://127.0.0.1:4190/player/ .
These are local URLs. Read release-audit/CURRENT_STATUS.md, release-audit/DEPLOYMENT.md and LICENSING.md.
The 100-song composition loop and full-stack migration remain deferred.
