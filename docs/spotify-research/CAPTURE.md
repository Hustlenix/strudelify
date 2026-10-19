# Capture notes, reproducibility and open questions

## What happened in this pass

1. Verified repository identity, clean status and worktree ownership before editing.
2. Created `codex/spotify-research` in `C:\Users\LalithReddy.b\strudelify-research` from `origin/main` at `7c6ac654ba2bad98a8c42cd8a1c65d346b660582`.
3. Preserved the earlier rendered audit. Its measurements retain their original date and qualifications.
4. Read the user-supplied REA repository/browser-analysis documentation and primary Spotify support/engineering sources.
5. Browser Use reported `Local browser use is disabled in Work settings`. The owner selected “Continue with the available evidence.” Native window inspection did not provide a stable Spotify view; no reference UI actions or new visual facts are attributed to it.
6. Captured four anonymous public responses (desktop/mobile User-Agent × Home/Search), the two linked CSS build families and three selected desktop JavaScript artifacts. The retained reports contain facts/hashes, not resource bodies.
7. Read Strudelify source to map actual feature gaps and preservation requirements. No application/music files were edited or runtime tests run.

## Reproduce the source inspection

Requirements: Python standard library, network access and the local RTK wrapper. The scripts use ordinary HTTP GETs with no browser profile, cookies or account credentials. They do not execute downloaded JavaScript.

```powershell
rtk proxy python -X utf8 C:\Users\LalithReddy.b\strudelify-research\docs\spotify-research\scripts\capture_public_surface.py
rtk proxy python -X utf8 C:\Users\LalithReddy.b\strudelify-research\docs\spotify-research\scripts\inspect_public_bundles.py
```

Each command refreshes its named JSON report in `docs/spotify-research/evidence/`. Keep the committed report for comparison before refreshing. Asset URLs and content hashes can change without a product redesign. CDN compression can change transfer sizes; the retained SHA-256 is over decoded resource bytes.

The CSS scanner intentionally extracts only selected declarations and leaf-rule facts. It does not evaluate selector matching, nesting/media conditions, specificity, inheritance, JavaScript-assigned variables or active experiments. Token alternatives are **not** a palette to apply together. Media-condition inventories are **not** an effective app breakpoint map.

Framework marker absence does not prove dependency absence. Marker presence may be compatibility or unused code. The `react-dom` renderer declaration is more specific evidence than an arbitrary version-looking literal. SVG numeric paths and unrelated version strings are deliberately excluded from version attribution.

## REA workflow for a future permitted rendered capture

REA was reviewed, not run. Its [pinned browser guide](https://github.com/morluto/rea/blob/9aca543f46085f502dbc5445002e129e5d2974e9/docs/browser-observation.md) documents these distinct operations:

| Operation | Useful evidence | Caveat |
| --- | --- | --- |
| `list-browser-targets` | Eligible target identity in an explicitly scoped endpoint | A target name does not authorize unrelated account access |
| `inspect-web-page` | DOM/accessibility/resource metadata | Attach-window completeness, not all prior traffic |
| `analyze-web-bundle` | Static module/route candidates | Candidate strings do not prove exercised behavior |
| `observe-web-session` | Ordered events around an external action | Observe the action; do not infer it from a later state |
| `capture-web-screenshot` | Viewport image with provenance | Match viewport, DPR, zoom, font and state before comparison |
| `compare-web-screenshots` | Pixel differences between captured states | Content/font differences need explanation; missing evidence is not equivalence |

A tool installation cannot recover private backend code or turn an unobserved feature into a confirmed result. No existing user browser is attached or reconfigured by this package.

## Capture queue

| Priority | Exact scenario | Missing evidence to record |
| --- | --- | --- |
| 1 | Start a track; toggle pause/resume; navigate to another collection | Active transport/row/card rectangles and state transitions; confirm navigation does not replace audio |
| 1 | Enqueue B twice, enqueue C, reorder/remove one B | Queue groups, entry identity behavior, clear semantics, Next precedence |
| 1 | Shuffle on/off while playing; Next/Previous; natural ending with each repeat mode | Current-item preservation, history/restart rule and mode state; do not guess thresholds |
| 1 | Create a playlist, add/reorder/remove, rename, cancel edits | Dialog dimensions, keyboard behavior, duplicate handling, save/cancel/undo flow |
| 2 | Resize/collapse a populated library, reload | Bounds, icon/list density, persisted width and scroll position |
| 2 | Type/search/clear with arrows/Enter/Escape and no-match query | Popup interior, row geometry, selected option, timing and empty/error states |
| 2 | Long playlist: scroll, select rows, open near-edge submenus | Sticky headers, selection/play distinction, collision handling and table columns |
| 2 | Home at matching 1280/1440 states | Header placement switch, card hover surface, exact carousel movement |
| 2 | Real mobile web vs native app at a known device size | Distinct shells, mini/expanded player, queue/menu sheets, safe-area and keyboard behavior |
| 3 | Open settings/device picker/lyrics with available and unavailable data | Real capabilities, dependencies, permissions and no-content states |

Record route, date, platform, account tier/state, viewport, DPR, zoom, sidebar/right-panel state, scroll offsets and trigger/result for each capture. Keep account identifiers, personal library content and authentication material out of public evidence.

## Completion boundary

Complete for this pass: evidence ledger, current public static captures, dated visual baseline, screen/behavior reference, feature inventory, actual Strudelify gap audit and an independent architecture mapping. Open: the rendered scenarios above, a finished upgraded implementation and any proof of exact visual equivalence. No implementation or music quality approval is asserted.
