# Music and playback recovery

All eight current scores have matching full real-time Strudel captures. See ../reports/recovery/current-status.json. No song is musically approved. The owner described an earlier Babydoll render as partly recognizable; its later measured intonation correction still needs listening.

Six scores use corroborated source note and timing events across their usable recording intervals. Without Me and Can't Tell Me Nothing have bounded bass corrections; their hooks and upper parts remain unresolved. Rap speech was not turned into a sung melody. The 100-song expansion remains deferred.

## Ownership and data

Music edits stay in tracks/covers/ and music-audit/ on agent/codex-music. The owner later authorized catalog integration/deployment, then player fixes and lyrics. Application changes use the separate strudelify-catalog worktree on codex/playback-reliability (PR #4). OpenCode's checkout is untouched.

Original MP3s are read-only. Stems, excerpts, renders, raw frames and model weights remain ignored local files. The private ../review.html pairs actual recordings with current full renders. Only code, metadata, transcript drafts and reports are committed.

## Tools and reproduction

Pitch tools use music-audit/.venv and torchcrepe 0.0.24. crepe_compat.py replaces only its optional file loader with SoundFile because no matching Torchaudio wheel exists for the installed Torch build; the network, weights and decoding are unchanged. Inference supplies tensors directly.

The sequence is transcribe.py, accompaniment.py, corroborate.py and rhythm.py, followed by one supported initial compose.py candidate. Later changes are targeted scripts with before/after hashes. compose.py refuses automatic rewrites and rejects sparse instrumental melody evidence. The historical remaining.py stopped at that guard; it is not a regeneration command for current scores.

Run current audio QA from the music worktree:
rtk proxy music-audit/.venv/Scripts/python.exe -X utf8 music-audit/recovery/qa.py 01-babydoll

qa.py permits at most one measured mix-gain correction followed by a full capture. status.py indexes matching hashes; final_reports.py refuses an incomplete full-capture handoff. review_page.py rebuilds the private A/B page.

Lyrics use host Python, faster-whisper 1.2.1 and Whisper small.en:
rtk proxy python -X utf8 music-audit/recovery/lyrics.py small.en

Word timestamps form phrase boundaries. These are automatic drafts from supplied recordings, not web lyrics or human-approved text. Uncertain segments are omitted.

Custom Hap sound/bank data use single-quoted literal strings. Strudel transforms double-quoted strings into Patterns; the runtime worker rejects unresolved instrument controls.

## Application validation

playback-regressions.mjs exercises the real app, pinned runtime, actual requests and WebAudio in isolated Chromium under normal autoplay policy. It checks cancellation, newest-song ownership, all covers, hardware suspension after Stop, previews, syntax errors, other app tabs, saved-cover migration, navigation, matching lyrics, mobile controls and complete View code. App resource hashes must remain unchanged during a run.

The early aggregate probe also observed non-hardware OfflineAudioContext rendering used for reverb impulses. That produced false residual-audio readings. The corrected probe instruments only real AudioContext outputs and separately asserts native suspension. The diagnostic is preserved in ../reports/recovery/offline-context-probe-diagnostic.json; a hardware-only recheck is retained. Earlier full captures selected their first real master-output tap, not the later impulse-generation taps.

The attempted offline whole-song renderer was abandoned and its failure is preserved in 01-babydoll-offline-attempt.json. Passing captures are real-time WebAudio.

Detector agreement does not prove recognition or instrument identity. Missing notes, octave errors, slides, sparse harmony and percussion classification need listening. See ../reports/MUSICAL_QUALITY.md and ../reports/KNOWN_ISSUES.md.
