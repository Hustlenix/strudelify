"""Full real-time captures for explicit source-score candidates; at most one gain adjustment.

No listening scores or approvals are inferred. Recordings remain private and unchanged.
"""
from pathlib import Path
import sys,json,subprocess,hashlib,math,shutil,time
AUDIT=Path(__file__).resolve().parents[1];REPO=AUDIT.parent
PY=str(AUDIT/'.venv/Scripts/python.exe')
def run(*args):
    p=subprocess.run(['rtk','proxy',*map(str,args)],cwd=REPO)
    if p.returncode:raise SystemExit(f'Failed command: {args[0]}')
def check(ident):
    track=REPO/'tracks/covers'/(ident+'.strudel')
    source=json.loads((AUDIT/'reports/recovery'/(ident+'-vocal.json')).read_text())
    duration=source['interval_s'][1]
    meta=next(t for t in json.loads((REPO/'tracks/covers/catalog.json').read_text()) if t['id']==ident)
    mode='recovery'+ident[:2]
    inp=AUDIT/'cache'/(ident+'-qa.input.json')
    validation=AUDIT/'reports'/(mode+'-validation.json')
    metrics_path=AUDIT/'reports/recovery'/(ident+'-metrics.json')
    log_path=AUDIT/'reports/recovery'/(ident+'-changes.json')
    def full_capture():
        digest=hashlib.sha256(track.read_bytes()).hexdigest()
        inp.write_text(json.dumps({'code':track.read_text(),'windows':[{'start':i,'end':i+1} for i in range(math.ceil(duration*meta['bpm']/240)+2)]}))
        run('node','--loader','./music-audit/tests/esm-loader.mjs','music-audit/tests/runtime-worker.mjs',inp,AUDIT/'reports/recovery'/(ident+'-runtime.json'))
        validation.write_text(json.dumps({'mode':mode,'tracks':[{'id':ident,'file':str(track),'sha256':digest}]},indent=2))
        run('node','music-audit/tests/capture.mjs',mode,str(math.ceil(duration)+2),ident[:2])
        run(PY,'-X','utf8','music-audit/recovery/measure.py',ident,mode)
        shutil.copyfile(AUDIT/'reports'/(mode+'-browser.json'),AUDIT/'reports/recovery'/(ident+'-capture.json'))
    metrics=json.loads(metrics_path.read_text()) if metrics_path.exists() else {}
    if metrics.get('source_code_sha256')!=hashlib.sha256(track.read_bytes()).hexdigest():full_capture()
    metrics=json.loads(metrics_path.read_text())
    log=json.loads(log_path.read_text())
    if metrics['integrated_lufs'] < -22 and metrics['true_peak_dbtp'] < -5 and not any(x['phase']=='measured-uniform-mix-gain' for x in log):
        factor=round(min(2.5,10**((-3-metrics['true_peak_dbtp'])/20),10**((-19-metrics['integrated_lufs'])/20)),3)
        run(PY,'-X','utf8','music-audit/recovery/gain_adjust.py',ident,str(factor))
        full_capture()
        metrics=json.loads(metrics_path.read_text())
    if (metrics['capture_status']!='PASSED' or not metrics['complete_duration_captured'] or
        metrics['full_scale_samples'] or metrics['nonfinite_samples'] or not metrics['capture_matches_current_code']):
        raise SystemExit(f'{ident}: failed complete-duration audio gate; no automatic repeated adjustment')
    catalog=REPO/'tracks/covers/catalog.json'
    entries=json.loads(catalog.read_text())
    next(t for t in entries if t['id']==ident)['status']='runtime-verified'
    catalog.write_text(json.dumps(entries,indent=2)+'\n')
    print('FULL CAPTURE VERIFIED',ident,metrics['integrated_lufs'],metrics['true_peak_dbtp'],flush=True)
if __name__=='__main__':
    for ident in sys.argv[1:]:
        # An analysis pipeline may be making this explicit candidate in the same turn.
        expected=AUDIT/'reports/recovery'/(ident+'-changes.json')
        deadline=time.time()+3600
        while not expected.exists():
            if time.time()>deadline:raise SystemExit(f'{ident}: analysis not ready; no fabricated result')
            time.sleep(5)
        check(ident)
