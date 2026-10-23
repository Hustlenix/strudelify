# Hustlenix Music 🎧

*A music player built with Strudel. Because apparently, making music wasn't enough.*

![Hustlenix Music](https://github.com/user-attachments/assets/0fe97c3c-edde-46a8-ae17-3c1ac30accae)

I originally started this because my school music teacher wasn't exactly impressed with my voice. So I decided to make music another way: through code.

What started as experimenting with Strudel slowly turned into a whole music player. I wanted something that felt familiar to use, but where the music itself could be created and edited with code.

Welcome to Hustlenix Music.

## Try it out

🎧 **[Listen to Hustlenix Music](https://hustlenix.github.io/strudelify/)**

## What is this?

Hustlenix Music is a browser-based music player powered by [Strudel](https://strudel.cc/), a live coding environment for making music.

The current v0.1 beta has six original instrumental compositions. You can listen to them, search the library, and experiment with the underlying music in the editor.

This isn't trying to be another Spotify. The interesting part is being able to mess with the music itself instead of just pressing play and calling it a day.

## Features

- **Original compositions:** Six instrumental tracks made with Strudel.
- **Playback controls:** Play, pause, resume, and stop your music.
- **Search:** Find tracks in the library.
- **Local library:** Browse the compositions available in the player.
- **Live music editor:** Edit compositions and preview your changes.
- **Browser-based:** Open the player and start experimenting.

This is still a beta, so the project is a work in progress. Famous-song studies aren't included in this release.

## How I built it

The music is created using Strudel, while the player uses HTML, CSS, and JavaScript.

I wanted the interface to feel like a music streaming app without simply copying one. The bigger challenge was bringing the music and the player together so that the compositions could actually be edited and played.

A substantial part of the implementation was developed with Codex. I've included that information in the project so the use of AI is transparent.

## Run it locally

You'll need Python installed to build and preview the project.

1. Clone the repository:

   ```bash
   git clone https://github.com/Hustlenix/strudelify.git
   cd strudelify
