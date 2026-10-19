# License and source decision for the instrumental beta

Decision recorded: 18 October 2026. The owner delegated release of the technical beta in
the project chat; the exact clean commit is recorded at publication.

The integrated application is to be distributed under **AGPL-3.0-or-later**.
The project-authored MIT grant in `LICENSE` is retained for those portions;
it does not replace the terms of the combined application. `COPYING` and
`licenses/Strudel-AGPL-3.0.txt` contain the complete AGPL text.

This follows Strudel's [integration guidance](https://strudel.cc/technical-manual/project-start/)
and [FAQ](https://strudel.cc/learn/faq/), checked on 18 October 2026.
This is a documented engineering release policy, not a claim of independent legal review.

## Corresponding source

Every built artifact includes an unminified application source archive, `source.zip`,
and a generated `SOURCE.html` linking that archive, the exact application commit,
the runtime package, and its exact upstream source revision. The footer links to it.
The archive contains the complete site source, original scores, notices and build scripts.
No binary application compilation is performed. Build instructions are included.

The unmodified external dependency is `@strudel/web@1.2.6` (AGPL-3.0-or-later).
Its upstream annotated tag resolves to commit
`cbe7aaacfbf8a51f5f5cf39bf79319f273214e24`, verified with `git ls-remote`.
The browser loads the pinned package from unpkg; its source is available from
[the exact upstream revision](https://codeberg.org/uzu/strudel/src/commit/cbe7aaacfbf8a51f5f5cf39bf79319f273214e24).
The project makes no runtime modifications. Preserve upstream copyright notices.

## Track provenance and publication boundary

The six originals were created as original examples for this project and distributed
with the repository's MIT declaration before this recovery. Their note patterns and
instruments remain the same; this branch adds finite form and measured level balance.
There is no imported melody, artist recording, external sample bank or commercial lyric
in this six-track artifact. This is the project's provenance declaration; owner confirmation
is required in the release approval record.

On 19 October the owner explicitly requested restoring the eight existing synthesized
cover studies. The expanded catalog records them as `owner-requested-study`, with
underlying composition rights reserved and musical review unapproved. This is not a
claim of rights-holder clearance or a project-original grant. See [COVER_STUDIES.md](COVER_STUDIES.md).
Original commercial recordings, stems, artist artwork and all lyrics remain excluded.

## Branding decision

Strudel's maintainers ask independent projects to avoid "strudel" in their names.
The public UI now uses Hustlenix Music. The existing repository URL and browser storage keys
are retained for continuity. The maintainer naming request is met by this public branding;
no upstream endorsement or permission is claimed. This implementation choice follows the
owner instruction to complete the remaining release work.

## Publication decision

The release record confirms this license/source policy, project-original track provenance,
branding and the selected track IDs and exact score hashes. The owner selected a delegated
technical beta without completing the review form. Complete human listening acceptance
and a physical phone result remain unverified; neither is represented as a pass.
Full audio captures, real browser checks and the recorded laptop main flow support the
technical release. A future human-reviewed release can record actual listening/device results.
