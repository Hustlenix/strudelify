# Real application recording tools

These tools record a fresh, isolated Chromium session and its actual synthesized output.
They do not alter the public app or mock its playback engine. Browser dependencies are locked
in the parent audit package. Encoding requires FFmpeg/FFprobe available on the host.

From the repository root on the owner's RTK-equipped Windows host:

```text
rtk proxy node release-audit/public-demo/record_walkthrough.mjs
rtk proxy python release-audit/public-demo/finish_walkthrough.py
```

Generated capture data stays under ignored `release-audit/private/public-demo/`.
The encoding helper refuses to overwrite an existing MP4. Copy deliberately selected, verified
final media into `docs/media/` for the public repository; do not publish raw recordings or private audits.

The committed demo's provenance is in `docs/demo-provenance.json`. The mobile portion is viewport
emulation and the operator is an agent, not an independent listener. Source comments and runtime
state remain visible as captured. No original commercial recording is used.
