# Strudelify music review branch

Ownership: `tracks/covers/**` and `music-audit/**` only. Branch: `agent/codex-music`.
Application implementation belongs to OpenCode. No application files are changed here.

## Review state

These are **review candidates**, not approved faithful covers. Runtime, source integrity,
pitch-class measurements, stereo capture, finite endings and catalog checks are separate
from musical recognition. No human critical-listening review has been performed. Scores
remain null. Macro-dynamic form follows measured recording energy; it does not establish
correct verse/chorus orchestration, bass transcription or complete melodies.

Read `reports/RUNTIME.md`, `reports/MUSICAL_QUALITY.md`, `reports/KNOWN_ISSUES.md`,
and `HANDOFF.md`. `review.html` provides local reference/baseline/candidate audio.
Commercial source excerpts and rendered audio are ignored local artifacts, not Git assets.

## Preservation and provenance

`baseline/` contains the eight original completed album scripts. They were byte-identical
to the application's copies when inspected. `preservation.json` records their hashes and
119 preserved audit/transcription files. `preserved/` is historical evidence; do not treat
its old status reports as the current result. Original MP3s are opened read-only.

The current checks use the supplied numbered MP3s in
`C:\Users\LalithReddy.b\Let_It_Happen\album\audio`. Hashes also match the original
playlist files recorded in the earlier audit. The 30-minute Sailor Song and Love Me Not
files are restricted to their previously identified first cycles, 209.533 and 213.067 s.

## Reproduce music validation

From `C:\Users\LalithReddy.b\strudelify-music`:

```powershell
rtk proxy npm ci --prefix music-audit --no-audit --no-fund
rtk proxy node music-audit/tests/evaluate.mjs --baseline
rtk proxy node music-audit/tests/evaluate.mjs
rtk proxy node music-audit/tests/capture.mjs baseline 24
rtk proxy node music-audit/tests/capture.mjs final 32
rtk proxy music-audit/.venv/Scripts/python.exe -B music-audit/deliver.py
```

Audio capture needs Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`,
network access to the named sample map and assets, and an unsuspended audio renderer.
The harness starts and closes its own Vite server. File watching/HMR are disabled so
report writes cannot reload a capture. A failed first capture caused by network suspension
is preserved in `pre-form-browser.json`; it is not hidden as a passing musical result.

The real Strudel transpiler, REPL, `queryArc`, `Pattern`, `Hap` and WebAudio use **1.2.6**.
No mocked synth or substitute player is used. Hashes describe local source bytes; rerun
checks after a checkout if Git converts line endings. The Node ESM loader selects the shipped
Kabelsalat ESM export instead of its browser IIFE. End checks intentionally expect zero
events after each usable reference duration. PCM capture validates fully qualified names
such as `RolandTR909_bd`, rather than checking `bd` alone.

## Reference analysis and optional note probes

Core analysis requires Python 3.13, NumPy, SciPy and librosa (versions in `reports/environment.json`).
`reference_check.py` measures periodicity and pitch-class fit. `form.py` reads source RMS.
`adjust.py`, `headroom.py`, `babydoll_intro.py` and `form.py` are one-time, guarded editing
steps; **do not rerun them as a routine test**. Their before/after hashes are logged.

Basic Pitch 0.4.0 was run with its ONNX model, without TensorFlow. The upstream package
does not declare Python 3.13 support; these optional probes ran in a controlled local
environment with dependencies installed separately. Most mixed-source note candidates
were rejected as a basis for melody replacement. Babydoll's bounded opening uses only
15 explicitly measured events, with omissions left unfilled.

`stem_probe.py` is an optional diagnostic using local ONNX Runtime/Torch and
UVR-MDX-NET-Inst_HQ_3. Its model hash matches UVR metadata. Its sparse f0 results were
not promoted to complete melodies. Model files and stems stay ignored in `cache/` and
`artifacts/`. No source audio is uploaded to an inference service.

## Sources for runtime/model behavior

- [Strudel sample-bank naming and loading](https://strudel.cc/learn/samples/)
- [Basic Pitch documentation and limitations](https://github.com/spotify/basic-pitch)
- [UVR model metadata](https://github.com/Anjok07/ultimatevocalremovergui/blob/master/models/MDX_Net_Models/model_data/model_data.json)
- [UVR model release](https://github.com/TRvlvr/model_repo/releases/tag/all_public_uvr_models)

## Catalog contract

`tracks/covers/catalog.json` contains exactly the original eight entries. Resolve each
`codeUrl` **relative to the catalog URL**. `runtime-verified` means code and audio checks
passed for the recorded file hash, not that its melody is approved. No commercial MP3,
vocal stem, source excerpt or generated audio recording is committed.
