# Independent Strudel album audit

This workspace analyzes the eight supplied recordings and independently checks OpenCode's implementation. Everything authored here stays in this directory. The original `song.strudel`, README, artwork and source MP3s are read-only inputs.

Start with the [audit status and limitations](reports/AUDIT_STATUS.md), [reference measurements](reports/REFERENCE_SUMMARY.md), [validation results](reports/VALIDATION.md), [fidelity status](reports/FIDELITY.md), and [OpenCode integration recommendations](INTEGRATION_GUIDE.md).

## Run

Run from this directory in PowerShell. RTK prefixes follow the workspace rule.

```powershell
rtk proxy python -m venv .venv
rtk proxy .venv/Scripts/python.exe -m pip install -r requirements.lock.txt
rtk proxy npm ci --no-audit --no-fund
rtk proxy .venv/Scripts/python.exe analyze.py
rtk proxy .venv/Scripts/python.exe build_reports.py
rtk proxy .venv/Scripts/python.exe tests/investigate_long.py
rtk proxy node tests/validate.mjs
rtk proxy node tests/browser.mjs
```

FFmpeg/FFprobe paths and the source media directory are configured at the top of `analyze.py`. The browser harness uses installed Chrome at its standard Windows path. `AUDIT_CHROME` can override it; it launches a separate headless profile inside `cache/` and does not attach to the user's browser. No browser download is required.

`ALBUM_ROOT` overrides the implementation root (default: this directory's parent). `PLAYER_URL` optionally points the browser checks at an already running HTML album player. The audit never starts or edits OpenCode's application. Configure environment variables in your shell before invoking the prefixed command.

`album-manifest.json` fixes track identity and order. The expected script names are suggestions until implementation exists; title-based discovery reports differing names and ambiguous matches. Set expected_filename in this isolated manifest to disambiguate. The original `song.strudel` is excluded.

The Node validator exits 0 for complete success, 1 for failures, and 2 when implementation checks remain pending. Some command wrappers collapse nonzero codes. Inspect the JSON statuses. Browser checks use the same convention. PENDING must never count as PASSED.

## What is measured

- Full-file decoding, source hashes, mono peak levels, one-second energy and spectral-change profiles.
- Official Apple catalog preview waveform cross-correlation to check source identity where an exact artist/title match exists. These previews are used only for analysis, cached locally, and not packaged as album content.
- Long-file intro recurrence and whole-cycle waveform correlation to identify a single usable local repetition.
- Librosa beat tracking and onset autocorrelation, global/local chroma key-profile fits, tentative triad candidates on hypothetical four-beat bars, and spectral pitch observations.
- Actual Strudel 1.2.6 transpilation/REPL evaluation/event queries. The isolated loader selects Kabelsalat's shipped ESM entry, because Node otherwise selects its browser IIFE. No runtime functions are mocked.
- Browser WebAudio output capture, decoded RMS/peaks/silence, sound registry lookup, console errors and failed requests. Positive and negative controls establish that page display alone is insufficient.

## What remains unverified

No critical listening was performed. Global key fits do not establish mode conclusively; spectral peaks are not isolated melody/bass notes; onset detections are not a drum transcription; automatic textural boundaries are not certified verses or choruses. The worksheets expose these uncertainties instead of supplying invented notes or section names. They need musician/listener review before being treated as final transcription specifications.

The audit snapshot contains no eight-track implementation or HTML player. Track playback, UI order, MP3 browser resolution and the weighted fidelity rubric therefore remain PENDING. No song is awarded a numerical fidelity score. Browser controls use native synths; production sample-bank/prebake coverage must be matched before judging custom instruments. Each browser capture covers six seconds, not an entire song.

## Supporting audio comparison

For explicitly corresponding reference/render intervals:

```powershell
rtk proxy .venv/Scripts/python.exe tests/compare_audio.py --reference transcriptions/01-babydoll-anchor.wav --render transcriptions/01-babydoll-anchor.wav --duration 10 --output reports/comparison-selftest.json
```

This command is an identity control, not an album fidelity check. Use actual rendered output to compare future arrangements. It reports tempo estimates, chroma DTW cost, and decoded render peaks. It never assigns perceptual similarity. Exact phase alignment and a low DTW cost cannot prove musical recognizability.

After the comparison control has run, `rtk proxy .venv/Scripts/python.exe tests/check_delivery.py` checks all expected deliverables, source hashes, diagnostic probes against the real runtime, and control outcomes.

## Files

- `analysis/`: eight musician review worksheets, with evidence/confidence and three priorities per track.
- `timelines/`: complete ordered candidate chord charts, automatic section proposals, note observations and source metadata.
- `transcriptions/`: short user-source WAV excerpts, timestamped observations and explicitly labeled diagnostic Strudel probes.
- `tests/`: real-runtime validation, browser capture and comparison tools.
- `reports/`: machine-readable results and human-readable summaries, including source integrity and rubric status.
- `cache/`, `.venv/`, `node_modules/`: ignored local analysis/development files.

## Documentation inspected

Checked 2026-10-16: [Strudel REPL evaluation flow](https://strudel.cc/technical-manual/repl/), [package architecture](https://strudel.cc/technical-manual/packages/), and [sample loading and bank naming](https://strudel.cc/learn/samples/). Installed package source was inspected to implement actual REPL evaluation and browser initialization. npm versions are pinned in `package-lock.json`; Python versions are recorded in `requirements.lock.txt`.
