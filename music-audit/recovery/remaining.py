"""Serial, bounded source-analysis pass for the remaining four recordings.

Creates review candidates; it cannot approve musical recognizability. No original audio
is changed or committed. Each composition refuses a repeated automatic rewrite.
"""
from pathlib import Path
import sys, subprocess, json, math, hashlib

AUDIT=Path(__file__).resolve().parents[1]
REPO=AUDIT.parent
python=str(AUDIT/'.venv/Scripts/python.exe')
items=[('05-cant-tell-me-nothing',271.704,'instrumental'),
       ('06-love-me-not',213.067,'sung'),
       ('07-i-thought-i-saw-your-face-today',170.400,'sung'),
       ('08-lonely',263.064,'sung')]
summary=[]
for ident,duration,profile in items:
    print('BEGIN',ident,flush=True)
    stages=[('transcribe.py',[ident,str(duration),'tiny']),('accompaniment.py',[ident]),
            ('corroborate.py',[ident]),('rhythm.py',[ident]),('compose.py',[ident,profile])]
    for script,args in stages:
        print('STAGE',ident,script,flush=True)
        result=subprocess.run(['rtk','proxy',python,'-X','utf8',str(AUDIT/'recovery'/script),*args],cwd=REPO)
        if result.returncode:raise SystemExit(f'{ident} {script} failed; no automatic retry')
    track=REPO/'tracks/covers'/(ident+'.strudel')
    catalog=json.loads((REPO/'tracks/covers/catalog.json').read_text())
    bpm=next(t['bpm'] for t in catalog if t['id']==ident)
    inp=AUDIT/'cache'/(ident+'-recovery.input.json')
    inp.write_text(json.dumps({'code':track.read_text(),'windows':[{'start':i,'end':i+1} for i in range(math.ceil(duration*bpm/240)+2)]}))
    output=AUDIT/'reports/recovery'/(ident+'-runtime.json')
    result=subprocess.run(['rtk','proxy','node','--loader','./music-audit/tests/esm-loader.mjs','music-audit/tests/runtime-worker.mjs',str(inp),str(output)],cwd=REPO)
    if result.returncode:raise SystemExit(f'{ident} runtime failed; record before adjustment')
    summary.append({'id':ident,'profile':profile,'sha256':hashlib.sha256(track.read_bytes()).hexdigest(),
                    'runtime':json.loads(output.read_text())['status'],'status':'draft','full_audio_capture':'pending'})
    (AUDIT/'reports/recovery/remaining-progress.json').write_text(json.dumps(summary,indent=2)+'\n')
    print('CANDIDATE READY',ident,flush=True)
