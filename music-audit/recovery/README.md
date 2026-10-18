# Music recognition recovery

These tools operate only in the music worktree and audit directory. Original recordings are
read-only. Models, stems, reference excerpts and rendered audio remain ignored local files.

The source recordings are essential evidence. Detector output is a transcription candidate,
not a substitute for comparative listening. Rap speech must not be promoted to a sung melody.

## Completed candidate checkpoint

Babydoll has a full source-timed score, independent pitch/spectral corroboration, a real Strudel
event check and a full real-time stereo capture. The original guessed melody and G/D/Em/C
loop have been removed. Full capture: 100.0107 s, -18.37 LUFS, -1.5 dBTP, zero clipped or
non-finite samples. These measurements establish playback/headroom, not musical approval.
The 22-second local listening excerpt is:

`artifacts/recovery/01-babydoll-hook-review.wav` (relative to `music-audit/`).

The owner has been asked to review recognition. No positive review is recorded yet.

Without Me has complete private stems and separate note/rhythm observations. Its detected rap
speech is **not** accepted as a melodic lead. Basic Pitch did not recover the signature riff;
the fold and five-note template experiments did not establish a reliable transcription. Those
failed approaches are evidence of an unresolved issue, not completed melody repairs. Preserve
the prior arrangement until a better supported phrase is ready. Work on the remaining songs
continues separately; do not call the eight repaired based on the first candidate.

## Reproduction

Use the dedicated `music-audit/.venv` with dependencies listed in the earlier environment report,
plus `torchcrepe==0.0.24`. The installed Torch build has no matching Torchaudio wheel; the
`crepe_compat.py` helper replaces only torchcrepe's optional file reader with SoundFile, leaving
the network, packaged weights, decoding and inference unchanged. `transcribe.py` supplies its
own tensors, so it does not call that optional file loader.

```powershell
rtk proxy music-audit/.venv/Scripts/python.exe -X utf8 music-audit/recovery/crepe_compat.py
rtk proxy music-audit/.venv/Scripts/python.exe -X utf8 music-audit/recovery/transcribe.py 01-babydoll 98.112 full
rtk proxy music-audit/.venv/Scripts/python.exe -X utf8 music-audit/recovery/accompaniment.py 01-babydoll
rtk proxy music-audit/.venv/Scripts/python.exe -X utf8 music-audit/recovery/corroborate.py 01-babydoll
rtk proxy music-audit/.venv/Scripts/python.exe -X utf8 music-audit/recovery/rhythm.py 01-babydoll
```

`compose.py` makes one initial event-score candidate from the evidence and refuses repeated
rewrites. Later musical changes are targeted edits with recorded reasons and captures.
The generated sound/bank data must use single-quoted strings: Strudel transforms double-quoted
and backtick strings into Patterns. The runtime worker now rejects unresolved Pattern-valued
sound/bank controls, a defect caught during this repair before its passing full capture.

The attempted offline graph render was abandoned: its context did not initially inherit
Superdough's effect factories, and the next experiment did not complete. Its failure record is
retained as `reports/recovery/01-babydoll-offline-attempt.json`. The candidate's passing evidence
comes from the existing actual **real-time** Strudel/WebAudio capture harness, not that experiment.

## Review limits

- CREPE/YIN agreement supports pitch observations but does not identify the instrument or prove recognition.
- Basic Pitch plus spectral evidence can still miss chord tones or retain overtones.
- Low-note and noisy transient extraction can misclassify instruments; listen before acceptance.
- Keep slides and short inflections under review. Do not force them into a guessed key or fill gaps.
- Runtime status can be restored after checks; `listening-reviewed` and `approved` need real observations.
- On 18 October the owner explicitly authorized Codex catalog integration and deployment. Application edits are isolated in the codex/catalog-integration worktree; the music worktree still owns music files only.
