"""One measured, uniform mix-gain adjustment; no note or timing changes."""
from pathlib import Path
import json,sys,hashlib
repo=Path(__file__).resolve().parents[2]
ident=sys.argv[1];factor=float(sys.argv[2])
if not .1<=factor<=3:raise SystemExit('Out of bounded gain range')
track=repo/'tracks/covers'/(ident+'.strudel')
before=track.read_bytes();text=before.decode('utf-8').replace('\r\r\n','\n').replace('\r\n','\n')
if '// Measured uniform mix adjustment' in text:raise SystemExit('Adjustment already present; no automatic retry')
metrics=json.loads((repo/'music-audit/reports/recovery'/(ident+'-metrics.json')).read_text())
if metrics['source_code_sha256']!=hashlib.sha256(before).hexdigest():raise SystemExit('Measurement does not match code')
text+='\n// Measured uniform mix adjustment; preserves source notes, balance and timing.\n'
text+=f'all(p => p.withValue(v => ({{...v,gain:(v.gain ?? 1)*{factor}}})))\n'
track.write_text(text,encoding='utf-8',newline='\n')
logfile=repo/'music-audit/reports/recovery'/(ident+'-changes.json')
log=json.loads(logfile.read_text())
log.append({'phase':'measured-uniform-mix-gain','attempt':1,'factor':factor,'before_metrics':metrics,
 'before_sha256':hashlib.sha256(before).hexdigest(),'after_sha256':hashlib.sha256(track.read_bytes()).hexdigest(),
 'reason':'First full capture is quiet with unused peak headroom. Keep notes/timings unchanged; recapture before restoring runtime status.',
 'decision':'requires new full capture; does not certify musical fidelity'})
logfile.write_text(json.dumps(log,indent=2)+'\n')
print(json.dumps(log[-1],indent=2))
