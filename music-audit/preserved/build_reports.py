"""Turn measured evidence into cautious musician worksheets and integration notes."""
from pathlib import Path
import json,collections,subprocess,hashlib,datetime
from analyze import ROOT,FF,TRACKS,save
RUBRIC=[('Recognizable melody and motifs',25),('Harmony and bass accuracy',20),('Rhythm and groove',20),('Arrangement and song structure',15),('Instrumentation and timbre',10),('Technical playback reliability',10)]
RECOMMENDATIONS={
 '01-babydoll':'Try a short-decay plucked voice for the pitched motif, a rounded bass voice, and restrained percussion.',
 '02-without-me':'Audition a narrow pulse or filtered saw for the main pitched motif, a short bass, and dry drum samples.',
 '03-everyday-normal-guy-2':'Audition a dry bass/synth combination and compact kick/snare voices; preserve space for an instrumental substitute for the rap rhythm.',
 '04-sailor-song':'Audition plucked or guitar-like harmonic voices with a sustained lead and a gradual density increase.',
 '05-cant-tell-me-nothing':'Audition sustained pad/choir-like harmonic voices against a deep bass and sparse dry drums.',
 '06-love-me-not':'Audition a rounded electric-bass-like voice, short harmonic stabs, and crisp restrained percussion.',
 '07-i-thought-i-saw-your-face-today':'Audition soft piano/plucked harmony and a gentle sustained melody; avoid forcing every layer onto a rigid drum grid.',
 '08-lonely':'Audition a bright high lead to replace the recognizable pitched sample phrase, with a rounded bass and compact drum voices.'}
def clock(s):return f'{int(s)//60}:{s%60:06.3f}'
def write(p,s):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s,encoding='utf-8')
def main():
 all_data=[]; integrity=[];fidelity=[]
 for f in sorted((ROOT/'timelines').glob('*.json')):
  d=json.loads(f.read_text(encoding='utf-8'));slug=d['slug'];all_data.append(d)
  repeat=d.get('repeat_evidence')
  if repeat and repeat['whole_cycle_correlation']>.8:
   d['usable_segment'].update(status='IDENTIFIED_REPEAT_CYCLE',evidence='Named Apple catalog preview matches the local file. Recurring intro and whole-cycle waveform correlation identify one local loop.',end_confidence='HIGH for repetition boundary; semantic intro/outro labels unverified')
   save(f,d)
  source=Path(d['source_path']);current=hashlib.sha256(source.read_bytes()).hexdigest();integrity.append({'track':slug,'source_sha256_before':d['sha256'],'source_sha256_after':current,'unchanged':current==d['sha256']})
  tempo=d['tempo'];end=d['usable_segment']['end_s'];key=d['key_candidates'];matches=d['preview_fingerprint_matches']
  anchor=next((x['source_offset_s'] for x in sorted(matches,key=lambda x:-x['absolute_correlation']) if x['source_offset_s']+10<=end),min(end/2,end-10))
  for label,start in [('intro',0),('anchor',anchor)]:
   out=ROOT/'transcriptions'/f'{slug}-{label}.wav'
   subprocess.run([str(FF/'ffmpeg.exe'),'-v','error','-y','-ss',str(start),'-i',str(source),'-t','10','-ar','22050','-ac','1',str(out)],check=True)
  chordcount=collections.Counter(x['triad_candidate'] for x in d['chord_chart']);topch=', '.join(f'{a} ({b} bars)' for a,b in chordcount.most_common(6))
  bass=', '.join(list(d['bass_observations']['top_notes'])[:6]);upper=', '.join(list(d['upper_register_observations']['top_notes'])[:6])
  fixes=[f'Validate the main phrase at {clock(anchor)}–{clock(anchor+10)} against the anchor WAV; transcribe its contour and attack timing before choosing the lead sound.',f'Check tracker {tempo["beat_tracker_bpm"]:.2f} BPM, half-time {tempo["half_time"]:.2f}, and strongest autocorrelation candidate {tempo["candidates"][0]["bpm"]:.2f}; confirm {key[0]["key"]} against {key[1]["key"]}, then correct bass roots and the low-margin chord candidates.',f'Build section contrasts from the measured timeline over 0–{clock(end)}; '+('use one identified local cycle, not the full 30-minute file.' if repeat else 'verify video pre/post-roll and assign verse/chorus labels by listening.')]
  if slug=='05-cant-tell-me-nothing':fixes[1]='Resolve the tempo disagreement before building a grid: onset autocorrelation favors about 79.51 BPM, while the default-prior beat tracker chose 107.67 BPM. Audition the approximately 80 BPM interpretation first. The supplied 107.67 BPM bar chart is hypothetical, not a validated harmonic rhythm.'
  elements=[f'The actual anchor phrase at {clock(anchor)}–{clock(anchor+10)} (audio supplied; exact melodic transcription PENDING).',f'The bass register and contour: strongest low-frequency peak candidates {bass}; verify fundamentals before using them as notes.',f'The harmonic identity: {key[0]["key"]} / {key[1]["key"]} profile candidates and ordered bar-level triad chart below; no generic chord loop substituted.',f'The source attack pattern: onset timestamps in the first 32 seconds and beat-level ambiguity at {tempo["beat_tracker_bpm"]:.2f} BPM; preserve syncopation after downbeat alignment.',f'The source density and dynamic changes at the measured textural boundaries; use the per-section levels rather than a constant full-band loop.']
  text=f'''# {d['artist']} — {d['title']}

Status: **MEASURED REFERENCE WORKSHEET / TRANSCRIPTION NOT YET VERIFIED BY LISTENING**.
This document is an engineering handoff, not a certified note-for-note chart. No critical listening or perceptual fidelity assessment was performed. Low-confidence candidates must be auditioned before use.

## Source and usable segment

- Filename: `{d['source_filename']}`
- Original location: `{d['source_path']}`
- SHA256: `{d['sha256']}`
- Full decoded length: {clock(d['source_duration_s'])} ({d['source_duration_s']} s).
- Analysis segment: 0–{clock(end)}; {d['usable_segment']['status']}. {d['usable_segment']['evidence']}
- Endpoint confidence: {d['usable_segment']['end_confidence']}.
- Excluded tail: {d['tail_duration_s']} s. {d['tail_status']}.
- Reference peak (decoded mono): {d['peak_dbfs']} dBFS; {d['mono_decoded_samples_at_or_above_0dbfs']} samples at or above 0 dBFS. This does not certify the original stereo master against clipping.
'''
  cat=d['catalog'];url=cat.get('trackViewUrl');best=max(matches,key=lambda x:x['absolute_correlation']) if matches else None
  text+='\n'+(f'Apple catalog identity cross-check: [{cat.get("trackName")}]({url}); catalog duration {cat.get("trackTimeMillis",0)/1000:.3f} s. Strongest normalized waveform match: {best}. Correlation is a signal statistic, not a perceptual similarity score.\n' if best else 'Catalog identity cross-check: **PENDING**; no exact catalog artist/title match was found. Filename is not independent identity verification.\n')
  if repeat:text+=f'\nLong-record investigation: intro recurrence period {repeat["repeat_period_s"]} s; whole-cycle correlation {repeat["whole_cycle_correlation"]}. Additional intro/preview matches are in the JSON. This establishes repetition, while unmatched intervening portions remain unidentified.\n'
  text+=f'''
## Tempo, meter, and rhythmic feel

- Beat-tracker estimate: **{tempo['beat_tracker_bpm']:.3f} BPM**; half-time {tempo['half_time']:.3f}, double-time {tempo['double_time']:.3f}.
- Confidence: {tempo['confidence']}. Beat-interval coefficient of variation: {tempo['beat_interval_cv']}.
- Autocorrelation candidates: `{tempo['candidates']}`. These include rhythmic multiples; the largest peak is not automatically the musical beat.
- Meter: **4/4 is an UNVERIFIED working hypothesis**, not a measured time-signature result.
- Swing, backbeat placement, kick/snare identity, accents, and rap/melodic phrasing: **PENDING listening**. Onset timestamps are measured transients from a full mix, not a drum transcription.

## Tonal center and chord chart

Profile fits: `{key}`. Confidence: {d['key_confidence']}.

Common triad candidates: {topch}. Counts are not an ordered progression. The table below preserves the first 16 inferred bars; the complete ordered chart is in `timelines/{slug}.json` and `transcriptions/{slug}-observations.json`.

Bar duration uses four beats at the estimated tempo, starting at source zero. **The downbeat has not been established.** Triad-only fitting cannot certify extensions, inversions, borrowed chords, or harmonic rhythm. Low margins mean competing chords fit almost equally well. Do not treat these rows as confirmed changes.

| Start | End | Triad candidate | Alternative | Cosine margin |
|---|---|---|---|---|
'''
  text+='\n'.join(f'| {clock(c["start_s"])} | {clock(c["end_s"])} | {c["triad_candidate"]} | {c["alternative"]} | {c["margin"]} |' for c in d['chord_chart'][:16])
  text+=f'''

## Bass and melodic observations

- Low-frequency spectral peak candidates (40–250 Hz): **{bass}**.
- Upper-register spectral peak candidates (250–1500 Hz): **{upper}**.
- Confidence: **LOW**. A prominent spectral peak may be an overtone, accompaniment, or vocal component. Counts measure frames, not note durations.
- Timestamped first-16-second observations are supplied in the transcription JSON. Exact bass rhythms, note lengths, lead phrases, and motif identities remain **PENDING**.
- `transcriptions/{slug}-probe.strudel` sonifies one candidate low-register peak per second. It is a diagnostic probe, not a song motif, bass transcription, or cover.
- Reference clips: [{slug}-intro.wav](../transcriptions/{slug}-intro.wav) (0–10 s), [{slug}-anchor.wav](../transcriptions/{slug}-anchor.wav) ({clock(anchor)}–{clock(anchor+10)}).

## Percussion and instrumentation handoff

Measured full-mix onset positions, first 32 seconds: `{d['onset_times_first_32s']}`.
First align a downbeat by listening; then classify kick/snare/hat events and measure off-grid offsets. Do not quantize these transient detections directly into a drum groove.

Strudel sound-design recommendation (an audition starting point, **not an observed instrument identification**): {RECOMMENDATIONS[slug]} Use documented synth voices or explicitly loaded sample maps. Check registry names and actual fetched audio; a pleasant sound is not proof of fidelity.

## Musical timeline and dynamics

The boundaries below are automatic changes in mixed-audio MFCC/chroma texture over adjacent five-second windows. Confidence is LOW for musical section boundaries. Section letters distinguish intervals, not repeated-chorus identities. Intro/verse/chorus/bridge/outro labels remain **PENDING listening**.

| Segment | Start | End | RMS dBFS | Local key candidate | Function |
|---|---|---|---|---|---|
'''
  text+='\n'.join(f'| {s["id"]} | {clock(s["start_s"])} | {clock(s["end_s"])} | {s["rms_dbfs"]} | {s["key_candidate"]} | Unassigned |' for s in d['timeline'])
  text+='\n\nMatch rises/falls in density and level at these candidate transitions after listening. RMS differences indicate energy changes, not necessarily performance dynamics or chorus boundaries.\n\n## Five elements to preserve\n\n'+'\n'.join(f'{i+1}. {s}' for i,s in enumerate(elements))
  text+='\n\n## Three highest-impact implementation priorities\n\n'+'\n'.join(f'{i+1}. {s}' for i,s in enumerate(fixes))+'\n\nThese are reference-driven priorities, not findings against an arrangement that has not yet been supplied.\n'
  write(ROOT/'analysis'/f'{slug}.md',text)
  observations=d['bass_observations']['first_16s_peak_observations'];notes=[]
  for sec in range(16):
   group=[x['spectral_peak_note'] for x in observations if sec<=x['t_s']<sec+1];notes.append(collections.Counter(group).most_common(1)[0][0].lower() if group else '~')
  write(ROOT/'transcriptions'/f'{slug}-probe.strudel','// DIAGNOSTIC ONLY: one spectral peak candidate per second.\n// Not a melody/bass transcription or a cover. No listening verification.\n'+('// EXPECTED SILENCE: detector found no usable low-register candidates in the first 16 seconds.\n' if not observations else '')+'setcps(1)\n$: note("'+' '.join(notes)+'").slow(16).s("sine").gain(.1)\n')
  if not observations:
   with (ROOT/'analysis'/f'{slug}.md').open('a',encoding='utf-8') as report:report.write('\n\nDiagnostic exception: no usable low-register candidates were detected in the initial 16 seconds. The probe intentionally contains only rests; this does not establish that the source lacks bass.\n')
  fidelity.append({'id':slug,'artist':d['artist'],'title':d['title'],'status':'PENDING','score_out_of_100':None,'reason':'Album implementation absent at this audit snapshot; no perceptual comparison performed','rubric':[{'criterion':name,'weight':weight,'score':None,'status':'PENDING'} for name,weight in RUBRIC],'top_three_reference_priorities':fixes})
 save(ROOT/'reports/source-integrity.json',integrity);save(ROOT/'reports/fidelity.json',fidelity)
 table='| Track | Source length | Analyzed song segment | BPM estimate | Leading key candidates |\n|---|---|---|---|---|\n'+'\n'.join(f'| {d["artist"]} — {d["title"]} | {clock(d["source_duration_s"])} | 0–{clock(d["usable_segment"]["end_s"])} | {d["tempo"]["beat_tracker_bpm"]:.2f} | {d["key_candidates"][0]["key"]} / {d["key_candidates"][1]["key"]} |' for d in all_data)
 write(ROOT/'reports/REFERENCE_SUMMARY.md','# Reference measurements\n\n'+table+'\n\nAll BPM/key values are estimates, not listening-verified results. Both long sources contain repeated named-song material; whole-cycle correlations establish the first usable cycles. Semantic song sections, exact lead/bass transcriptions, drum feel and instrument identities remain unverified. See individual worksheets.\n\nAll source SHA256 hashes matched after analysis.\n')
 write(ROOT/'reports/FIDELITY.md','# Fidelity review\n\nAll eight scores are **PENDING**, with numeric values `null`, because the album implementation is absent and no perceptual comparison was performed. A missing arrangement is not a score of zero, and passing a technical control does not earn a song a fidelity score.\n\n| Criterion | Weight | Current assessment |\n|---|---|---|\n'+'\n'.join(f'| {n} | {w}% | PENDING |' for n,w in RUBRIC)+'\n\nScore each criterion on 0–100 only after evaluating the actual arrangement, then total `sum(weight * score / 100)`. Evidence must identify the source interval, arrangement interval, and observed difference. Keep the total null if any required criterion remains unassessed. Three track-specific reference priorities appear in every worksheet and in fidelity.json.\n')
 write(ROOT/'INTEGRATION_GUIDE.md','# OpenCode integration guide\n\nAudit snapshot: reference project only; no eight-track album scripts or HTML player were found. This guide does not modify the implementation.\n\n1. Read each analysis worksheet before arranging. Its triad and spectral-pitch outputs are candidates requiring listening, not authoritative charts. Confirm meter, downbeats, harmonic rhythm and principal melody before copying any notes.\n2. Use one local cycle for Sailor Song (0–209.533 s) and Love Me Not (0–213.067 s). Preview identity and whole-cycle correlation support these intervals. Tail content includes repeated material and is not fully identity-certified.\n3. Expose eight separate scripts in the supplied album order. The audit manifest supplies suggested filenames; if actual names differ, set expected_filename in this isolated manifest. Discovery matches titles and flags ambiguous matches. `ALBUM_ROOT` can point to another checkout.\n4. Treat `setcps(BPM/60/4)` as valid only after confirming four-beat cycles. The analyzer uses 4/4 as a hypothesis; do not encode its assumptions as facts. Preserve rests, pickups, rhythmic accents, and phrase lengths.\n5. Load sample maps explicitly or provide the production prebake to the audit harness. Node runtime checks do not load WebAudio sample resources. The browser harness has native synths and a documented Dirt-Samples map; a missing voice in that map is not proof that no other valid bank supplies it. Match production resources before final compatibility judgment.\n6. Serve local MP3s over an HTTP media route with URL-encoded filenames, or use user-selected file blobs. A Windows drive path in an HTTP audio element will not resolve as a media route. Space, ampersand and apostrophe names need correct handling. Use `PLAYER_URL` for the running page; never assume file existence proves browser playback.\n7. Regenerate validation reports after scripts appear. Event-query checks sample every measured textural section; browser checks capture six seconds of actual output and flag missing resources, silence and unknown registry names. Full-track rendered comparisons/listening remain required.\n\n## Three priorities per track\n\n'+'\n\n'.join('### '+d['artist']+' — '+d['title']+'\n\n'+'\n'.join(f'{i+1}. {x}' for i,x in enumerate(review['top_three_reference_priorities'])) for d,review in zip(all_data,fidelity))+'\n\n## Release gate\n\nAll eight source analyses exist, but musical transcription certification is PENDING. Require real runtime evaluation, successful resource loading, audible captured output, correct source-player media selection, full song structure coverage, and listening-backed rubric evidence before describing a cover as faithful. A positive sine control only certifies the test pipeline.\n')
 subprocess.run([str(ROOT/'.venv/Scripts/python.exe'),'-m','pip','freeze'],stdout=(ROOT/'requirements.lock.txt').open('w',encoding='utf-8'),check=True)
if __name__=='__main__':main()
