# Controlled beta publication and rollback

Prepared 18 October 2026. The owner has delegated shipping the technical beta without the
review form; see OWNER_DELEGATION.md. Actual deployment results are recorded separately.

## Before merging

GitHub Pages currently publishes the entire `main` root using its legacy branch source.
**Do not merge this PR while that publishing source is active.** A merge could expose files
outside the allowlist even though the new workflows themselves are manual.

After explicit owner release approval, change the Pages publishing source to **GitHub Actions**
in Settings → Pages before merging. Record the previous configuration and verify `build_type`
is `workflow`. Then merge the reviewed PR. Neither this preparation nor pushing the review branch
changes the live Pages setting. No destructive history rewrite is part of this release.

## Release decision

Two explicit policies are supported. `human-reviewed` requires the actual complete listening
decisions and physical device results below. `owner-delegated-beta` records the owner's direct
instruction to ship without the form, matching full technical captures, exact score hashes,
the completed laptop main flow and fresh browser checks. It must record listening and physical
phone checks as unperformed; it cannot manufacture a pass. Owner identity, clean revision,
license, branding, provenance and the public allowlist are enforced for both policies.

The current owner selected the delegated technical beta in the project chat. The review form
is optional feedback, not a remaining launch requirement. No repeated owner confirmation is needed.

### Optional human-reviewed route

Use `approval-template.json` to record actual owner decisions. Every included score needs its
exact SHA-256, complete listening confirmation and acceptance for beta. A deliberately smaller
catalog is supported by the builder, but its IDs and source hashes must still match the review.
Record a real phone and laptop smoke test, provenance/license confirmation and public naming
decision. Unanswered fields remain null/false; test fixtures are never approvals.

Five to ten independent listeners are a post-launch beta feedback goal under the latest work
report. They are not a requirement enforced by this initial owner approval gate. No audience
reviews have been invented or people contacted.

Physical device checklist: first gesture Play; Pause/Resume; Stop; Next/Previous; search;
View Code; portrait/touch controls; volume; browser background and return; connectivity loss
while requesting an uncached score, then restored connectivity and Retry. Include model/browser,
date, observed result and any problem. Desktop viewport emulation is not a physical phone test.

The original-only HTTPS review has a deliberate **Send review to this project** button.
Submitted declarations are saved in the ignored `release-audit/private/received-original-reviews/`
folder. Select the expected receipt from the authorized owner review; do not accept an ambiguous
sender as the owner or count synthetic schema fixtures as listeners. Use `assess_listener_review.py`
with the selected receipt and exact review/release artifacts to list any incomplete music or
phone checks. It verifies source hashes and never grants publication approval itself. The
physical laptop main-flow observations are already recorded in `reports/physical-laptop-smoke.json`.

## Publish exact approved bytes

After approval and merge, dispatch **Approved Pages beta release** from `main` with:

- the exact 40-character reviewed commit, already an ancestor of main;
- the actual approval record as JSON (no credentials or personal details).

The workflow checks out that revision, builds a fresh artifact, validates its exact file set,
hashes and nested source archive, checks approval, then reruns both real WebAudio browser suites.
Only `release-preview/` is uploaded to Pages. Deployment has Pages/id-token permissions in its
own job. It never uploads the repository root. An `approved-site` artifact is retained for 90 days.
Configure a required reviewer for the `github-pages` environment if available for the account.

After deployment it compares all 26 allowlisted resource hashes and release.json, requests
19 known withheld URLs expecting 404, and runs all 18 browser checks against the public URL.
Those URL checks cover enumerated prior files; they do not establish erasure from Git history,
other hosts, browser caches or third-party archives. Inspect the resulting evidence before calling
the release live and verified.

## Roll back

Dispatch **Approved Pages rollback** from main with a previous successful approved release run
ID and renewed owner approval for that exact artifact. It verifies the run belongs to this repo,
is the manual release workflow, and succeeded. It downloads the immutable `approved-site`
artifact, checks its allowlist, hashes and approval, redeploys it, then verifies public hashes,
withheld paths and the actual player again. It does not rebuild old code or restore the unsafe
legacy repository-root payload.

Before the first successful approved release there is no prior clean production release to
roll back to. The first reviewed artifact is retained locally and in the release workflow; if
the first launch fails, keep the failure evidence, correct the cause and rerun approved publication.
After 90 days an expired artifact needs a separately reviewed, reconstructed release; do not
silently substitute different bytes or force-push Git history.

## Local verification commands

From the isolated checkout, with RTK on this Windows host:

```
rtk proxy python release-audit/build_preview.py --output release-preview/a-fresh-directory
rtk proxy python release-audit/test_release_policy.py release-preview/a-fresh-directory
rtk proxy node release-audit/player-checks.mjs release-preview/a-fresh-directory chromium
rtk proxy node release-audit/player-checks.mjs release-preview/a-fresh-directory firefox
```

The Linux workflows use the standard commands without RTK. All production dependencies remain
pinned as before; Playwright and actionlint are development verification tools only.
