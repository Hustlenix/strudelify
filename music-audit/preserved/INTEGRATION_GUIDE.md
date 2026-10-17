# OpenCode integration guide

Audit snapshot: reference project only; no eight-track album scripts or HTML player were found. This guide does not modify the implementation.

1. Read each analysis worksheet before arranging. Its triad and spectral-pitch outputs are candidates requiring listening, not authoritative charts. Confirm meter, downbeats, harmonic rhythm and principal melody before copying any notes.
2. Use one local cycle for Sailor Song (0–209.533 s) and Love Me Not (0–213.067 s). Preview identity and whole-cycle correlation support these intervals. Tail content includes repeated material and is not fully identity-certified.
3. Expose eight separate scripts in the supplied album order. The audit manifest supplies suggested filenames; if actual names differ, set expected_filename in this isolated manifest. Discovery matches titles and flags ambiguous matches. `ALBUM_ROOT` can point to another checkout.
4. Treat `setcps(BPM/60/4)` as valid only after confirming four-beat cycles. The analyzer uses 4/4 as a hypothesis; do not encode its assumptions as facts. Preserve rests, pickups, rhythmic accents, and phrase lengths.
5. Load sample maps explicitly or provide the production prebake to the audit harness. Node runtime checks do not load WebAudio sample resources. The browser harness has native synths and a documented Dirt-Samples map; a missing voice in that map is not proof that no other valid bank supplies it. Match production resources before final compatibility judgment.
6. Serve local MP3s over an HTTP media route with URL-encoded filenames, or use user-selected file blobs. A Windows drive path in an HTTP audio element will not resolve as a media route. Space, ampersand and apostrophe names need correct handling. Use `PLAYER_URL` for the running page; never assume file existence proves browser playback.
7. Regenerate validation reports after scripts appear. Event-query checks sample every measured textural section; browser checks capture six seconds of actual output and flag missing resources, silence and unknown registry names. Full-track rendered comparisons/listening remain required.

## Three priorities per track

### Dominic Fike — Babydoll

1. Validate the main phrase at 0:48.114–0:58.114 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 166.71 BPM, half-time 83.35, and strongest autocorrelation candidate 56.17; confirm A minor against A major, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–1:38.112; verify video pre/post-roll and assign verse/chorus labels by listening.

### Eminem — Without Me

1. Validate the main phrase at 0:54.499–1:04.499 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 112.35 BPM, half-time 56.17, and strongest autocorrelation candidate 112.35; confirm G minor against G major, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–4:57.624; verify video pre/post-roll and assign verse/chorus labels by listening.

### Jon Lajoie — Everyday Normal Guy 2

1. Validate the main phrase at 1:50.628–2:00.628 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 90.67 BPM, half-time 45.33, and strongest autocorrelation candidate 178.21; confirm D minor against A major, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–3:41.256; verify video pre/post-roll and assign verse/chorus labels by listening.

### Gigi Perez — Sailor Song

1. Validate the main phrase at 0:24.148–0:34.148 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 126.05 BPM, half-time 63.02, and strongest autocorrelation candidate 63.02; confirm B major against D# minor, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–3:29.533; use one identified local cycle, not the full 30-minute file.

### Kanye West — Can't Tell Me Nothing

1. Validate the main phrase at 0:45.527–0:55.527 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Resolve the tempo disagreement before building a grid: onset autocorrelation favors about 79.51 BPM, while the default-prior beat tracker chose 107.67 BPM. Audition the approximately 80 BPM interpretation first. The supplied 107.67 BPM bar chart is hypothetical, not a validated harmonic rhythm.
3. Build section contrasts from the measured timeline over 0–4:31.704; verify video pre/post-roll and assign verse/chorus labels by listening.

### Ravyn Lenae — Love Me Not

1. Validate the main phrase at 0:57.110–1:07.110 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 114.84 BPM, half-time 57.42, and strongest autocorrelation candidate 56.79; confirm C major against A minor, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–3:33.067; use one identified local cycle, not the full 30-minute file.

### She & Him — I Thought I Saw Your Face Today

1. Validate the main phrase at 0:00.023–0:10.023 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 156.60 BPM, half-time 78.30, and strongest autocorrelation candidate 79.51; confirm G major against D major, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–2:50.400; verify video pre/post-roll and assign verse/chorus labels by listening.

### Akon — Lonely

1. Validate the main phrase at 1:08.782–1:18.782 against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.
2. Check tracker 90.67 BPM, half-time 45.33, and strongest autocorrelation candidate 90.67; confirm F minor against G# major, then correct bass roots and the low-margin chord candidates.
3. Build section contrasts from the measured timeline over 0–4:23.064; verify video pre/post-roll and assign verse/chorus labels by listening.

## Release gate

All eight source analyses exist, but musical transcription certification is PENDING. Require real runtime evaluation, successful resource loading, audible captured output, correct source-player media selection, full song structure coverage, and listening-backed rubric evidence before describing a cover as faithful. A positive sine control only certifies the test pipeline.
