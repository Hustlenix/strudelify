"""Write the music handoff only after exact current scores have full audio evidence."""
from pathlib import Path
import json,hashlib,subprocess
REPO=Path(__file__).resolve().parents[2];AUDIT=REPO/'music-audit';REPORT=AUDIT/'reports'
subprocess.run(['rtk','proxy','python','-X','utf8','music-audit/recovery/status.py'],cwd=REPO,check=True)
state=json.loads((REPORT/'recovery/current-status.json').read_text())
rows=state['tracks']
if len(rows)!=8 or not all(t['current_complete_audio'] for t in rows):raise SystemExit('All eight matching full captures are required; handoff is not final')
if any(t['clipped_samples'] for t in rows):raise SystemExit('Clipping remains')
catalog=json.loads((REPO/'tracks/covers/catalog.json').read_text())
required={'id','title','artist','codeUrl','bpm','genre','status'}
for i,t in enumerate(catalog,1):
    if not required<=t.keys() or not t['id'].startswith(f'{i:02}-'):raise SystemExit('Catalog order/schema failed')
    if t['status'] not in ['draft','runtime-verified','listening-reviewed','approved']:raise SystemExit('Invalid catalog status')
    path=(REPO/'tracks/covers'/t['codeUrl']).resolve()
    if not path.is_file() or not path.is_relative_to(REPO/'tracks/covers'):raise SystemExit('Invalid codeUrl')
integrity=json.loads((REPORT/'source-integrity.json').read_text())
for item in integrity:
    if hashlib.sha256(Path(item['path']).read_bytes()).hexdigest()!=item['sha256']:raise SystemExit('Original source hash changed')
(REPORT/'recovery/final-source-integrity.json').write_text(json.dumps({'checked':len(integrity),'all_unchanged':True,'originals':integrity},indent=2)+'\n')
scopes={
'01-babydoll':'192 vocal-contour and 210 accompaniment events across 98.112 seconds replace the old guessed loop. After owner feedback of partial recognition, measured median cent offsets were restored to the 192 vocal notes. The revised pitch centers need fresh listening; guitar tone, missing notes and phrasing still need work.',
'02-without-me':'269 measured G1/D2 bass events replace the unsupported four-root bass loop. Signature riff and upper harmony remain unresolved; do not advertise this as a faithful cover.',
'03-everyday-normal-guy-2':'601 corroborated instrumental note events replace the old repeating tune/harmony across 221.256 seconds. Spoken rap is omitted from the melodic layer.',
'04-sailor-song':'338 vocal-contour and 1116 accompaniment events follow the actual 209.533-second recording interval. Fixed six-subdivision replacement groove removed; meter metadata is still approximate.',
'05-cant-tell-me-nothing':'206 corroborated low-note events replace the guessed bass progression. Sparse instrumental-hook evidence prevented a whole-score replacement. The sample motif and upper harmony remain unresolved.',
'06-love-me-not':'394 vocal-contour and 631 accompaniment events span 213.067 seconds, with measured low notes and transient candidates. Timbre and missing/fragmented notes need listening.',
'07-i-thought-i-saw-your-face-today':'258 vocal-contour and 558 accompaniment events span 170.4 seconds. Percussion is quiet because broad-band transients do not prove a drum instrument.',
'08-lonely':'538 vocal-contour and 78 accompaniment events span 263.064 seconds, plus measured low notes/transients. Source C/E/F/G material replaces the guessed minor-key loop; sample-voice octave errors and sparse accompaniment need review.'}
table='\n'.join(f"| {t['title']} | {t['duration_s']:.2f} | {t['lufs']:.2f} | {t['true_peak_dbtp']:.2f} | {t['clipped_samples']} |" for t in rows)
musical='''# Musical quality review — 18 October 2026

These are instrumental review candidates. **No song is approved and all fidelity scores remain null.**
The owner listened to the earlier Babydoll render and described it as partly recognizable, not fully
correct. Measured vocal intonation was corrected afterward. The latest revision has fresh runtime/audio
evidence and retains `runtime-verified` until fresh listening. Other tracks still need comparative listening.

## Changes and remaining musical issues

'''+''.join(f"### {t['title']}\n\n{scopes[t['id']]}\n\n" for t in rows)+'''
## Complete capture measurements

Real Strudel 1.2.6/WebAudio captures cover each usable reference interval. The captured local score
hashes match the current local files; see `recovery/current-status.json` and per-track metrics/captures.
Line-ending normalization is disclosed separately. No original recording was altered.

| Song | Capture seconds | LUFS | True peak dBTP | Full-scale samples |
|---|---:|---:|---:|---:|
'''+table+'''

All captures contain finite signal and zero full-scale/non-finite samples. Loudness varies and several
tracks remain below the earlier -16±2 LUFS target. Conservative headroom is retained; this is not a
claim of consistent mastering or perceptual similarity. Gain changes preserve note timing and balance.

## Listening and transcription limits

- CREPE/YIN agreement supports pitch observations. It does not identify the intended singer/instrument.
- Basic Pitch/STFT agreement can retain overtones, miss voicing tones or fragment slides and sustained notes.
- Percussion classification is inferred from broad-band transient evidence, not isolated drum stems.
- Source event times preserve real rests and changes over the recording. No verse/chorus names were invented.
- Rap speech was not turned into arbitrary sung notes. Without Me and Can't Tell Me Nothing keep earlier
  upper parts while their hooks remain unresolved. Failed approaches are recorded, not repeatedly regenerated.
- The private `review.html` pairs actual recordings, earlier drafts and current full renders for A/B review.
- The 100-song expansion remains deferred until musical recognition improves.

## Lyrics

Timed lyric drafts are transcribed from the owner's supplied recordings with Whisper small.en, using
local vocal residuals where available. Phrase boundaries use measured word timestamps. No web lyrics
were scraped. Original MP3s, stems and model weights remain private/ignored. The panel identifies the
transcripts as automatic drafts. Wrong words, omitted low-confidence segments and timing errors remain
possible; no transcript has human approval. Timing follows the source, not an asserted exact vocal rendition.
'''
(REPORT/'MUSICAL_QUALITY.md').write_text(musical,encoding='utf-8',newline='\n')
known='# Known issues — current recovery\n\n'+''.join(f"## {t['title']}\n\n{scopes[t['id']]}\n\n" for t in rows)+'''
## Application and review

The original deployed app exposed six demos and none of the requested covers. PR #3 fixed catalog
integration. PR #4 contains the subsequently authorized player/lyrics work. The music-specific
`playback-regressions.json` and its live counterpart record the exact app resource hashes and cases.
Playback verification is separate from musical approval. Older already-open legacy tabs need to reload
to participate in the new cross-tab transport ownership.

Keep the complete score, named sample-map initialization, conservative gains and finite endings.
Resolve `codeUrl` relative to `catalog.json`. No commercial recording or private stem may be committed.
'''
(REPORT/'KNOWN_ISSUES.md').write_text(known,encoding='utf-8',newline='\n')
runtime='''# Runtime evaluation — current music recovery

Eight current score files pass actual Strudel 1.2.6 parsing, REPL evaluation, bounded event queries,
named instrument checks and real full-duration stereo WebAudio captures. Negative controls verify that
missing banks and silence are rejected. Original-source hashes match all 16 preserved album/playlist files.

`recovery/current-status.json` is the current hash/measurement index. Each track has `-runtime.json`,
`-capture.json` and `-metrics.json`. Raw PCM, WAV renders, source excerpts, stems and models stay ignored.
Only code, metadata, transcripts and reports are committed. Audio proof establishes signal generation,
duration and measured headroom; it does not establish musical recognition or approval.

| Song | Capture seconds | LUFS | True peak dBTP | Full-scale samples |
|---|---:|---:|---:|---:|
'''+table+'\n\nApplication transport/lyrics checks are recorded separately in `playback-regressions.json`.\n'
(REPORT/'RUNTIME.md').write_text(runtime,encoding='utf-8',newline='\n')
handoff='''# Music and playback recovery handoff

Music branch: `agent/codex-music`, worktree `C:\\Users\\LalithReddy.b\\strudelify-music`.
Application integration: PR #3; playback/lyrics: PR #4 on `codex/playback-reliability`.
The owner explicitly authorized catalog integration/deployment and then requested player-logic fixes
and a right-side lyric panel while keeping Strudel playback and View code. OpenCode's checkout is untouched.

## Review deliverable

- Eight `.strudel` files and the original-order relative-path `tracks/covers/catalog.json`.
- Eight timed lyric drafts in `tracks/covers/lyrics/`, with automatic-transcription notices.
- Current hash index, real runtime/full-capture evidence, musical report and known issues.
- Original source recordings unchanged; no commercial audio, stems or model weights committed.
- Private A/B listening page generated from matching full captures.

No track is marked approved. The earlier Babydoll render has owner feedback of partial recognition;
its later measured intonation correction still needs listening. Without Me and
Can't Tell Me Nothing still have unresolved hooks/upper harmony; their corrections are bounded bass
repairs. Other source-derived scores need listening for missing notes, octave errors, timbre and drum
classification. Do not call technical playback evidence musical fidelity.

The final music commit SHA is the revision containing this handoff and is reported in the notification.
The 100-song expansion remains deferred. See `reports/MUSICAL_QUALITY.md`, `reports/KNOWN_ISSUES.md`
and `reports/recovery/current-status.json` before extending or approving this catalog.
'''
(AUDIT/'HANDOFF.md').write_text(handoff,encoding='utf-8',newline='\n')
print('Wrote current reports; eight matching full captures; all originals unchanged.')
