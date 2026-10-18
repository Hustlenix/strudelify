"""Build the private A/B listening page from actual matching capture reports."""
from pathlib import Path
import json,html,hashlib,datetime
AUDIT=Path(__file__).resolve().parents[1];REPO=AUDIT.parent
rows=[]
for track in json.loads((REPO/'tracks/covers/catalog.json').read_text()):
    ident=track['id'];p=AUDIT/'reports/recovery'/(ident+'-metrics.json')
    report=json.loads(p.read_text()) if p.exists() else {}
    matches=report.get('capture_matches_current_code') and report.get('source_code_sha256')==hashlib.sha256((REPO/'tracks/covers'/(ident+'.strudel')).read_bytes()).hexdigest()
    evidence='Current full-duration render' if matches else 'Capture pending for current code; last render may be older'
    audio=f'<label>Current source-timed candidate<audio controls preload="none" src="artifacts/recovery/{ident}-render.wav"></audio></label>' if matches else ''
    note='Signature riff remains unresolved; measured G1/D2 bass correction only.' if ident.startswith('02') else 'Machine-assisted note/timing candidate. Listen for missing notes, octave errors, timbre and instrument classification.'
    rows.append(f'''<section><h2>{html.escape(track['title'])}</h2><p>{html.escape(track['artist'])} · {track['bpm']} BPM · {track['status']} · Listening approval pending</p><p>{evidence}</p>
<label>Actual recording, usable song cycle<audio controls preload="none" src="artifacts/recovery/{ident}-reference.wav"></audio></label>{audio}
<label>Preserved earlier draft, first 24 seconds<audio controls preload="none" src="artifacts/baseline-{ident}.wav"></audio></label>
<p>{note}</p><p><a href="reports/recovery/{ident}-metrics.json">Signal measurements</a></p></section>''')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Strudelify music review</title>
<style>body{font:16px/1.6 system-ui;background:#161719;color:#eee;max-width:1100px;margin:32px auto;padding:0 24px}h1{font-size:32px}h2{font-size:21px}p{color:#c4c7cc}section{padding:24px 0;border-top:1px solid #42464d}label{display:inline-grid;gap:8px;margin:8px 20px 16px 0;font-size:13px}audio{width:300px}a{color:#8cdbb0}.notice{padding:20px;background:#282b30;border-radius:8px}</style>
<h1>Strudelify — music review</h1><p class="notice">Private comparison with the actual recordings. No track has listening approval. Play one source at a time; different loudness can affect judgment. The synthesized covers omit original vocals and have transcription/instrumentation limitations. Original recordings and renders stay local.</p>
<p><a href="reports/MUSICAL_QUALITY.md">Musical report</a> · <a href="reports/KNOWN_ISSUES.md">Known issues</a> · <a href="https://hustlenix.github.io/strudelify/#home">Public instrumental catalog</a></p>'''+''.join(rows)
(AUDIT/'review.html').write_text(page,encoding='utf-8',newline='\n')
print('Private review page updated',datetime.datetime.now(datetime.timezone.utc).isoformat())
