# Native Spotify desktop observations — 19 October 2026

Evidence class: **N19**, visible Windows application screenshots and accessibility observations through the computer-use skill. This supplements the earlier M16 browser measurements and P19 anonymous resource inspection. It is not a fresh web-player or mobile capture.

## Capture conditions

- Installed package: `SpotifyAB.SpotifyMusic_1.305.3058.0_x64__zpdnekdrzrea0`.
- Window label: `Spotify Free`; already signed in when opened. No authentication was performed.
- Returned screenshot frame: **1536 × 816 image pixels**, including the desktop client's own window controls. CSS viewport, zoom and DPR were not available through this native observation path.
- Initial selected item: a finite music track, paused at 0:00 with 2:06 total duration. Public report calls it **Track A**; personal recommendations/account identity are omitted.
- Initial library: empty-library prompts. Initial right panel: Now Playing.
- Browser Use continued to report `Local browser use is disabled in Work settings`, including after a session reset. Native app inspection was the available path.
- Original screenshot payloads and account/recommendation contents are not published. The facts below are manually transcribed observations, not retained raw AX trees or screenshot-difference results.

## N01 — populated desktop player and shell

The loaded client exposed global Home and Search, utility actions, a library region, independently bounded main region, right contextual panel and persistent transport. Two resize sliders exposed values **352** and **350**. The displayed values are recorded without asserting their units or the allowed range.

The selected-track transport showed artwork/title/creator at left; Shuffle, Previous, Play/Pause, Next and Repeat centrally; elapsed time/progress/total below; and Lyrics, Queue, device selection, Mute, volume, Miniplayer and Fullscreen at right. The volume slider reported `1`, and the progress slider initially reported `0`.

Approximate **image-space** anchors, manually read from the returned frame:

| Region | Approximate image rectangle `[x,y,w,h]` | Precision |
| --- | --- | --- |
| Header/window-control band | `[0,0,1536,64]` | Visual edge estimate, about ±2px |
| Library panel | `[8,64,352,664]` | Visual edge estimate, about ±2px |
| Main panel | `[368,64,798,664]` | Visual edge estimate, about ±2px |
| Right panel | `[1174,64,354,664]` | Visual edge estimate, about ±2px |
| Transport band | `[8,736,1520,72]` | Visual edge estimate, about ±2px |

These are not `getBoundingClientRect()` values. Do not combine them with M16 CSS coordinates or publish a zero-pixel claim from them.

## N02 — Now Playing and empty queue

Initial Now Playing included current-track artwork/identity, a share-link action, a save action, a lyrics-preview card, artist information, credits and a queue-empty prompt lower in the panel. Only the presence/hierarchy is recorded; no lyric lines, artist biography or listener statistics are copied.

Clicking the transport Queue control changed the visible right panel to:

1. **Queue** and **Recently played** tabs at the top; Queue selected with a green underline.
2. A close control at the top-right.
3. A **Now playing** heading.
4. One current-track row, with small square artwork, title and secondary creator line.
5. Empty space below; there were no upcoming entries in this initial queue.

The current title appeared green even while paused. Therefore green/current identity alone is not proof that audio is playing. Hovering the row exposed a play affordance over artwork and a trailing More action.

The screenshot changed before the native accessibility tree fully reflected the new panel. A subsequent tree could still include the previous Now Playing subtree. For native research, verify screenshots and named transport state independently; do not treat a stale AX subtree as a new visible panel capture.

## N03 — Play and Pause

Clicking the selected track's Play control changed the visible central icon to Pause. A later screenshot showed elapsed **0:15** and an advanced progress line. The named transport button subsequently reported Pause.

Clicking Pause and refreshing showed the Play icon/label again, with elapsed **0:34** retained. The progress accessibility value was **35000** while the rounded displayed time was 0:34; the report preserves both observations without claiming they were sampled atomically. Total remained 2:06. Playback was left paused.

This confirms a visible selected-track Play/Pause transition and progressing timeline in this desktop session. It is not an audio capture, listening-quality assessment, seek test, finite-completion test or queue-advance result.

## N04 — current-track context menu

The hovered current-track queue row's More action opened a right-anchored menu. Visible items, in order:

- Add to playlist, with submenu arrow.
- Add to Liked Songs.
- Add to queue.
- Exclude from your taste profile.
- Sleep timer, with submenu arrow.
- Go to song radio.
- Go to artist.
- Go to album.
- View credits.
- Share, with submenu arrow.

A separator divided the timer group from entity navigation. The menu occupied approximately `[1254,235,249,408]` in the 1536 × 816 returned image, with approximately 40px row pitch. These are visual image estimates, not computed CSS measurements. Exact menu typography, submenu positioning and menu AX semantics remain unmeasured.

Escape dismissed the menu while preserving the paused track and queue panel. No save, follow, taste-profile, sleep-timer or share action was invoked.

## N05 — library creation and details

The owner explicitly authorized a temporary playlist named **Strudelify UI research**, adding/reordering tracks, deleting that playlist and removing only research-created queue entries.

Library Create opened a large three-choice menu: Playlist, Blend and Folder. Playlist immediately created **My Playlist #1**, selected its main view and added it to the library. No initial naming dialog preceded creation in this client/session.

The empty playlist displayed a Public Playlist label, default artwork, owner line, invite/more actions, Add and Name & details buttons, and a playlist-local search. Clicking Name & details opened Edit details with:

- A name input and optional multiline description.
- An optional artwork area with its own options.
- A Make private control, a close control and Save.

No photo was uploaded and no privacy setting was changed. Saving the approved name updated the sidebar first and the main heading after a later refresh. This asynchronous update must not be interpreted as a second playlist.

Image estimates: Create menu approximately `[245,123,368,209]`; Edit details approximately `[506,216,524,384]`; artwork field approximately 180 × 180; name/description fields about 280px wide. These are image-space estimates with roughly ±3px precision, not CSS measurements.

## N06 — local search, additions and duplicate occurrence

Searching inside the empty playlist displayed an artist result followed by track rows with artwork, title/artist, album and an outlined Add action. The observed search box was about 398 × 40 image pixels. Result rows had an approximately 56px pitch. The main area became scrollable, and an upper compact playlist header plus column labels remained visible in the scrolled state.

The immediate view temporarily displayed a no-results message before results appeared. AX text lagged that visible transition. Therefore this does not establish a genuine no-match result or any exact search latency.

The final observed playlist contained three occurrences: **B, C, C** (two different public tracks, with C duplicated). No duplicate-warning dialog appeared in this add-results path. One attempted action used a result position that moved during asynchronous list reflow; therefore this pass does not claim three distinct intended tracks were added. Subsequent operations used the settled playlist table as the source of truth.

Right-clicking the final C occurrence exposed **Remove from this playlist**. Invoking it left **B, C**, with the retained C still present and the count reduced from 3 to 2. The total-duration label settled on a later update. This confirms occurrence-specific removal in this path, not a universal duplicate policy for every add entry point.

Two supported native drag gestures were attempted: moving the last occurrence before the first, and moving the unique first row after the final row from a non-link column. The rows became selected, but no changed order was verified. **Reorder remains unverified**; this is a capture/tool limitation, not a proven Spotify defect.

## N07 — manual queue additions and one-entry removal

Adding B and then C through playlist-row context menus produced a distinct **Next in queue** group under the unchanged **Now playing** item. The two added rows appeared in B, C order. Current Track A remained paused at 0:34 throughout those queue mutations.

Right-clicking C in the queue exposed **Remove from queue**, alongside Add to queue and the other track actions. Removing C left B in the upcoming group. The source playlist remained B, C. This separates queue operations from playlist edits.

A right-edge context menu's Add to playlist submenu opened to its **left**, containing a playlist-search field, New playlist and the temporary playlist. This provides a concrete collision-handling specimen; no submenu timing threshold was measured.

One native queue drag gesture was attempted. No order change was verified; queue reorder remains open.

## N08 — clear confirmation and cleanup status

Clicking Clear queue opened a centered light confirmation dialog with title **Clear this from your queue?**, a no-undo notice, Cancel and a red Yes action. Approximate image rectangle: `[558,303,420,200]` during the observed transition. No general rule for all Spotify destructive dialogs is inferred from one specimen.

The confirmation was submitted. An immediate follow-up still showed the research entry, but a later screenshot showed only Now playing, with Next in queue and Clear queue absent. The upcoming research entries were therefore visibly cleared. No exact completion latency is claimed. An unrelated native window briefly interrupted observation; no controls in that window were operated.

## N09 — resumed context and completed cleanup

The owner stopped Computer Use with Escape, then explicitly asked to continue. On reacquiring Spotify, playback was already running from the temporary playlist. No Play command was issued in this resumed pass. The right panel displayed **Next from: Strudelify UI research**, with the remaining context track underneath. This is a distinct visible group from the earlier manual **Next in queue** group.

Successive frames showed B playing late in its duration, followed by C near its beginning without an agent Next action. This is consistent with automatic collection progression, but it is not a controlled completion/precedence test.

The owned playlist's menu exposed Add to queue, Remove from profile, Edit details, Delete, a disabled Download, Make private, Invite collaborators, Exclude from your taste profile, Move to folder, Add to other playlist and Share. Delete opened **Delete from Your Library?**, naming the exact temporary playlist, with Cancel and a red Delete button. The deletion was authorized by the owner's earlier explicit cleanup approval.

After using the visible stable Delete button, the main route returned to Home, the temporary playlist vanished from the library, and the empty-library creation prompts reappeared. Playback continued. **Cleanup is complete:** temporary playlist removed and research manual queue entries cleared. Current playback/context was not manually stopped or cleared during this resumed pass.

Native AX text still reported the deleted playlist/dialog after the screenshot had visibly returned Home. This is evidence of capture lag; it must not be used to claim the playlist still exists. The final cleanup finding is based on the visible library and Home state.

## Capture interruptions and remaining scope

An earlier search-focus action encountered a Windows low-battery dialog outside the targetable Spotify window. The helper refused to click the wrong process; work resumed after that dialog cleared. Native AX bounds also lagged a scroll and an out-of-window click was refused; fresh screenshot positions were used afterward.

Persistent shuffle/repeat, seek, volume, library resize and real mobile behavior remain unobserved in this pass. Native screenshots/AX are not an atomic DOM capture. Original music files, the Strudelify app, and existing saved Spotify collections are outside these research mutations.

Some frames contained floating lyric/border effects whose origin was not established through Spotify's accessibility structure. Those effects are excluded from the reference design; their appearance alone does not establish a Spotify feature.
