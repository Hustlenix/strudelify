# Strudelify — listening-app prototype

A Spotify-inspired **listening interface for music written in code**, designed as an independent app rather than a copy of Spotify's brand.

> **Status: MVP prototype, not a streaming service.** Eight original Strudel instrumental **studies** are included as editable examples. They are **not** verified covers or automatically transcribed equivalents of the commercial recordings named in the catalog. No vocals or copyrighted MP3 recordings are distributed.

## What's implemented

- Responsive dark library with home, search, liked songs, and custom playlists.
- Eight tracks in the original order.
- Music controls: play/stop, previous, next, shuffle, repeat, play queue.
- **Strudel playback:** evaluate the track's editable code using `@strudel/web@1.0.3`.
- **Local reference playback:** select your own MP3s from the computer without uploading them. Files are matched by song title and kept in this browser tab only.
- Code studio: inspect/edit/reset/copy a Strudel sketch or open it in the official Strudel editor.
- Liked songs, playlists, and code edits persist in `localStorage`; imported MP3s do **not** persist after a refresh.

## Running locally

This project is plain HTML, CSS and JavaScript, without a framework or build step.

```sh
# From the project directory
python -m http.server 4173
# Open http://localhost:4173
```

Alternatively, serve the folder through VS Code Live Server or GitHub Pages. A local server is preferred to opening `index.html` directly because it uses ES module imports.

The Strudel runtime is loaded from `https://unpkg.com/@strudel/web@1.0.3`, so an internet connection is currently required for generated playback. Browsers generally require you to click Play before audio can start.

Select **Source → Strudel** to hear a generated instrumental study. Select **Source → Local file**, then **Add local recordings** to hear your own files as references. Strudel playback is live/pattern-based (it does not have a meaningful song duration or seek bar); the local reference player has a normal time display.

## Quick checks

```sh
npm test
```

These are **static catalog checks and JavaScript syntax checks**, not automated browser/audio tests. Browser playback, Strudel evaluation, resource loading, and device compatibility still require manual testing.

### Required manual checks

1. Search for *Babydoll*, then open and edit the code studio.
2. Press Play in Strudel mode and confirm audible generated audio. Stop and verify it silences.
3. Import your eight local MP3s, switch to Local file, and play each one.
4. Create a playlist, like a song, add it to the queue, refresh, and verify the persistent state (not the imported files).
5. Repeat on a narrow/mobile screen; inspect Console and Network for errors.

## File map

- `index.html` — semantic application shell
- `styles.css` — responsive dark interface
- `src/tracks.js` — starter catalog and Strudel study patterns
- `src/app.js` — listening, queue, playlist, source, editor, and local file behavior
- `tests/catalog.test.mjs` — static integrity tests

### Adding song #9 / #350

Create a new entry in `TRACKS` with a unique `id`, metadata, colors, and a verified Strudel `code` pattern. The library and search views update automatically. At large scale, move song data into validated catalog JSON and chunk-load entries instead of keeping all songs in one source file.

## Next development milestones

1. **Playback reliability:** browser smoke tests with an actual running Strudel instance; loading, eval, stop, error states; test Firefox/Safari/mobile.
2. **Musical accuracy:** full, section-based Strudel arrangements; note-by-note reviews against privately owned references; never present drafts as exact covers.
3. **Listening system:** persistent queue, user-managed sets, curated playlists, mini-player keyboard shortcuts, accessibility review.
4. **Catalog scale:** indexed metadata, lazy-loading, artwork with rights metadata, import pipeline, work progress dashboard for 350+ songs.
5. **Optional hosting:** static GitHub Pages deployment, preserving an offline-capable catalog and private audio.

## Copyright and attribution (review before publication)

- Commercial songs, underlying compositions, cover recordings, artwork, and lyrics have separate rights. No permission to distribute original MP3s or commercial cover arrangements is presumed.
- [Strudel](https://strudel.cc/) is third-party open-source music software under the **AGPL-3.0**. Its [official integration guidance](https://strudel.cc/technical-manual/project-start/) and [FAQ](https://strudel.cc/learn/faq/) describe license obligations for integrations and ask independent projects **not to include “Strudel” in their name**. This prototype retains the repo's original name and MIT license temporarily. **Resolve those licensing and naming issues before publishing/deploying as an integrated public product.** Do not treat the existing MIT file as sufficient authorization for all components.
- Strudel contributors retain copyright in the Strudel software. This project is independent and unaffiliated with Strudel or Spotify.

© Hustlenix for independently authored app code, subject to the compatibility review above.
