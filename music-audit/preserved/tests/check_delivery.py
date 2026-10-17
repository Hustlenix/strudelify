from pathlib import Path
import json,sys,subprocess,hashlib
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from analyze import ROOT,TRACKS,save
checks=[]
for slug,*_ in TRACKS:
 for part in [f'analysis/{slug}.md',f'timelines/{slug}.json',f'transcriptions/{slug}-observations.json',f'transcriptions/{slug}-probe.strudel',f'transcriptions/{slug}-intro.wav',f'transcriptions/{slug}-anchor.wav']:
  p=ROOT/part;checks.append({'check':part,'status':'PASSED' if p.exists() and p.stat().st_size>0 else 'FAILED'})
 d=json.loads((ROOT/'timelines'/f'{slug}.json').read_text(encoding='utf-8'))
 checks.append({'check':slug+' original unchanged','status':'PASSED' if hashlib.sha256(Path(d['source_path']).read_bytes()).hexdigest()==d['sha256'] else 'FAILED'})
 probe=(ROOT/'transcriptions'/f'{slug}-probe.strudel').read_text(encoding='utf-8')
 ip=ROOT/'cache'/f'{slug}-probe-input.json';op=ROOT/'reports'/f'{slug}-probe.runtime.json';save(ip,{'code':probe})
 cp=subprocess.run(['node','--loader',(ROOT/'tests/esm-loader.mjs').as_uri(),str(ROOT/'tests/runtime-worker.mjs'),str(ip),str(op)],capture_output=True,timeout=30)
 r=json.loads(op.read_text(encoding='utf-8')) if op.exists() else {'status':'FAILED','reason':cp.stderr.decode(errors='replace')}
 intentional_rest=not d['bass_observations']['first_16s_peak_observations'] and r.get('reason')=='No events in requested windows'
 checks.append({'check':slug+' diagnostic probe real Strudel evaluation','status':'PASSED' if intentional_rest else r['status'],'note':'Expected silence: no valid low-register observations in first 16 seconds' if intentional_rest else 'Candidate-note diagnostic; not an album fidelity check'})
for name in ['validation.json','browser.json']:
 data=json.loads((ROOT/'reports'/name).read_text(encoding='utf-8'))
 for c in data['selftests']:checks.append({'check':name+' '+c.get('id',c.get('name')),'status':c['status']})
cmp=json.loads((ROOT/'reports/comparison-selftest.json').read_text())
checks.append({'check':'identity audio-comparison control','status':'PASSED' if cmp['chroma_dtw_mean_cost']<1e-8 and cmp['tempo_difference_bpm']==0 else 'FAILED'})
save(ROOT/'reports/delivery-checks.json',checks)
print(json.dumps({'passed':sum(c['status']=='PASSED' for c in checks),'failed':[c for c in checks if c['status']!='PASSED']},indent=2))
sys.exit(1 if any(c['status']!='PASSED' for c in checks) else 0)
