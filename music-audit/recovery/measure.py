"""Measure real captured PCM and create local review audio, without changing reference bytes."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from reference_check import ROOT, FF, sha
import json
import re
import subprocess
import numpy as np
import soundfile as sf

ident=sys.argv[1]
mode=sys.argv[2] if len(sys.argv)>2 else 'recovery'
capture=json.loads((ROOT/'reports'/(mode+'-browser.json')).read_text())
row=next(t for t in capture['tracks'] if t['id']==ident)
raw=ROOT/row['pcm_file'];sr=row['sample_rate']
samples=np.fromfile(raw,dtype='<f4').reshape(-1,2)
folder=ROOT/'artifacts/recovery'
wav=folder/(ident+'-render.wav')
sf.write(wav,samples,sr,subtype='PCM_24')
process=subprocess.run([str(FF),'-hide_banner','-i',str(wav),'-af',
    'loudnorm=I=-16:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True)
match=re.search(r'\{\s*"input_i"[\s\S]*?\}',process.stderr)
if process.returncode or not match:raise RuntimeError(process.stderr[-2000:])
levels=json.loads(match.group())
source=Path(r'C:\Users\LalithReddy.b\Let_It_Happen\album\audio')/(ident+'.mp3')
reference_hash=sha(source)
duration=json.loads((ROOT/'reports/recovery'/(ident+'-vocal.json')).read_text())['interval_s'][1]
reference=folder/(ident+'-reference.wav')
if not reference.exists():
    subprocess.run([str(FF),'-v','error','-i',str(source),'-t',str(duration),'-ac','2','-ar','22050',str(reference)],check=True)
if sha(source)!=reference_hash:raise RuntimeError('Reference bytes changed')
track=ROOT.parent/'tracks/covers'/(ident+'.strudel')
report={'id':ident,'source_code_sha256':sha(track),'original_audio_sha256':reference_hash,
        'capture_code_sha256':row['sha256'],'capture_matches_current_code':row['sha256']==sha(track),
        'capture_status':row['status'],'capture_duration_s':len(samples)/sr,'reference_duration_s':duration,
        'complete_duration_captured':len(samples)/sr>=duration,
        'integrated_lufs':float(levels['input_i']),'true_peak_dbtp':float(levels['input_tp']),
        'loudness_range_lu':float(levels['input_lra']),
        'nonfinite_samples':int((~np.isfinite(samples)).sum()),
        'full_scale_samples':int((np.abs(samples)>=1).sum()),
        'wav_path':str(wav),'critical_listening':'PENDING; this script measures signals only'}
(ROOT/'reports/recovery'/(ident+'-metrics.json')).write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2),flush=True)
