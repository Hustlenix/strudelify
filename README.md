# Hustlenix Music

A browser music player where every track is an editable Strudel program, performed live.

![The desktop player with Soft Focus selected](https://raw.githubusercontent.com/Hustlenix/strudelify/main/docs/media/desktop-player.png)

**[Listen now](https://hustlenix.github.io/strudelify/)** · **[Watch the 45-second walkthrough](https://github.com/Hustlenix/strudelify/raw/refs/heads/main/docs/media/hustlenix-music-walkthrough.mp4)**

The current public beta includes six original instrumentals. The project began as Strudelify;
its repository URL is retained.

## Try it in a minute

1. Open the demo, choose a track and press **Play**.
2. Try **Next**, **Pause/Resume** and **Stop**.
3. Open **View code** to inspect the actual composition.
4. Copy its source into **Create a track**, change a tempo or note, then press **Preview pattern**.

Saved tracks and likes stay in this browser. Internet access is required for the pinned Strudel runtime.

## Interface and features

- Six original instrumentals with distinct tempos, finite sections and fading endings.
- Play, Pause/Resume, hard Stop, Next/Previous and search.
- Complete composition source, plus a local editor with live preview.
- Browser-local likes, listening history and personal compositions.
- Responsive listening controls and explicit playback error/retry states.
- Downloadable application source, license notices and contextual GitHub feedback links.

Demo compositions in `tracks/` are original examples for this project. The public beta's
catalog contains these six originals; the earlier commercial-song studies and lyric drafts
are excluded from its deployed artifact.

## Run locally

Requires Git, Python 3.10 or newer, and a browser with WebAudio support.

```sh
git clone https://github.com/Hustlenix/strudelify.git
cd strudelify
python release-audit/build_preview.py --output release-preview/local
python -m http.server 8000 --directory release-preview/local
```

Open **http://localhost:8000/** and press Play. Choose a fresh build directory if
`release-preview/local` already exists. The build uses Python's standard library.
No VS Code extension, API key, account or database is required.

Node.js 22 and the locked tools in `release-audit/package-lock.json` are used for development QA.

## How it works

The app uses HTML, CSS and JavaScript with the pinned `@strudel/web` runtime. It loads each
composition's source and evaluates the pattern in the browser. Audio begins after a user gesture.

Playback requests have session IDs and cancelable loading. Serialized evaluation and a session
check prevent stale selections from starting after a newer action. Pause suspends the audio clock
to preserve position; Stop resets the active scheduler and silences its voices and effect tails.
Cooperating tabs hand off playback ownership through `BroadcastChannel`.

The local editor previews the edited code through that same engine. Closing an editor preview stops it.
There is no backend or cross-device library sync in this version.

## Release evidence

The [October 18 public deployment](https://github.com/Hustlenix/strudelify/actions/runs/39135771017)
published application commit `609f634fce2e883c5de329eb846504e070ad438c` and verified its public resources.
Live-player checks passed in Chromium and Firefox, 18 per browser. Public resource and exclusion
checks passed for all 45 recorded cases.

Full technical captures of the six originals checked their finite endings, clipping and sample validity.
Physical-phone testing and independent listening feedback remain open. The mobile walkthrough is browser emulation.

The [walkthrough and capture notes](https://github.com/Hustlenix/strudelify/blob/main/docs/demo.md)
show a real tempo change reaching the live scheduler.

## What's next

- Improve compositions from real listener feedback.
- Build an ordered, editable queue, saved playlists and complete shuffle/repeat behavior.
- Expand the catalog with reviewed, publishable arrangements.

## Feedback and contributions

[Report a problem or suggest an improvement](https://github.com/Hustlenix/strudelify/issues/new).
Include the track, browser and steps to reproduce. The in-app **Report a problem** link fills
in playback context for you; submitting a GitHub issue requires signing in.

Contributions should include source attribution and permission for any music or assets they introduce.

## Credits and license

- Project by **Hustlenix**.
- Live music engine: [Strudel](https://strudel.cc/), copyright its contributors.
- Substantial assistance from **Codex and OpenCode** in implementation, compositions, SVG artwork,
  debugging, verification, documentation and deployment. No independent human-authorship percentage is claimed.
- The walkthrough is an agent-operated recording of the actual app with captured synthesis audio.

The combined application is distributed under **AGPL-3.0-or-later**. The original MIT grant for
project portions is retained. See [LICENSE](LICENSE), [COPYING](COPYING), [NOTICE.md](NOTICE.md),
[LICENSING.md](LICENSING.md) and [asset sources](THIRD_PARTY_ASSETS.md).

The deployed site includes [complete application source and license downloads](https://hustlenix.github.io/strudelify/SOURCE.html).
