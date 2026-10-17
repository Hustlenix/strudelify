"""Assemble the music review handoff only after current-hash checks pass."""
from pathlib import Path
import json,hashlib,re,subprocess,html,sys,importlib.metadata,math
import numpy as np
ROOT=Path(__file__).resolve().parent;REPO=ROOT.parent;COVERS=REPO/'tracks/covers';REPORT=ROOT/'reports'
FF=Path(r'C:\Users\LalithReddy.b\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,v):p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
manifest=load(ROOT/'preserved/album-manifest.json');runtime=load(REPORT/'final-validation.json');browser=load(REPORT/'final-browser.json')
assert len(manifest)==len(runtime['tracks'])==len(browser['tracks'])==8,'Incomplete set'
assert all(x['status']=='PASSED' for x in runtime['selftests']+browser['controls'])
refs={x['id']:x for x in load(REPORT/'reference-check.json')}
base={x['id']:x for x in load(REPORT/'baseline-browser.json')['tracks']}
captures={x['id']:x for x in browser['tracks']};runtimes={x['id']:x for x in runtime['tracks']}
genres=['Indie pop','Hip hop','Comedy hip hop','Indie folk','Hip hop','Alternative R&B','Indie pop','R&B']
catalog=[];checks=[];integrity=[];quality=[];audio_rows=[]
issues=[
 'Only the 0–4.37 s opening has a bounded note-event repair. Later lead contour, G/D/Em/C loop and bass remain unverified against the recording; the source contains different harmonic material. Complete the main vocal motif and harmonic rhythm before approval.',
 'The tonal transpose improves aggregate pitch-class fit, but does not establish the famous riff. The current G/Eb/F/D progression and eighth-note bass are unverified; measured source bass strongly favors G/D. The separated instrumental probe returned no robust f0 sequence, so no replacement riff was guessed.',
 'Mixed-source key estimates conflict and the note probe is sparse. Original A-minor loop retained. Transcribe the recurring instrumental phrase and bass in isolation before changing harmony. Source dynamics/end are implemented; melody, groove and form orchestration are not approved.',
 '94.85 BPM is the strongest refined periodicity in the selected window, with 63/126/190 alternatives. Meter/downbeat and the six-subdivision drum grid remain unresolved. B-centered transpose does not certify the B/E/G#m/F# harmonic sequence or guitar voicings.',
 'F-centered pitch repair and measured headroom are retained. The Fm/Db/Ab/Eb loop, sampled vocal motif and drum placement are unverified. Sparse full-mix note detections were not promoted to a melody.',
 '114 BPM and C-centered pitch fit improve measured alignment. Borrowed harmony/relative-mode details and vocal lead remain unverified. The 16.67 s source energy rise is reflected by the continuous envelope; it is not labeled as a confirmed chorus boundary.',
 '78 BPM is a fixed approximation; source periodicity varies. G-centered transpose is not a complete transcription of the piano, voice or bass. Opening full-mix detections mix registers/instruments and were not substituted as a lead.',
 'F-centered transpose and the eight-subdivision kick repair are retained. The sampled vocal motif, Fm/Db/Bbm/C progression, bass and snare placement need source listening. Source energy/end are followed; the repeating lead is still a draft contour.'
]
for i,t in enumerate(manifest):
    ident=t['id'];p=COVERS/t['expected_filename'];r=runtimes[ident];b=captures[ident];digest=sha(p)
    assert digest==r['sha256']==b['sha256'],f'Stale report: {ident}'
    assert r['status']==b['status']=='PASSED',f'Failed runtime: {ident}'
    assert r['levels_valid'] and r['ending_valid'] and b['capture_duration_valid']
    assert b['samples_at_or_above_0dbfs']==0 and not b['unknown_sounds'] and not b['console_errors'] and not b['failed_requests']
    pcm=np.fromfile(ROOT/b['pcm_file'],dtype='<f4').reshape(-1,b['channels'])
    assert len(pcm)==b['frames'] and np.isfinite(pcm).all()
    assert np.max(np.abs(pcm))<1
    bpm=float(re.search(r'setcps\(([\d.]+)',p.read_text(encoding='utf-8'))[1])
    assert bpm==r['bpm']
    catalog.append({'id':ident,'title':t['title'],'artist':t['artist'],'codeUrl':'./'+p.name,'bpm':bpm,'genre':genres[i],'status':'runtime-verified'})
    ref=load(ROOT/'preserved/timelines'/f'{ident}.json')
    source=Path(refs[ident]['source']);original=Path(ref['source_path'])
    for label,file in [('album copy',source),('original playlist',original)]:
        digest_source=sha(file);assert digest_source==ref['sha256']
        integrity.append({'id':ident,'kind':label,'path':str(file),'sha256':digest_source,'matches_preserved_source':True})
    peak_db=20*math.log10(b['peak']);before_db=20*math.log10(base[ident]['peak'])
    checks.append({'id':ident,'sha256':digest,'node':'PASSED','audio':'PASSED','events':r['event_count'],'finite_end':'PASSED','gain_values':'PASSED','capture_s':round(b['capture_duration_s'],3),'stereo_peak_dbfs':round(peak_db,3),'baseline_stereo_peak_dbfs':round(before_db,3),'samples_at_or_above_0dbfs':0,'capture_only':True})
    quality.append({'id':ident,'listening_status':'NOT_PERFORMED','fidelity_score':None,'approved':False,'reference_interval_s':refs[ident]['reference_interval_s'],'known_issues':issues[i],'evidence':['reference-check.json','adjustments.json','source-form.json',ident+'-note-candidates.json'],'status':'runtime-verified'})
    for mode in ['baseline','final']:
        row=base[ident] if mode=='baseline' else b
        pcmfile=ROOT/row['pcm_file'];wav=ROOT/'artifacts'/f'{mode}-{ident}.wav'
        subprocess.run([str(FF),'-v','error','-y','-f','f32le','-ar',str(row['sample_rate']),'-ac','2','-i',str(pcmfile),'-c:a','pcm_f32le',str(wav)],check=True)
    refwav=ROOT/'artifacts'/f'reference-{ident}.wav'
    subprocess.run([str(FF),'-v','error','-y','-i',str(source),'-t','32','-c:a','pcm_f32le',str(refwav)],check=True)
    name=html.escape(t['artist']+' — '+t['title'])
    cells=''.join(f'<label>{label}<audio controls preload="none" src="artifacts/{mode}-{ident}.wav"></audio></label>' for mode,label in [('reference','Recording · first 32 s'),('baseline','Baseline · first 24 s'),('final','Candidate · first 32 s')])
    audio_rows.append(f'<section><h2>{i+1:02} · {name}</h2><p>{bpm:g} BPM · runtime verified · listening approval pending</p>{cells}<p>{html.escape(issues[i])}</p></section>')
existing=COVERS/'catalog.json'
if existing.exists():assert not any(x.get('status') in ['approved','listening-reviewed'] for x in load(existing)),'Do not overwrite manual review status'
save(existing,catalog)
assert [x['id'] for x in catalog]==[x['id'] for x in manifest]
assert all((COVERS/x['codeUrl']).resolve()==(COVERS/t['expected_filename']).resolve() for x,t in zip(catalog,manifest))
save(REPORT/'delivery-checks.json',{'generated_by':'music-audit/deliver.py','catalog':'PASSED','count':8,'order':'PASSED','current_hashes':'PASSED','original_sources':'PASSED','tracks':checks,'limitations':['Only the first 32 seconds are captured as audio. Later sections have event-query checks, not full-song audio/listening approval.','No perceptual fidelity score or complete transcription certification is assigned.']})
save(REPORT/'source-integrity.json',integrity);save(REPORT/'musical-quality.json',quality)
environment={'python':sys.version,'packages':{}}
for name in ['numpy','scipy','librosa','onnxruntime','torch','basic-pitch','resampy','soundfile','setuptools']:
    try:environment['packages'][name]=importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError:pass
save(REPORT/'environment.json',environment)
runtime_md='# Music runtime evaluation\n\nAll eight current file hashes pass real Strudel 1.2.6 evaluation, full-duration cycle queries, finite-ending checks, valid gain checks, named sample-bank lookup and stereo WebAudio capture. Catalog order, URLs, BPM and source hashes pass. Original MP3s are unchanged.\n\n| Track | Events | Captured seconds | Baseline peak dBFS | Candidate peak dBFS | Samples >= 0 dBFS |\n|---|---:|---:|---:|---:|---:|\n'
runtime_md+='\n'.join(f'| {t["title"]} | {c["events"]} | {c["capture_s"]} | {c["baseline_stereo_peak_dbfs"]} | {c["stereo_peak_dbfs"]} | 0 |' for t,c in zip(manifest,checks))
runtime_md+='\n\nNode controls: valid pattern, invalid method, invalid syntax and silence behaved as expected. Browser controls: positive sine, missing qualified bank and silence behaved as expected.\n\nThese results establish technical behavior for the recorded hashes. Audio captures cover the first 32 seconds, not every musical section. Floating-point PCM was measured before file conversion. DAC clipping and full-track true-peak/LUFS mastering were not assessed. Sample resource URLs are recorded in final-browser.json.\n\nReproduce with the commands in ../README.md. Historical/pre-form capture failures are preserved separately; the HMR/network suspension was corrected by disabling file watching and repeating the capture.\n'
(REPORT/'RUNTIME.md').write_text(runtime_md,encoding='utf-8')
musical='# Musical quality review\n\n**Review candidates; no song is approved. No human critical listening has been performed. All fidelity scores are null.**\n\nKept the original eight arrangements and retained their instrumentation/relative motifs unless a bounded change had specific evidence. Six tonal transposes improve measured pitch-class fit, four tempos follow refined source periodicities, the Lonely kick grid is repaired, six mixes have measured headroom trims, and all eight follow source RMS macro-dynamics with finite endings. Babydoll has a 15-event source-derived opening repair over 0–4.37 s.\n\nPitch-class cosine is an engineering feature comparison, **not a fidelity score**. It ignores note order, musical function and instrument identity. Macro-dynamics are not a complete section arrangement. Most existing lead contours, basslines and harmonic sequences are still unverified; recognizability has not been certified.\n\n| Track | BPM | Status | Main review need |\n|---|---:|---|---|\n'
musical+='\n'.join(f'| {t["title"]} | {c["bpm"]:g} | runtime-verified | {issues[i]} |' for i,(t,c) in enumerate(zip(manifest,catalog)))
musical+='\n\n## Evidence and rejected changes\n\n`adjustments.json` records each discrete adjustment, attempt number and before/after hashes. No entire song was rewritten. The low-margin Everyday Normal Guy 2 pitch suggestion was rejected and its notes retained. Full-mix Basic Pitch outputs are kept as candidates, not authoritative charts. MDX/pYIN probes for Babydoll and Without Me were too sparse for complete lead replacement (12 and 0 accepted short notes). Babydoll opening voicings have explicit event provenance; no missing pitches were filled in.\n\nUse `../review.html` for local reference/baseline/candidate comparisons. They show the actual first windows with independent volume controls. Loop phase, voicing and source downbeats are not fully aligned. A same-window feature comparison cannot replace phrase-by-phrase listening.\n\n## Next approval pass\n\nFor each track, compare its principal motif and bass against the source anchor in preserved/INTEGRATION_GUIDE.md; resolve the listed meter/harmony questions; transcribe semantic sections and transitions from listening; then capture complete arrangements and measure loudness/true peak. Record source/render intervals and reviewer observations before raising status to listening-reviewed or approved. No additional 350-song catalog work has begun.\n'
(REPORT/'MUSICAL_QUALITY.md').write_text(musical,encoding='utf-8')
(REPORT/'KNOWN_ISSUES.md').write_text('# Known music issues and integration requirements\n\n'+ '\n\n'.join(f'## {i+1}. {t["title"]}\n\n{issues[i]}' for i,t in enumerate(manifest))+'''\n\n## Integration requirements for OpenCode

- Resolve `codeUrl` against `tracks/covers/catalog.json`, then evaluate the complete script with Strudel 1.2.6. Preserve `all(...)` transforms and the Babydoll `Pattern`/`Hap`/`TimeSpan` declarations.
- Preload the actual drum-machine sample map. Bare `bd/sd/hh` availability does not prove `RolandTR909_bd`, `RolandTR808_sd` or `LinnDrum_hh` availability. The harness uses `https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json` and verifies requested resources. Missing-bank regression: `s("bd").bank("audit_missing_bank")` must fail.
- The previous audit's unqualified sound lookup and six-second capture were insufficient: a fully loaded baseline produced samples above 0 dBFS in three tracks. Current composition trims resolve the measured windows. Do not remove them to loudness-match MP3 playback.
- These tracks end after their usable reference durations. Playback needs a fresh scheduler start for a new song; seek semantics and application integration are OpenCode responsibilities and were not tested here.
- Macro-dynamic automation and finite ends do not certify complete verse/chorus transcription. Keep the runtime-verified label visible in any music review workflow; do not call these approved faithful covers.
- Never commit original MP3s, source excerpts, stems or model files. This branch contains no commercial audio assets. Local review audio remains ignored.

No application defect is claimed from an untested application. The reproduced defects are in the prior audit's resource checks and in the old composition mixes; application requirements above are handoff requirements, not assertions about OpenCode's current code.
''',encoding='utf-8')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Strudelify · Music review</title><style>body{font:16px/1.6 system-ui;background:#161719;color:#eee;max-width:1100px;margin:32px auto;padding:0 24px}h1{font-size:32px}h2{font-size:21px}p{color:#c4c7cc}section{padding:24px 0;border-top:1px solid #42464d}label{display:inline-grid;gap:8px;margin:8px 20px 16px 0;font-size:13px}audio{width:300px}a{color:#8cdbb0}.notice{padding:20px;background:#282b30;border-radius:8px}</style><h1>Strudelify — music review</h1><p class="notice">Eight review candidates. Runtime verified; musical approval pending. Compare actual recordings with the preserved baseline and current compositions. These windows have different loudness and are not fully aligned to source downbeats. Use one audio control at a time.</p><p><a href="reports/MUSICAL_QUALITY.md">Musical report</a> · <a href="reports/RUNTIME.md">Runtime evidence</a> · <a href="reports/KNOWN_ISSUES.md">Known issues</a></p>'''+''.join(audio_rows)+'''<script>document.addEventListener('play',e=>{if(e.target.tagName==='AUDIO')document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()})},true)</script></html>'''
(ROOT/'review.html').write_text(page,encoding='utf-8')
print(json.dumps({'catalog_entries':len(catalog),'tracks':checks,'source_files_unchanged':len(integrity),'musical_approval':'PENDING'},indent=2))
