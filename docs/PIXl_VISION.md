# Strudelify — PIXL flagship vision

Status: planning proposal, not an implementation or a promise of PIXL approval. Date: 2026-10-17.

## Product identity

**Strudelify is a developer-first music platform.** A person who simply wants to listen gets a clean, Spotify-class experience. A curious musician or programmer can open a track's Strudel source, modify it, preview it, fork it, and publish a new revision with attribution.

One-line pitch: **Listen. Fork. Remix. Ship.**

This is not an attempt to duplicate Spotify's proprietary service or commercial catalog. The value is that music is programmable, inspectable, versioned, and remixable.

## Two user experiences

### Listen mode
Browse home, artist and album pages; search; follow creators; queue tracks; use next/previous, shuffle, repeat, likes, playlists, history, and listening controls. Listening does not require opening an editor. Present honest playback state and errors.

### Build mode
Open an arrangement in a code editor; inspect tempo, instruments, sections and metadata; preview safely; compare versions; fork into a new track while retaining attribution; save drafts; submit for publication.

## The developer-native differentiation

1. A published track is **source code + metadata + any explicitly licensed sound dependencies**, not an opaque MP3.
2. Every published version has a stable ID, content hash, and provenance.
3. A fork retains its parent version; a version diff explains what changed.
4. A preview produces verifiable audible playback and a meaningful error if it fails.
5. Community tracks can be tested before they appear in search.
6. Trusted creators can collaborate by reviewing suggested changes rather than overwriting a published arrangement.
7. A listener can enjoy the platform without interacting with any of the developer tools.

## What would count as a compelling demo

Open a creator page → play a code-generated original track → add it to a playlist → open its source → change the bassline → hear a preview → save a version → fork and publish (with moderation checks) → see the remix lineage → discover the new version via search. Reload and verify durable state.

## Explicit exclusions

- No promise of the full Spotify commercial catalog.
- No redistribution of unlicensed MP3s, cover recordings, artwork, lyrics, or sample libraries.
- No assertion that generative code recreates original human vocals.
- No fake AI-generated evaluation scores, user activity, listening counts, or runtime evidence.
- No automatic execution of untrusted community code without a reviewed isolation/security model.
- No premature social feed, billing, advertisements or recommendation algorithm before core playback is reliable.

## Source material

The original eight recordings are private local references for musical study; the repository currently holds separate original demo patterns. Reference-based covers must be labelled as studies until objectively checked, and publicly distributable only after the relevant rights have been reviewed.

## Project naming & licensing checkpoint

Strudel's official FAQ requests that third-party projects avoid using “strudel” in their name; its integration guide identifies AGPL-3.0 obligations. Preserve the current repository identity while exploring a distinct public-facing brand, and complete a licensing/source-availability review before wider publication.

## Definition of flagship quality

Technical depth is demonstrated by durable architecture, versioning, safe execution, reproducible media playback, an indexed catalog, quality gates, actual collaborative workflows, and usable UX. Neither a Spotify-like CSS skin nor 350 unvalidated pattern files is by itself sufficient.
