# Strudelify website guide

Strudelify is a music library and pattern Studio. Its tracks are synthesized from
Strudel code in your browser. Start at [the website](https://hustlenix.github.io/strudelify/).

## Find your way around

These are website routes, relative to the website address. Open a track without
starting audio; press Play when you are ready.

| Page | Route | What it is for |
| --- | --- | --- |
| Home | `#home` | Return to recent listening, collections and catalog highlights. |
| Explore | `#explore` | Browse artists and mood collections. |
| Search | `#search` | Search titles, artists, moods and collections; filter and sort tracks. |
| Your library | `#library` | Find local playlists, liked tracks and patterns you made. |
| Liked tracks | `#liked` | Play the tracks you have liked on this device. |
| Recently played | `#recent` | Return to your local listening history. |
| Your profile | `#profile` | See local library totals, followed artists, saved collections and display preferences. |
| Help | `#help` | Read playback, Studio and backup guidance. |
| Track | `#track/01-babydoll` | Open Babydoll's arrangement, code and remix controls. |
| Artist | `#artist/Dominic%20Fike` | Browse this artist's available arrangements. |
| Collection | `#collection/Cover%20studies` | Browse the eight cover studies. |
| Your playlist | `#playlist/<playlist-id>` | Open a playlist stored in this browser. |

Artist routes use the exact artist name; collection routes use the exact collection
name. Spaces and punctuation are URL encoded. The other collections are
`#collection/Slow%20burn`, `#collection/Night%20motion` and
`#collection/Soft%20focus`.

## Listen and collect

- Use Play, Pause, Stop, Previous and Next in the persistent player.
- Shuffle changes collection order. Repeat cycles through off, collection and one track.
- Open the queue to add tracks, reorder your next tracks, or remove queued entries.
- Like a track with its heart button. Follow artists and save collections from their pages.
- Create a playlist in Your library, then use a track's options to add it.
- Track notes describe the arrangement. Original recordings and vocals are not included.

The time display follows the audio clock. Finite arrangements show their duration;
open-ended patterns show LIVE. The progress strip displays position and is not a
seek control. Browser or device media controls are available where the platform supports them.

## Make a pattern in Studio

1. Choose **Open Studio** to start a pattern, or **Remix in Studio** on a catalog track.
2. Set a title and credit, then edit the Strudel code. A remix becomes your own local copy.
3. Choose **Preview pattern** to hear the draft. **Stop preview** ends that preview.
4. Choose **Save track** to add the pattern to your local library, or save a new revision.
5. Reopen your pattern with **Edit in Studio** to continue.

Drafts autosave on this device. Resume them from Your library or Studio's draft list.
Studio retains the last 20 changed saves for each local pattern. Opening a saved
version makes a draft; choose Save to commit it. **Download .strudel** keeps a code copy.

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `/` | Open search when you are not typing in a field. |
| Space | Toggle playback when focus is outside form fields, buttons and dialogs. |
| Ctrl/Command + Enter | Preview the current Studio draft. |
| Ctrl/Command + S | Save the current Studio pattern. |
| Tab in the code editor | Insert two spaces. Shift + Tab moves focus out. |

## Keep your library

Open **Library backup** and choose **Download library backup**. The JSON file carries
your local patterns, likes, playlists, drafts, saved versions and supported preferences,
including followed artists and saved collections.

To move devices, open Library backup on the other device, select that JSON file,
review the merge summary, and choose **Merge into my library**. Existing items stay;
conflicting patterns become separate copies. Importing a backup does not play its code.
Current playback, receiving-device recents and playback settings stay as they are.
The active session queue is not part of a backup.

Export before clearing browser data or changing devices. Private browsing, blocked
storage or a full storage quota can prevent saving. If Studio reports a failed save,
download the pattern before closing its tab. Use one Studio tab at a time for editing.

## Share the right thing

Use **Share** on a catalog track, artist or collection to open your device's share
sheet or copy its public link. If clipboard access is unavailable, copy from the
manual-copy dialog. These links open pages; they do not start playback automatically.

Your custom patterns and playlists are device-local. Sending their page URL does not
send their contents. Download the pattern or export your library to transfer them.

## What is included

- Fourteen synthesized catalog tracks: six original instrumentals and eight cover studies.
- The eight studies include Babydoll, Without Me, Everyday Normal Guy 2, Sailor Song,
  Can't Tell Me Nothing, Love Me Not, I Thought I Saw Your Face Today and Lonely.
- The cover studies are not fidelity approved. Playable code is not a claim that an
  arrangement accurately reproduces its reference recording.
- No account or cloud sync is required. Your profile describes this browser's library;
  following an artist does not follow an external streaming account.
- Engine and sample loading require internet access. This is not an offline music download service.

Only preview code you trust: a Strudel pattern is executable JavaScript, not a
sandboxed audio file. See [cover-study notes](COVER_STUDIES.md) and
[licensing details](LICENSING.md) for catalog context.
