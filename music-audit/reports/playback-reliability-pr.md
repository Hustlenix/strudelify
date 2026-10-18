## Changes

- Cancel stale song loads and serialize Strudel evaluation. Stop disconnects existing voices and effect tails.
- Use one transport for songs and editor previews; closing the editor stops its preview.
- Give the newest song selection ownership, including across cooperating Strudelify tabs.
- Preserve older browser-saved covers with distinct IDs so they cannot shadow deployed arrangements.
- Validate/preload actual named instruments, preserve complete View code, and guard stale detail-code requests.
- Restore Back/Forward navigation and use the audio clock for finite song endings.
- Add the requested right-side timed lyrics panel with mobile open/close controls. Lyrics are automatic drafts
  from the owner's supplied recordings, with uncertain segments omitted and a visible draft notice.
- Include source-derived score candidates and measured bass corrections as they complete full capture review.

## Evidence and limits

Music-specific regression tooling lives in the separate music audit directory. It exercises the real app,
pinned Strudel runtime, actual catalog/source requests and WebAudio in an isolated Chromium process under
normal autoplay rules. It checks cold-load cancellation, newest-selection ownership, every cover's playback,
silent output after Stop, previews, syntax-error recovery, cross-tab ownership, lyrics, saved-cover migration,
mobile controls and complete View code. Final exact-commit results are recorded before deployment.

Original MP3s and private stems are unchanged and excluded. No song is marked approved. The owner reports
Babydoll as partially recognizable; Without Me and Can't Tell Me Nothing still need hook/upper-harmony
corrections. Source pitch/transient detection and automatic lyrics are review evidence, not listening approval.

The owner explicitly authorized Codex to integrate/deploy and then requested playback-logic fixes and lyrics.
All application edits use an isolated worktree; OpenCode's worktree is untouched.

## Final local checkpoint

All 17 player/lyrics/navigation checks passed on the final application resources under normal autoplay policy. Every current arrangement has a matching full-duration real Strudel/WebAudio capture with zero clipped/non-finite samples. Babydoll received a further measured vocal-intonation correction after the owner reported partial recognition. No musical approval or complete lyric accuracy is claimed.
