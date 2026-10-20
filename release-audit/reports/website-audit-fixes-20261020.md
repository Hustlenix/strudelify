# Strudelify audit fixes

Date: 20 October 2026  
Original review: `3e5f16c0fdf0be4500b52ba7a27f8d3c4f9b9acb`  
Change branch: `codex/fix-website-audit`

All nine findings in [the original audit](website-audit-20261020.md) have implementation
fixes. The existing 14 music scores and reference recordings are unchanged.

## Changes and evidence

| Finding | Change | Evidence |
| --- | --- | --- |
| 1. Navigation names | All five sidebar controls retain explicit accessible names when text is hidden. | Collapsed sidebar inspected through the local browser accessibility tree; all five names remained available. |
| 2. Lost focus | Site page refresh restores the equivalent control by stable attributes and track identity. Removing a liked row falls back to the next corresponding action or page heading. | Genre filtering, sort changes, following/unfollowing an artist, and saving/unsaving a collection all retained focus in the browser recheck. The removed-row fallback was source reviewed. |
| 3. Space shortcut | Global shortcuts ignore native and ARIA interactive controls, contenteditable regions, composition, modifiers, and already-handled events. | Space on the Explore sort control opened its native menu; changing the sort retained focus. No audio was started. |
| 4. Invisible skip link | Dedicated skip-link styles show a high-contrast, outlined control on keyboard focus. | First Tab focused the link; screenshot confirmed visibility. |
| 5. Unnamed dialogs | Playlist, track-options, delete-playlist, and clear-queue dialogs reference their visible headings. | All four associations source reviewed; the track-options dialog was announced with the selected track's title in the browser accessibility tree. |
| 6. Missing preservation resources | Application track paths use the shared source mapping; catalogs and referenced resources are required; logical `tracks/...` snapshot names remain compatible. | Read-only resource discovery found 24 application resources and 31 resources in the separate music checkout. No historic preservation report was overwritten. |
| 7. Mixed-catalog encoder | Only project-original rows are selected. All missing/linked inputs, duplicate IDs, existing targets, and report conflicts are rejected before any encoding starts. Existing reports use exclusive creation; hashes stream from files. | Isolated preflight probes selected six originals from the actual 14-row catalog metadata and rejected duplicate/missing/existing-path cases. No FFmpeg process or private audio access was used. |
| 8. Repeated Git processes | One binary-safe `git cat-file --batch` call reads all committed payload/build blobs with exact framing. Missing blobs remain changed, and CRLF comparison behavior is preserved. | Read-only probe read 55 blobs in 0.368 s, matched a sampled blob against `git show`, and recognized an absent blob. This is a Git-read measurement, not a full-build speedup claim. |
| 9. Redundant WAV processing | Intro alignment uses memory mapping where supported, preserves integer scaling, and converts/mixes only the first eight seconds. Unsupported packed formats fall back to one ordinary decode. | Isolated NumPy probes matched previous results for int16, int32, float32 and float64 arrays; mocked reader probes covered mmap fallback and malformed-WAV propagation. No real reference or rendered WAV was decoded. |

Browser recheck used `http://127.0.0.1:4194/` with isolated origin storage. The follow
and collection-save preferences exercised there were restored after checking.
Browser cache versions were advanced to `auditfix-20261020` for the deployed changes.

Local screenshot: `release-audit/artifacts/audit-fixes-20261020/skip-link.png`.

## Limits

- No full player regression suite, screen-reader session, physical-phone test, or music
  listening approval is claimed by these focused audit rechecks.
- SciPy is unavailable in the default local Python. Alignment behavior was checked
  with extracted helper logic, NumPy, and mocked readers; a complete real-WAV alignment
  job was not run. Packed 24-bit WAV fallback can still decode a full file once.
- Required deployment packaging, exact-commit approval, allowlist, source archive,
  manifest hashes, and publication integrity remain part of the release workflow.
- No musical fidelity, third-party composition rights, or device-review status was upgraded.

Publication outcome is recorded separately by the GitHub Pages workflow for the exact
committed revision. This report describes implementation and focused local evidence.
