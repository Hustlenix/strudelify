"""Apply one measured gain correction per mix; never a player workaround."""
from reference_check import ROOT,sha
import json,math
report=json.loads((ROOT/'reports/baseline-browser.json').read_text())
logfile=ROOT/'reports/adjustments.json';log=json.loads(logfile.read_text())
for row in report['tracks']:
    ident=row['id'];p=ROOT.parent/'tracks/covers'/(ident+'.strudel')
    if row['peak']<=.707 or any(x['id']==ident and x['phase']=='headroom' for x in log):continue
    factor=math.floor(.69/row['peak']*100)/100
    before=sha(p);code=p.read_text(encoding='utf-8')
    code+=f'\n// Measured mix headroom: baseline peak {20*math.log10(row["peak"]):.2f} dBFS; retain layer balance.\nall(p => p.withValue(v => ({{...v, gain: (v.gain ?? 1) * {factor}}})))\n'
    p.write_text(code,encoding='utf-8')
    log.append({'id':ident,'phase':'headroom','attempt':1,'before_sha256':before,'after_sha256':sha(p),'change':f'Multiply existing layer gains by {factor}; measured baseline stereo peak {row["peak"]:.6f}, {row["samples_at_or_above_0dbfs"]} samples >=0dBFS in 24-second capture. Target below -3dBFS; final capture must confirm.','decision':'pending final PCM verification'})
    print(ident,factor)
logfile.write_text(json.dumps(log,indent=2),encoding='utf-8')
