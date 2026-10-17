"""Signal evidence, not listening certification. Sources are opened read-only."""
import os
from pathlib import Path
ROOT=Path(__file__).resolve().parent
os.environ['NUMBA_CACHE_DIR']=str(ROOT/'cache/numba')
os.environ['MPLCONFIGDIR']=str(ROOT/'cache/matplotlib')
import sys, json, subprocess, hashlib
import numpy as np
import librosa
from scipy import signal

FF=Path(r'C:\Users\LalithReddy.b\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe')
def decode(file,start,duration,sr=22050):
    return np.frombuffer(subprocess.check_output([str(FF),'-v','error','-ss',str(start),'-i',str(file),'-t',str(duration),'-ac','1','-ar',str(sr),'-f','f32le','pipe:1']),dtype='<f4').copy()
def sha(file): return hashlib.sha256(Path(file).read_bytes()).hexdigest()
def cosine(a,b): return float(np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)+1e-12))
def analyze():
    out=[]
    for file in sorted((ROOT/'preserved/timelines').glob('*.json')):
        old=json.loads(file.read_text(encoding='utf-8')); ident=old['slug']
        source=Path(r'C:\Users\LalithReddy.b\Let_It_Happen\album\audio')/(ident+'.mp3')
        start=max(16,old['timeline'][1]['start_s']); duration=min(64,old['usable_segment']['end_s']-start)
        y=decode(source,start,duration,sr=11025)
        S=abs(librosa.stft(y,n_fft=4096,hop_length=256))
        H,_=librosa.decompose.hpss(S)
        chroma=librosa.feature.chroma_stft(S=H**2,sr=11025,n_fft=4096,hop_length=256).mean(axis=1)
        # Previous real-runtime event snapshot supplies actual baseline note durations.
        ev=json.loads((ROOT/f'preserved/reports/{ident}.runtime.json').read_text())
        hist=np.zeros(12)
        for w in ev['windows']:
            for e in w['events']:
                n=e['value'].get('note')
                if n is None: continue
                try: midi=librosa.note_to_midi(n) if isinstance(n,str) else int(n)
                except (ValueError,TypeError): continue
                hist[midi%12]+=max(0,e['end']-e['begin'])
        candidates=sorted([{'semitones':i if i<=6 else i-12,'pitch_class_cosine':round(cosine(chroma,np.roll(hist,i)),5)} for i in range(12)],key=lambda x:x['pitch_class_cosine'],reverse=True)
        # Sub-frame tempo search avoids the coarse FFT-bin BPM in the prior audit.
        onset=librosa.onset.onset_strength(y=y,sr=11025,hop_length=128)
        ac=signal.fftconvolve(onset,onset[::-1],mode='full')[len(onset)-1:]
        ac=ac/(np.arange(len(ac),0,-1))
        def periodicity(bpm):
            lags=(60*11025/128/bpm)*np.arange(1,5)
            return float(np.mean(np.interp(lags,np.arange(len(ac)),ac)))
        search=np.arange(55,195,.05)
        vals=np.array([periodicity(b) for b in search]); peaks,_=signal.find_peaks(vals,distance=30)
        tempi=sorted([{'bpm':round(float(search[i]),2),'periodicity':round(float(vals[i]),4)} for i in peaks],key=lambda x:x['periodicity'],reverse=True)[:8]
        row={'id':ident,'source':str(source),'source_sha256':sha(source),'matches_original_audit':sha(source)==old['sha256'],'reference_interval_s':[start,start+duration],'chroma':chroma.tolist(),'baseline_chroma':hist.tolist(),'transpose_candidates':candidates,'tempo_candidates':tempi,'limitations':['Pitch-class fit cannot validate melody order, individual chord changes, rhythm or instrument identity.','A transpose preserves the old contour; it does not certify that contour.','Periodicity has half/double/triplet alternatives. No meter is inferred.']}
        out.append(row); print(ident,'transpose',candidates[:3],'tempi',tempi[:4],flush=True)
    (ROOT/'reports').mkdir(exist_ok=True)
    (ROOT/'reports/reference-check.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
if __name__=='__main__': analyze()
