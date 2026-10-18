"""Test a short independently published riff hypothesis against the actual supplied recording."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from reference_check import ROOT
import numpy as np
import librosa
import json
from scipy import signal

ident='02-without-me'
folder=ROOT/'artifacts/recovery'
inst,sr=librosa.load(folder/(ident+'-inst.wav'),sr=11025)
voc,_=librosa.load(folder/(ident+'-vocal.wav'),sr=11025)
y=inst+voc
hop=128
C=np.abs(librosa.cqt(y,sr=sr,hop_length=hop,fmin=librosa.midi_to_hz(48),n_bins=48))
# Compare expected note energy to its immediate semitone neighbors at the same time.
contrast=C/((np.roll(C,1,axis=0)+np.roll(C,-1,axis=0))*.5+.002)
contrast=np.clip(contrast,0,5)
times=np.arange(C.shape[1])*hop/sr
# The short published candidate is not accepted until source-frequency support is tested.
notes=[62,70,69,67,62]
results=[]
for subdivision in [.25,.5,1]:
    spacing=60/112*subdivision
    for octave in [-12,0,12]:
        if min(notes)+octave<48 or max(notes)+octave>95:continue
        support=np.zeros(len(times))
        for k,n in enumerate(notes):
            support+=np.interp(times+k*spacing+.06,times,contrast[n+octave-48],right=0)
        support/=len(notes)
        peaks,_=signal.find_peaks(support,distance=int(2*sr/hop),prominence=.15)
        selected=sorted(peaks,key=lambda i:support[i],reverse=True)[:12]
        results.append({'spacing_s':spacing,'octave':octave,'matches':[{'start_s':round(float(times[i]),3),'mean_spectral_contrast':round(float(support[i]),3)} for i in selected]})
out={'id':ident,'candidate_notes':notes,'hypothesis_source':'https://pianoletternotes.blogspot.com/2019/07/without-me-by-eminem.html',
     'status':'TESTED_HYPOTHESIS_NOT_ACCEPTED_TRANSCRIPTION','results':results}
(ROOT/'reports/recovery/02-without-me-hook-hypothesis.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,indent=2),flush=True)
