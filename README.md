# Hustlenix Music

Previously branded Strudelify. The repository URL is retained.
<img width="1917" height="910" alt="image" src="https://github.com/user-attachments/assets/0fe97c3c-edde-46a8-ae17-3c1ac30accae" />

**WHOLE SPOTIFY IN STRUDEL, CAUSE WHY NOTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT?** 
My project: Strudelify is a small static music player, so you can play this and sing yourself, kinda boring. both for me and you, because it was soo tuff analysing the beats and coding it😭

## Run it
1. I have deployed it in github, do you can acess it in: [Try It Out](https://hustlenix.github.io/strudelify/) for free
or
2. To run this install the strudel plugin in VS code

## Why?
All this started when i was getting scoldings from my school music teacher because my voice so coarse, so because of my ego issues and my coding abilities, I have decided to write every song in Strudle!!!!!! FaaaI mean, strudle is made for music, but what makes this isntesting is that making a whole spotify out of this and some html and js. thats it! simple looking structure but complex code within, just like Spotify.

## How?
Used strudel for this also used website hooktheory and sheet music for recreating 

## Help needed!
This is opensourced, so you can add a music that you like, to expand this website. If you added a track, thanks!

## Interface and features

The resource-kit integration uses 21 pinned Lucide SVG icons without a new runtime
JavaScript dependency. Full ISC/Feather MIT notices and an integrity receipt ship with
the source archive. See the [resource decisions](https://github.com/Hustlenix/strudelify/blob/codex/spotify-upgrade/docs/resource-decisions.md)
and [asset ledger](THIRD_PARTY_ASSETS.md) for the adoption plan and provenance.

The collection upgrade adds saved local playlists with descriptions, duplicate entries,
individual removal, and keyboard-accessible up/down ordering. Create a playlist in Your
Library; use a track's options button to add it to a playlist or queue. Create a track
still opens the Strudel editor.

The play queue separates Now playing, manually added tracks, and the remaining collection.
Manual tracks play first. Editing or deleting a playlist does not change the active
collection snapshot. Shuffle and repeat preferences survive reload; the queue itself is
session-only. Repeat cycles between off, collection, and one track. Finite scores advance
automatically, while open-ended patterns continue until you choose Next or Stop.

Playlists, likes, and custom patterns stay on this device; there is no account or cloud
sync. The six public scores and the Strudel runtime remain unchanged by this upgrade.

The interface follows the measured layout reference in [design.md](design.md): I carefully analysed spotify's design and just recreated it, i neither copied them nor break their *should not copy* rule, i just used their UI/UX(THAT TOO, Only for the FRONT END)

The project-authored source retains its MIT notice. Strudel is an AGPL-3.0-or-later dependency;
the combined distribution uses AGPL-3.0-or-later, while MIT grants for project portions remain.
The public UI uses Hustlenix Music; see [LICENSING.md](LICENSING.md).
See [THIRD_PARTY_ASSETS.md](THIRD_PARTY_ASSETS.md). Demo compositions in `tracks/` are original examples for this project.

## v0.1 instrumental beta

The public beta contains six original instrumentals. Each has finite sections, a fading ending
and measured level balance. All six have complete technical audio captures; subjective listening
acceptance and a physical phone test have not been recorded. The owner delegated shipping the
technical beta without requiring the review form. Catalog review metadata retains those limits.
Commercial-song study scores, lyric transcripts and supplied recordings are excluded from the
public artifact. All prior music work remains preserved in the repository's separate review work.

The player has separate Play/Pause/Resume and Stop behavior, mobile transport controls,
complete actual View code, and links to draft a public GitHub listener report. GitHub sign-in
is required to submit; no report or personal data is sent automatically.

For a local review build, install the locked development tools in `release-audit/`, run
`python release-audit/build_preview.py`, then serve `release-preview/` over localhost.
Read the repository's [release audit](https://github.com/Hustlenix/strudelify/tree/main/release-audit)
for release evidence, known limitations and the deployment runbook.

## Licence
Combined application: AGPL-3.0-or-later. Original MIT grants for project portions are retained.
See [LICENSE](LICENSE), [COPYING](COPYING), [NOTICE.md](NOTICE.md) and [LICENSING.md](LICENSING.md).
Every allowlisted build includes SOURCE.html and an application source archive.
