# Spotify reverse-engineering research for Strudelify

Research date: **19 October 2026**. Branch: `codex/spotify-research`. Strudelify base: `7c6ac654ba2bad98a8c42cd8a1c65d346b660582`.

## Deliverable

Keep Strudelify and upgrade its product behavior around the existing Strudel engine. This phase supplies an implementation reference. It changes documentation and research tools only; it contains no new arrangements or application changes.

| Read this | Purpose |
| --- | --- |
| [design.md](../../design.md) | Preserved rendered measurements from 16 October, with the dated extension and important corrections |
| [Surface and behavior map](BEHAVIOR.md) | Screens, interactions, menus, playback and library behavior |
| [Architecture](ARCHITECTURE.md) | Framework findings, current code audit, proposed boundaries and data contracts |
| [Feature matrix](feature-matrix.csv) | Feature-by-feature evidence, current support, dependencies and implementation order |
| [Evidence ledger](SOURCES.md) | Primary sources, provenance and what each source proves |
| [Capture and open questions](CAPTURE.md) | Reproduction commands, remaining observations and scope limits |
| [Native desktop follow-up](NATIVE-DESKTOP.md) | Fresh player, queue, playlist, duplicate/removal and cleanup observations, with native capture limits |
| [Geometry tokens](design-tokens.json) | Machine-readable values with their measurement date and evidence class |

## Findings that change the implementation

1. The existing [measured shell](../../design.md#3-page-anatomy-the-structural-reference) is useful: global navigation, separate library/main scrolling and persistent transport. Preserve it rather than starting over.
2. Our `renderQueue()` renders the catalog. Spotify documents an editable upcoming queue. Strudelify needs queue entries with identity, playback context and explicit ordering, not a renamed catalog list. [Queue source](https://support.spotify.com/us/article/play-queue/)
3. Our Shuffle button selects a random song immediately. Spotify documents persistent playback modes and now distinguishes Standard, Fewer Repeats and Smart Shuffle. Reproduce a clear persistent mode first; do not call a random button a complete shuffle implementation. [Shuffle source](https://support.spotify.com/us/article/shuffle-play/)
4. Likes and saved custom patterns already exist. User playlists, playlist entries and album/artist entities do not. Extend the data model while retaining existing local data.
5. The anonymous public response serves separate desktop and mobile web build families. Narrow desktop emulation is not evidence for the mobile product. [Captured resource facts](evidence/public-surface.json)
6. Public bundles contain React-family fingerprints and a `react-dom` renderer declaration for `18.3.1`. These are artifact findings, not a measured active runtime. Spotify's older engineering description supports a React UI with platform APIs abstracting playback and data. Strudelify can adopt that separation using HTML and JavaScript modules. A framework migration is not required to reproduce the interactions. [Historical architecture](https://engineering.atspotify.com/2021/04/building-the-future-of-our-desktop-apps)

## Evidence status

- **Preserved:** earlier rendered Home, Search, Album, Playlist, Artist, menu and empty-player measurements. They remain dated 16 October.
- **Fresh:** four anonymous HTML responses, two CSS artifacts and selected desktop JavaScript artifact fingerprints. Resource hashes and limitations are retained; proprietary bundles are not vendored.
- **Documented:** Spotify's official descriptions of queue, library, playlist editing, search, shuffle, repeat, settings and adjacent services.
- **Native follow-up:** the owner subsequently authorized installed Spotify inspection and a disposable playlist scenario. Selected-track Play/Pause, manual queue add/remove/clear, playlist create/rename/add, duplicate occurrence removal and playlist deletion were observed. The temporary playlist and research manual queue entries were cleaned up. See [N19 observations](NATIVE-DESKTOP.md).
- **Still open:** fresh web DOM/computed-style capture, dependable drag-reorder verification, full transport modes, real mobile behavior and backend implementation. Browser Use continued to report disabled after refresh; the native app supplied the follow-up evidence. Native screenshot coordinates are not CSS measurements, and AX state lagged visible changes.

This is an evidence-backed first research package, not a claim that all of Spotify has been reconstructed or that any pixel comparison has passed. The next implementation can proceed from the specified Strudelify contracts while the listed visual unknowns remain open.

## Recommended implementation sequence

1. Preserve the existing cancellation and audio-silencing protections; expose them behind one playback adapter.
2. Implement true playback context, upcoming queue, history, persistent shuffle and repeat modes.
3. Implement playlist creation, add/remove/reorder, library sort/filter and persisted view preferences.
4. Apply the measured desktop shell, menus, card states and entity layouts consistently; capture the unresolved reference states before asserting exact matches.
5. Add intentional mobile navigation and expanded Now Playing, then verify on a real phone.
6. Add accounts/sync, collaboration, recommendations and offline capability as separate services with explicit behavior. They are dependencies, not CSS features.

Existing Strudel code, public catalog entries, local likes/custom tracks and release protections are preservation requirements throughout. Music composition is outside this phase.
