"""Add measured dynamic form and a finite end, without inventing section names.

The baseline instrumental patterns remain intact. This is macro-dynamic form,
not a claim to have transcribed verse/chorus orchestration or harmonic changes.
"""
from pathlib import Path
import json,re,hashlib,subprocess
import numpy as np
ROOT=Path(__file__).resolve().parent
FF=Path(r'C:\Users\LalithReddy.b\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
logfile=ROOT/'reports/adjustments.json';log=json.loads(logfile.read_text())
evidence=[]
for t in sorted((ROOT/'preserved/timelines').glob('*.json')):
    ref=json.loads(t.read_text());ident=ref['slug'];end=ref['usable_segment']['end_s']
    p=ROOT.parent/'tracks/covers'/(ident+'.strudel');code=p.read_text(encoding='utf-8')
    if 'const sourceDynamics' in code:raise RuntimeError('Form already installed; inspect before adjusting')
    source=Path(r'C:\Users\LalithReddy.b\Let_It_Happen\album\audio')/(ident+'.mp3')
    assert sha(source)==ref['sha256']
    y=np.frombuffer(subprocess.check_output([str(FF),'-v','error','-i',str(source),'-t',str(end),'-ac','1','-ar','2205','-f','f32le','pipe:1']),dtype='<f4')
    rms=np.array([np.sqrt(np.mean(y[i:i+2205]**2)) for i in range(0,len(y),2205)])
    smooth=np.convolve(np.pad(rms,(1,1),mode='edge'),np.ones(3)/3,mode='valid')
    # Compress the source dynamic range for an instrumental cover; never increase a layer's gain.
    env=np.clip(np.sqrt(smooth/(np.percentile(smooth,95)+1e-12)),.05,1)
    values=np.round(env,4).tolist();bpm=float(re.search(r'setcps\(([\d.]+)',code)[1]);cps=bpm/240
    addition='''
// Measured macro-dynamics from the supplied recording; no inferred verse/chorus labels.
// One-second RMS, three-second smoothing, square-root dynamic compression, gain <=1.
// This follows source energy and ends the arrangement; it does not certify section orchestration.
const sourceDynamics = VALUES
const sourceDuration = END
const musicCps = CPS
const sourceLevelAt = seconds => {
  const i = Math.max(0, Math.min(sourceDynamics.length - 1, Math.floor(seconds)))
  const a = sourceDynamics[i], b = sourceDynamics[Math.min(i + 1, sourceDynamics.length - 1)]
  return a + (b - a) * Math.max(0, Math.min(1, seconds - i))
}
all(p => p.filterHaps(h => Number(h.whole.begin) < sourceDuration * musicCps)
  .withHap(h => h.withValue(v => ({...v, gain: (v.gain ?? 1) * sourceLevelAt(Number(h.whole.begin) / musicCps)}))))
'''.replace('VALUES',json.dumps(values,separators=(',',':'))).replace('END',str(end)).replace('CPS',str(cps))
    before=sha(p);p.write_text(code+addition,encoding='utf-8')
    evidence.append({'id':ident,'source_sha256':sha(source),'source_duration_s':end,'bpm':bpm,'envelope':values,'raw_rms':rms.tolist(),'method':'1-second mono RMS; 3-second moving average; sqrt(value/95th percentile), clipped to [.05,1]; linear interpolation between points','limitations':['Macro-dynamic approximation only. Source vocal energy also affects the envelope.','No semantic section boundaries or labels assigned.','Baseline loop harmony and melody after any bounded repair remain unverified.']})
    log.append({'id':ident,'phase':'dynamic-form','attempt':1,'before_sha256':before,'after_sha256':sha(p),'change':f'Source-derived macro-dynamic envelope and finite note onset cutoff at {end}s; no invented semantic boundaries.','decision':'review candidate; node end/level checks and PCM capture required'})
    print(ident,'form samples',len(values),'end',end,flush=True)
(ROOT/'reports/source-form.json').write_text(json.dumps(evidence,indent=2),encoding='utf-8')
logfile.write_text(json.dumps(log,indent=2),encoding='utf-8')
