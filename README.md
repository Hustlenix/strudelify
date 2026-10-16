# Strudelify

**Your music library, played as live code.** Strudelify is a small, static music player built with HTML, CSS, vanilla JavaScript, and the Strudel browser audio engine. Every demo track is a `.strudel` file that is fetched and performed in the browser.

## Run it

Serve this folder with any static file server, then open the local address it prints. For example:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. The player needs an internet connection to load the pinned Strudel runtime from unpkg. Press a track's play button to start audio; browsers require a user click before audio can play.

GitHub Pages can host the same files directly. There is no build step, framework, account, or backend.

## Add a track

1. Add a `.strudel` file in `tracks/`.
2. Add its metadata and `codeUrl` to the `tracks` array near the top of `app.js`.
3. Refresh the page.

Strudelify also has a **Create track** editor. Saved patterns are kept in this browser's local storage.

## What works in this first version

- Browse and search a small demo library.
- Play and stop Strudel compositions with the shared bottom player.
- Inspect, edit, copy, and save patterns.
- Save custom tracks and liked songs in local browser storage.
- Responsive layout for desktop and mobile.

This is a music player for live-generated Strudel patterns. It does not stream commercial recordings or use Spotify's catalog.

## Strudel runtime and licensing

The page loads the pinned `@strudel/web` 1.2.6 browser bundle from [unpkg](https://unpkg.com/@strudel/web@1.2.6). Strudel's project guide describes using this package with a custom HTML interface and explains its AGPL-3.0 licensing requirements: [Using Strudel in your Project](https://strudel.cc/technical-manual/project-start/). This repository publishes the complete app source alongside the integration. See the upstream package and license before redistributing a modified runtime.

The app itself is released under the repository's MIT license. Demo compositions in `tracks/` are original examples for this project.

## Your eight-song starter collection

The library also includes eight labelled **instrumental studies**, in the original requested order: Babydoll, Without Me, Everyday Normal Guy 2, Sailor Song, Can't Tell Me Nothing, Love Me Not, I Thought I Saw Your Face Today, and Lonely. They are not official recordings, and have not been verified as faithful cover versions. Their source files live in `tracks/` so the editor and player can load them independently. The original six Strudelify compositions remain available.

To make the studies into recognizable section-by-section instrumental covers, they still need listening-based transcription and musical review. Commercial audio is deliberately not included in this public repository.
