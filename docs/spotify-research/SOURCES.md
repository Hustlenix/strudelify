# Evidence ledger

Accessed 19 October 2026. Claims use these classes:

- **M16:** rendered measurement preserved from the 16 October audit in [design.md](../../design.md).
- **P19:** newly inspected anonymous public resource; source facts, not rendered behavior.
- **N19:** native Windows Spotify screenshot/accessibility observations; [record](NATIVE-DESKTOP.md) and [structured summary](evidence/native-observations.json). Image coordinates are not CSS measurements; AX lag is explicitly documented.
- **D19:** documented by Spotify; platform, account and region qualifications still apply.
- **H:** published historical architecture; not a current implementation guarantee.
- **L:** read directly from our checked-out source at the stated base commit.
- **I:** proposed Strudelify implementation decision.
- **U:** unknown or not observed.

## Public resources and the requested REA resource

| ID | Source | What it supports / limits |
| --- | --- | --- |
| P1 | [Spotify home](https://open.spotify.com/) and [search](https://open.spotify.com/search) | Ordinary anonymous desktop/mobile User-Agent responses. Four responses and their linked CSS recorded in [public-surface.json](evidence/public-surface.json). Not authenticated account behavior. |
| P2 | First-party CDN resources linked by P1 | Separate `web-player` and `mobile-web-player` build URLs; selected token values, media-condition inventory, artifact lengths/hashes. CSS declarations do not establish active cascade or component breakpoints. |
| P3 | Selected desktop scripts linked by P1 | [Static fingerprints](evidence/framework-fingerprints.json). React-family strings and a renderer declaration; no recovered private source tree or runtime instrumentation. |
| R1 | [morluto/rea](https://github.com/morluto/rea) | User-supplied research tool. Reviewed browser/static-analysis workflows. Reference revision `9aca543f46085f502dbc5445002e129e5d2974e9`. REA itself was not installed or run, and no global agent configuration was changed. |
| R2 | [REA browser observation guide at that revision](https://github.com/morluto/rea/blob/9aca543f46085f502dbc5445002e129e5d2974e9/docs/browser-observation.md) | Distinguishes passive page inspection, static bundle analysis, event windows and screenshot comparison. It requires an available browser endpoint; tool installation would not make currently unavailable observations real. |
| R3 | [User-supplied video](https://www.youtube.com/watch?v=qFEuYUfauNY) | Fetch was throttled. No conclusion in this package relies on a guessed transcript or on having watched it. |

The capture scripts retain selected facts, resource URLs and SHA-256 hashes. They discard fetched page and bundle bodies. They do not fetch audio, images, fonts, source maps, private endpoints, account storage or credentials.

## Interaction sources

| ID | Official source | Bounded finding used |
| --- | --- | --- |
| D1 | [Play Queue](https://support.spotify.com/us/article/play-queue/) | Web/desktop queue opens near transport; tracks can be added, reordered, removed and cleared. This documents operations, not exact visual dimensions or duplicate-handling semantics. |
| D2 | [Your Library](https://support.spotify.com/us/article/your-library/) | Saved content and followed entities have separate relationships. Saving one entity does not imply saving every related entity. |
| D3 | [Create and edit playlists](https://support.spotify.com/us/article/create-playlists/) | Playlist creation/details, contextual add/remove and drag reorder. Suggestions are another feature. |
| D4 | [Sort and filter](https://support.spotify.com/gq-en/article/sort-and-filter/) | Library and collection filtering/sorting vary by surface; desktop column headers can sort; preferences can persist. |
| D5 | [Playlist folders](https://support.spotify.com/us/article/playlist-folders/) | Named folders, nesting and moving collections. Current documentation includes web, desktop and mobile; do not inherit an older desktop-only assumption. |
| D6 | [Search](https://support.spotify.com/us/article/search/) | Typed content categories, lyric matching and field-style query operators. Coverage depends on the indexed catalog. |
| D7 | [Search autocomplete](https://support.spotify.com/gy/article/search-autocomplete/) | Suggestions can come from known names, popular queries and history. It does not publish a debounce interval or ranking algorithm. |
| D8 | [Shuffle play](https://support.spotify.com/us/article/shuffle-play/) | Order modes, Premium shuffle styles and recommendation-bearing Smart Shuffle; availability is platform/plan dependent. |
| D9 | [Now Playing](https://support.spotify.com/us/article/now-playing/) | Standard transport, saved state, repeat modes, queue access and expanded views. Repeat selection twice targets a song. |
| D10 | [Recent activity](https://support.spotify.com/us/article/recent-activity/) | Desktop Recents is available from the queue area; the article specifies a last-50-song view. This is not our proposed retention policy. |
| D11 | [Autoplay](https://support.spotify.com/us/article/autoplay/) | Optional related-content continuation when a selected collection ends. |
| D12 | [Transitions](https://support.spotify.com/pw/article/tracks-transitions/) | Gapless, crossfade and beat-matched transitions are distinct capabilities; device/plan qualifications apply. |
| D13 | [Keyboard shortcuts](https://support.spotify.com/vn-en/article/keyboard-shortcuts/) | Published shortcuts vary by OS/client. Browser-reserved chords need separate treatment in Strudelify. |
| D14 | [Connect](https://support.spotify.com/us/article/spotify-connect/) | Remote device control and web device-discovery limitations. A browser-local player is not equivalent. |
| D15 | [Collaborative playlists](https://support.spotify.com/tv/article/collaborative-playlists/) | Invite links and shared edit permissions, including collaborator removal. Requires identity and shared persistence in our product. |
| D16 | [Sharing](https://support.spotify.com/hk-en/article/share-from-spotify/) | Sharing is an explicit content operation; our own stable routes/visibility model must supply the equivalent. |
| D17 | [Audio quality](https://support.spotify.com/au/article/audio-quality/) | Stream encodings/settings differ by client. File bitrate labels are not meaningful controls for a live synthesizer. |
| D18 | [Offline listening](https://support.spotify.com/ly-en/article/listen-offline/) | Download and offline states are real data availability states, not a decorative icon. |
| D19 | [Volume normalization](https://support.spotify.com/us/article/volume-normalization/) | Level balancing and output volume are different concepts. A synth master gain alone is not loudness normalization. |
| D20 | [Lyrics](https://support.spotify.com/ao-en/article/lyrics/) | Lyrics is a content-dependent surface, not proof that every track has timed text. |
| D21 | [Jam](https://support.spotify.com/na-en/article/jam/) | Shared listening includes hosts/participants and queue interactions. Timing and permissions need dedicated implementation. |
| D22 | [Feature index](https://support.spotify.com/us/category/in-app-features/) | Inventory of additional product surfaces. A linked feature name alone establishes no screen geometry or implementation detail. |

## Framework and engineering sources

| ID | Official source | Use |
| --- | --- | --- |
| H1 | [Building Spotify's New Web Player, 2019](https://engineering.atspotify.com/2019/3/building-spotifys-new-web-player) | Historical React/Redux architecture and HTML5 playback explanation. Do not present the 2019 dependency list as a 2026 manifest. |
| H2 | [Building the Future of Our Desktop Apps, 2021](https://engineering.atspotify.com/2021/04/building-the-future-of-our-desktop-apps) | React UI, TypeScript platform abstractions and hooks decoupling native/web data and playback providers. |
| H3 | [Customization vs Configuration, 2021](https://engineering.atspotify.com/2021/4/customization-vs-configuration-in-evolving-design-systems) | Encore's shared component vocabulary and customization tradeoffs. |
| H4 | [Encore and Accessibility, 2023](https://engineering.atspotify.com/2023/03/encore-x-accessibility-a-balancing-act) | Component accessibility is part of the design system, not merely a color palette. |
| H5 | [Shuffle: Making Random Feel More Human, 2025](https://engineering.atspotify.com/2025/11/shuffle-making-random-feel-more-human) | Describes evaluating candidate random orders against recent listening for the Fewer Repeats style. Our proposed permutation is explicitly simpler. |
| D23 | [Web Playback SDK reference](https://developer.spotify.com/documentation/web-playback-sdk/reference) | Public playback state/events/commands support the separation between player state and rendered controls. No Spotify SDK integration is added. |

## Local source anchors

All L claims refer to commit `7c6ac654ba2bad98a8c42cd8a1c65d346b660582`, not to an unchecked live deployment:

- `app.js:24`: current state and local library arrays.
- `app.js:95`: source fetch/cache; `105`: engine initialization; `129`: hard silence; `165`: cancellable serialized start; `232`: Stop; `247`: pause/resume.
- `app.js:303`: generated library collections; `342`: queue renders `allTracks()`.
- `app.js:399`: local substring search; `415`: library; `429`: route-view switching; `441`: track details.
- `app.js:493`: one-shot random selection; `571`: previous/next over the whole catalog; `579`: Shuffle handler.
- `app.js:600`: save a custom pattern; `620`: route handling; `647`: library resize; `655`: suggestions; `680`: catalog load.
- `index.html:39`: transport contains Stop rather than Repeat and a live status strip rather than a time/seek row.
- `styles.css:81`: shell; `273`: sidebar; `918`: player; `1357` onward: responsive rules.

Line anchors are for this pinned base; relocate symbols after edits. No music recognition or new listening result is claimed by this source audit.
