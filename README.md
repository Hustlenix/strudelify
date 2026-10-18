# Strudelify
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

The interface follows the measured layout reference in [design.md](design.md): I carefully analysed spotify's design and just recreated it, i neither copied them nor break their *should not copy* rule, i just used their UI/UX(THAT TOO, Only for the FRONT END)

The project-authored source retains its MIT notice. Strudel is an AGPL-3.0-or-later dependency;
the proposed combined distribution uses AGPL-3.0-or-later, while MIT grants for project portions remain.
The public name and final publication approval are pending; see [LICENSING.md](LICENSING.md).
See [THIRD_PARTY_ASSETS.md](THIRD_PARTY_ASSETS.md). Demo compositions in `tracks/` are original examples for this project.

## MVP review candidate

The `codex/mvp-recovery` branch preserves the current static app and all prior music work.
Its proposed public artifact includes the six original instrumental patterns, clearly labeled
as drafts. Each now has finite sections, a fading ending and measured level balance; full human listening approval is pending. Commercial-song study scores and automatic lyrics are withheld from this artifact
pending permission and human music review. The public site is unchanged until a reviewed
merge/deployment is explicitly approved.

The player has separate Play/Pause/Resume and Stop behavior, mobile transport controls,
complete actual View code, and links to draft a public GitHub listener report. GitHub sign-in
is required to submit; no report or personal data is sent automatically.

For a local review build, install the locked development tools in `release-audit/`, run
`python release-audit/build_preview.py`, then serve `release-preview/` over localhost.
Read [release-audit/RELEASE_CANDIDATE.md](release-audit/RELEASE_CANDIDATE.md) and
[release-audit/RESOURCE_DECISIONS.md](release-audit/RESOURCE_DECISIONS.md) for evidence and remaining gates.

## Licence
Combined application: AGPL-3.0-or-later. Original MIT grants for project portions are retained.
See [LICENSE](LICENSE), [COPYING](COPYING), [NOTICE.md](NOTICE.md) and [LICENSING.md](LICENSING.md).
Every allowlisted build includes SOURCE.html and an application source archive.
