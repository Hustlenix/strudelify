"""Create private, title-blind listening fixtures; never fabricates listener results."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, html, json, random, shutil, subprocess

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT.parent / 'strudelify-music/music-audit'
OUT = ROOT / 'release-audit/private/listening'


def main():
    if OUT.exists():
        raise SystemExit('Private review already exists; preserve its random assignment and responses')
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        raise SystemExit('FFmpeg is required for local-only review excerpts')
    catalog = json.loads((AUDIT.parent / 'tracks/covers/catalog.json').read_text())
    current = {track['id']:track for track in json.loads((AUDIT / 'reports/recovery/current-status.json').read_text())['tracks']}
    shuffled = list(catalog)
    random.SystemRandom().shuffle(shuffled)
    OUT.mkdir(parents=True)
    rows, manifest, key = [], [], []
    for index, track in enumerate(shuffled, 1):
        ident = track['id']
        code = AUDIT.parent / 'tracks/covers' / (ident + '.strudel')
        code_hash = hashlib.sha256(code.read_bytes()).hexdigest()
        assert code_hash == current[ident]['sha256'], 'Render/source hash mismatch'
        score_path = AUDIT / 'reports/recovery' / (ident + '-score.json')
        score = json.loads(score_path.read_text()) if score_path.exists() else {}
        first = next((event['start_s'] for event in score.get('lead', []) if event['start_s'] < 30), 0)
        start = round(max(0, first - .25), 2)
        case = f'case-{index:02}'
        for kind in ['render', 'reference']:
            source = AUDIT / 'artifacts/recovery' / (ident + '-' + kind + '.wav')
            destination = OUT / (case + '-' + ('synth' if kind == 'render' else 'reference') + '.wav')
            assert source.is_file()
            subprocess.run(['rtk', 'proxy', ffmpeg, '-v', 'error', '-nostdin', '-ss', str(start), '-i', str(source),
                '-t', '15', '-af', 'loudnorm=I=-23:TP=-3:LRA=7', '-ar', '22050', '-ac', '1', str(destination)], check=True)
        choices = ''.join(f'<option>{html.escape(t["title"])}</option>' for t in catalog)
        rows.append(f'''<section data-case="{case}"><h2>Excerpt {index:02}</h2>
<p>Listen to the synthesized excerpt before opening the reference. No title is shown.</p>
<audio controls preload="none" src="{case}-synth.wav"></audio>
<label>Which song does it suggest?<select><option>Unsure / none</option>{choices}</select></label>
<label>What needs correction?<textarea placeholder="Melody, timing, bass, sound, or no recognizable identity"></textarea></label>
<details><summary>After choosing: hear the supplied recording at the same timestamp</summary>
<audio controls preload="none" src="{case}-reference.wav"></audio><p>Opening this removes blindness for later answers. Note this in your feedback.</p></details></section>''')
        manifest.append({'id':ident, 'title':track['title'], 'artist':track['artist'], 'source_code_sha256':code_hash,
            'reference_file':str(AUDIT / 'artifacts/recovery' / (ident + '-reference.wav')),
            'original_mp3':str(Path('C:/Users/LalithReddy.b/Let_It_Happen/album/audio') / (ident + '.mp3')),
            'reference_original_sha256':score.get('source_sha256'), 'interval_seconds':[start, start + 15],
            'selection_basis':'Candidate interval from first detected lead onset; principal recognizable hook still requires human selection.',
            'signal_preparation':'15 seconds, mono 22050 Hz, loudnorm -23 LUFS / -3 dBTP; timing unchanged; originals untouched.',
            'human_review':None, 'blind_identification':None, 'fidelity_score':None,
            'status':'inspired instrumental study; recognition unestablished; withheld from proposed public artifact'})
        key.append({'case':case, 'id':ident, 'expected_title':track['title']})
    page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Private instrumental listening review</title><style>body{font:16px/1.6 system-ui;max-width:850px;margin:32px auto;padding:0 20px;background:#17191b;color:#eee}section{border-top:1px solid #555;padding:24px 0}audio{display:block;margin:16px 0;max-width:100%}label{display:grid;gap:8px;margin:16px 0}textarea,select,input,button{font:inherit;padding:10px}textarea{min-height:100px}a{color:#9de1bb}</style>
<h1>Private instrumental listening review</h1><p>Local supplied recordings and synthesized review candidates. Do not upload or share the audio.
Use an unprimed listener. Choose by the instrumental alone, then compare. These clips are review candidates,
not assertions that the principal hook was found. Loudness is normalized only in these copies.</p>
<label>Anonymous listener label<input id="listener" placeholder="Listener 1; avoid personal information"></label>
''' + ''.join(rows) + '''<button id="save">Download my review JSON</button><p>No feedback is sent automatically. Responses stay in this browser until you download them.</p>
<script>document.querySelectorAll('audio').forEach(audio=>audio.onplay=()=>document.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause()}));
document.querySelector('#save').onclick=()=>{const result={created_at:new Date().toISOString(),listener:document.querySelector('#listener').value,
cases:[...document.querySelectorAll('section')].map(section=>({case:section.dataset.case,choice:section.querySelector('select').value,observation:section.querySelector('textarea').value,reference_revealed:section.querySelector('details').open}))};
const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='listening-review.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};</script></html>'''
    (OUT / 'index.html').write_text(page, encoding='utf-8', newline='\n')
    (OUT / 'answer-key.json').write_text(json.dumps(key, indent=2), encoding='utf-8')
    report = {'created_at':datetime.now(timezone.utc).isoformat(), 'reference_identity':'Exact locally supplied album/audio MP3 copies; recording editions are not independently authenticated studio masters',
        'tracks':sorted(manifest, key=lambda row:row['id']), 'real_listener_count':0, 'listener_feedback':[],
        'decision':'No composition changed without a listening observation; preserve the strongest candidates and review Babydoll first.'}
    (ROOT / 'release-audit/reports/music-review.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print('Prepared eight private 15-second reference/synth comparisons. Human results: none. Original audio unchanged.')


if __name__ == '__main__':
    main()
