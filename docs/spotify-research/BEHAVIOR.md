# Screen and behavior reference

Evidence IDs resolve in [SOURCES.md](SOURCES.md). **I** paragraphs are Strudelify decisions, not assertions about Spotify internals. Existing rendered dimensions remain in [design.md](../../design.md). This document extends behavior coverage without claiming fresh rendered observations.

**Native follow-up:** [N19](NATIVE-DESKTOP.md) subsequently supplied fresh Windows desktop observations for selected-track playback, queue groups and mutations, playlist creation/details, duplicate removal and deletion. Those specific observations supplement the documented contracts below; they do not establish fresh web/mobile measurements or verify the proposed queue resolver. Playlist creation in this client immediately persisted a default-named playlist before the separate details editor.

## 1. Information architecture

```text
Persistent application shell
├── Global navigation: identity / Home / Search / utility actions
├── Library: saved entities / creation / filters / sorting / display modes
├── Main route
│   ├── Home: reusable shelves and recent items
│   ├── Search: browse → suggestions → mixed results → typed results
│   ├── Collection: album / playlist / liked tracks / folder
│   ├── Artist: identity / popular tracks / releases / related collections
│   ├── Track: identity / actions / contextual information
│   └── Profile / settings / local creation surfaces
├── Optional right panel: Now Playing / Queue / contextual track information
└── Persistent transport: current item / playback / timeline / utilities
```

**M16:** Desktop shell regions, independently scrolling main/library, detail hierarchy and menus were observed in the earlier audit. **D9:** Mobile uses a mini player above navigation that expands when tapped. **U:** Exact current mobile dimensions and transitions were not captured. The mobile web build and native mobile app must not be silently treated as the same client.

**I:** Keep `#home`, `#search`, `#library` and `#track/:id` compatible. Add `#playlist/:id`, `#album/:id`, `#artist/:id`, `#liked`, `#folder/:id`, `#recents`, `#settings` and an explicit creator route as actual entities/features arrive. Keep playback independent of the visible route. Do not invent empty album/artist pages merely to fill navigation.

## 2. Global navigation and history

**M16:** The global header spans the page above the library/main panels. Search has a pill input, leading icon, clear action and trailing browse affordance. Focus changes its surface and border treatment. Browser history is ordinary navigable state.

**I contract:**

- Home changes route without replacing the audio session.
- Search query, content filter and collection ID belong in navigable route state; back restores them and the associated scroll position.
- Opening details is different from starting playback. Cards must expose distinct navigation and play targets.
- Back/forward uses actual history; disable a custom control only when the app can determine it has no applicable entry. Never pretend the full browser history is visible.
- Closing a menu, panel or dialog returns keyboard focus to its trigger. Escape unwinds the topmost transient surface first.
- Global shortcuts must not fire while typing in the code editor or another input. Use browser-safe chords and discoverable labels; do not intercept a native browser reload/new-window shortcut to mimic the desktop client. [D13](https://support.spotify.com/vn-en/article/keyboard-shortcuts/)

## 3. Home and discovery

**M16:** Shelves have a heading, a separate Show all action, compact artwork cards, hover play affordances and clipped horizontal continuation. Card navigation and playback have different intent. Home content is personalized and experiment-dependent; its exact recommendation order is not a fixed design.

**I:** Build shelves from typed catalog entities and known listening history. At six tracks, render honest editorial groups and recents. Do not label deterministic lists “personalized AI recommendations.” Empty recents should explain how to populate them. Keep placeholders for loading separate from truly empty data and load failure.

### Card state inventory

| State | Required behavior for our implementation |
| --- | --- |
| Rest | Artwork, title and secondary metadata; navigate target is available |
| Hover | Surface highlight and play reveal; independent button hit area |
| Keyboard focus | Equivalent visible actions; a focus ring, not hover-only discovery |
| Current + playing | Pause-capable playback affordance and current indication |
| Current + paused | Resume action; no running equalizer |
| Loading current | Named loading/cancel state; stale completion cannot affect a new item |
| Unavailable | Clear reason and retry when meaningful; do not mark as playing |

The exact current Spotify opacity curves and current-track card toggle rules remain **U**. The 8px play reveal displacement is **M16**, not a fresh animation measurement.

## 4. Search

**D6/D7:** Search spans content types and supports field-style narrowing; suggestions can use recognized content, prior searches and popular queries. Those descriptions do not reveal the ranking implementation or debounce interval. [Search](https://support.spotify.com/us/article/search/), [autocomplete](https://support.spotify.com/gy/article/search-autocomplete/)

**M16:** Focused input, autocomplete, type filters and mixed result layouts were observed. **I:** Implement the following explicit states:

1. Blank query: browse categories or local recent searches, not a “0 results” error.
2. Typing: show matching entities and query continuation. Arrow keys move through options; Escape closes; Enter selects the active option or commits the query.
3. Results: top match plus sections for actual available types. “Show all” navigates to that type and retains the query.
4. No match: show the query and a clear-search action. Do not make unrelated music look like matching results.
5. Loading/error: keep the query, allow retry and discard responses for older queries.

**I:** First index title, artist and existing mood/group; extend to album and genre when real metadata exists. A proposed local query parser may support `track:`, `artist:`, `album:`, `genre:` and `bpm:`. The BPM operator is a Strudelify addition. Lyrics matching requires actual searchable lyric data; it must not search fabricated text. Debounce is a configurable project choice pending performance measurement.

## 5. Library, saved relationships and folders

**D2/D4:** Library is saved/followed content, not every item in the service. Likes, saved collections and follows are distinct. Sort/filter options vary by content. **D5:** Folders can contain and organize playlists, including nesting. [Library](https://support.spotify.com/us/article/your-library/), [sort/filter](https://support.spotify.com/gq-en/article/sort-and-filter/), [folders](https://support.spotify.com/us/article/playlist-folders/)

**I:** Separate these concepts:

- **Browse all:** whole public catalog.
- **Liked tracks:** track save relationships.
- **Your playlists:** collections owned by the local user or account.
- **Saved albums/playlists:** saved collection references.
- **Following:** creator/artist references.
- **Made by you:** custom Strudel compositions.

Preserve existing `strudelify-liked` and `strudelify-custom` values during migration. Library filters must not change the playing context. Sorting changes displayed order; explicit reorder changes stored playlist order. Pinning changes navigation placement, not playlist track order. An unavailable saved ID remains visible with a reason instead of silently disappearing.

**I:** Persist library width, collapse state, sort and view density independently from music data. Provide a keyboard alternative to dragging. Reject moving a folder into itself or a descendant. Exact Spotify collapse bounds and persistence behavior are **U**.

## 6. Album, playlist, artist and track surfaces

**M16:** Entity views use a substantial identity header, artwork/title/metadata hierarchy, action row, then content. Album tables omit redundant album metadata; playlist tables may include album/date-added; artist popular rows differ again.

| Surface | Identity and primary content | Strudelify adaptation (I) |
| --- | --- | --- |
| Album | Art, title, creator, year/length; ordered tracks | A real authored release with catalog track IDs |
| Playlist | Art, title, description, owner, item count; editable or read-only list | User collection distinct from compositions; show edit actions only for owner |
| Artist/creator | Identity, follow, popular tracks, releases | Use actual creator metadata; no fabricated audience statistics/verification |
| Track | Track identity, credits and contextual actions | Preserve View code and copy; add tempo, instrument and structure metadata only when supplied |
| Liked tracks | Saved-track collection | Derived from saved relationships, not duplicated song files |

**I:** A track row has separate current/playing/paused, hovered, focused and selected states. Selection must not start audio. Explicit play starts the row in its collection context; a menu does not navigate/play as a side effect. Play index, metadata links, save and More remain reachable by keyboard/touch. Duration is blank or “Live” when unknown; never guess a finite duration from a title.

The exact Spotify double-click, multi-select, sticky-header and drag behavior remain **U**. Choose and document our behavior before coding rather than calling a guess a measurement.

## 7. Playlist CRUD and contextual menus

**D3:** Create a playlist, edit its details, add/remove tracks and drag to reorder are documented operations. **D15:** Collaborative editing is a separate permissioned feature. [Editing](https://support.spotify.com/us/article/create-playlists/), [collaboration](https://support.spotify.com/tv/article/collaborative-playlists/)

**I:** Keep “Create playlist” separate from “Create a track.” The former stores ordered references; the latter saves executable composition source.

| Context | Menu actions for the independent implementation |
| --- | --- |
| Track | Play, Add to queue, Save/unsave, Add to playlist, View creator/release when present, Share, View/copy code |
| Owned playlist | Play, edit details, add items, reorder, duplicate, move to folder, share/export, delete |
| Read-only collection | Play, save/unsave, copy link, duplicate into owned playlist |
| Queue entry | Play now, remove this occurrence, move up/down; pointer reorder where supported |
| Folder | Rename, create playlist/folder, move, remove folder with explicit child-handling semantics |

These proposed menu contents are not an exhaustive Spotify menu scrape. Items are capability-based; hide unsupported actions instead of shipping inert Spotify-shaped controls. Menus need collision handling, focus management, submenu navigation and disabled-state explanations. **M16** menu geometry is available; submenu timing and collision rules are **U**.

**I:** Assign a unique entry ID per playlist occurrence. Duplicate tracks are a deliberate policy with an explicit add-again choice; removing one occurrence must not remove them all. Save edits atomically; storage failure leaves the dialog contents available. Deletion should offer undo or a clear confirmation. Those details are proposed contracts, not observed Spotify storage rules.

## 8. Queue, context and history

**D1:** The queue is editable and controls upcoming playback. **D10:** Recents is accessible from the desktop queue area. [Queue](https://support.spotify.com/us/article/play-queue/), [Recents](https://support.spotify.com/us/article/recent-activity/)

**I queue model:**

```text
Playback context: collection snapshot + its current cursor
Manual queue: ordered entry instances explicitly added by the listener
Now playing: one active session and selected entry
History: completed/started session records with a defined recording threshold
```

Proposed resolver: explicit Play now → next manual entry → next context entry → repeat-context or optional continuation → ended. Repeat-one applies to natural completion; explicit Next advances. These precedence rules must be treated as our design until an authenticated matching reference scenario is observed.

**I edge cases:**

- Add-to-queue does not interrupt current audio. Remove/reorder does not reinitialize it.
- Playing from a collection captures that collection order; a subsequent search or library filter does not silently replace it.
- The same track may occur twice; operations target entry IDs.
- Skip past a bad entry requires a visible reason and bounded policy. Do not recursively auto-skip forever.
- Clearing the manual queue does not erase current audio, history or the source playlist.
- Back uses listening history independently from route history. A proposed restart threshold must be configured/documented rather than attributed to Spotify without observation.
- History is recorded after a successful start under a chosen minimum-listen policy. Failed loads and editor previews are not real listens.

## 9. Shuffle, repeat, autoplay and transitions

**D8/H5:** Shuffle is an order mode. Spotify describes standard randomness and a freshness-oriented alternative; Smart Shuffle introduces recommendations. The source does not supply every current parameter or freshness weight. [Shuffle](https://support.spotify.com/us/article/shuffle-play/), [engineering](https://engineering.atspotify.com/2025/11/shuffle-making-random-feel-more-human)

**I:** Persist `shuffle = off | standard` first. Materialize an order once per context; do not pick randomly on each render or Next. Preserve current item and a predictable history. A seeded permutation is a project implementation choice, not a claim to reproduce Spotify's algorithm. Add a distinctly named freshness mode only after listening-history data exists. Never present a mood filter as Smart Shuffle.

**D9:** Repeat supports collection and one-track modes. **I:** Use `off → context → one → off`, explicit accessible labels and a “1” indication. Do not replace the existing hard Stop safety path with Repeat; keep Stop in a reachable menu or separate control.

**D11:** Autoplay continues with related material after the selected content ends. **I:** Default it to a clear, user-controlled setting. It must not bypass Repeat, unavailable content or a deliberately stopped session.

**D12:** Gapless, crossfade and beat matching are different operations. **I:** With Strudel, align scheduler events, output buses, gain envelopes and score ending. Crossfade intentionally uses two bounded sessions; retain one authoritative transport owner. Do not add it by allowing arbitrary stale patterns to overlap. These features require engine work later; no transition code changes occur in this research phase.

## 10. Transport and Now Playing

**M16:** Desktop transport has left identity, central playback/time and right utilities. **D9/D23:** Play/pause, previous/next, repeat, queue, position and volume are distinct controls with distinct state. [Now Playing](https://support.spotify.com/us/article/now-playing/), [SDK reference](https://developer.spotify.com/documentation/web-playback-sdk/reference)

**I transport states:** `idle`, `loading`, `playing`, `paused`, `stopped`, `ended`, `error`. Every visible player/card/row derives from the same snapshot. Track selection, audible session and route selection must not be conflated.

- Finite tracks show elapsed/total only from score metadata and engine time.
- Indefinite patterns show elapsed plus Live. A disabled seek control must not imply scrub support.
- Seeking requires score-time/cycle reconstruction, effects reset and instrument preparation. Until the adapter supports it, do not draw a functioning-looking slider.
- Pausing preserves the scheduler phase and finite ending position; Stop resets/cancels. Switching tracks terminates stale session output before the new one becomes audible.
- Loading includes cancellation; errors retain the selected item and a meaningful retry.
- Volume is a master output parameter, with mute restoring the previous nonzero value. It must not rewrite composition gains.
- Now Playing/right-panel identity follows the audible track. Viewing another track's source must not relabel current audio.

**D20:** Lyrics depends on actual content. **I:** Keep a lyrics/notes view where material is available and use a real empty state otherwise. View code remains a first-class Strudelify action; creator preview is an explicitly different audio session, with a documented return/stop policy.

## 11. Mobile and accessibility

**P19:** Separate mobile web resources were served. **D9:** The mobile mini player can expand. **U:** No fresh mobile app or mobile web geometry is measured.

**I:** Use a deliberate narrow layout: primary navigation, mini player, expanded Now Playing, bottom-sheet queue/menus and full-screen search/editor where needed. Closing a panel while resizing must not leave an invisible modal blocking clicks. Preserve readable code through horizontal editor scrolling rather than shrinking it to illegibility. Keep artwork/title/actions visible without trapping the main route behind desktop sidebars.

**I:** All icon controls have names; state changes have appropriate pressed/expanded values. Menus/dialogs contain keyboard focus, restore it on close and allow Escape. Sliders expose name, bounds and current value. Drag actions have move-up/down equivalents. Respect reduced motion and use contrast independent of green alone. Do not announce elapsed time every animation frame.

These are acceptance requirements for our product, not a claim that a complete accessibility audit of Spotify was performed.

## 12. Features with real service dependencies

| Capability | Evidence | What Strudelify actually needs |
| --- | --- | --- |
| Cross-device libraries | D2/D14 | Identity, shared storage and sync/conflict policy |
| Connect-style control | D14 | Paired devices, command channel, ownership and clock/state protocol |
| Collaborative playlists | D15 | Accounts, ACLs, shared mutations and conflict resolution |
| Jam-style listening | D21 | Host/participant roles, shared queue and timing model |
| Offline | D18 | Cached app/runtime/code/samples, verified cache readiness and unavailable states |
| Recommendations/Radio | D11/D22 | Real metadata/history and an explainable selector; not copied recommendation lists |
| Quality/normalization | D17/D19 | Synth render/output policies and measured levels; compressed-stream quality labels do not transfer directly |
| Sharing | D16 | Stable public entity routes or explicit local export/import; a local-only item has no public permalink |
| Profiles/follows/activity | D2/D22 | Real users, visibility rules and persisted relationships |
| Podcasts/audiobooks/video/merch | D22 | New media/domain models and content sources; indexed as adjacent features, not currently reconstructed |

There is no pretense that these work because a corresponding button or page name is listed. Commercial audio, copied catalogs, artwork/font files and Spotify private services are not inputs to our upgrade.
