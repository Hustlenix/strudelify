"""Measure actual transient timings and low notes; never substitute a repeated drum grid."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from reference_check import ROOT
import json
import librosa
import numpy as np
from scipy import signal
from scipy.ndimage import median_filter

ident = sys.argv[1]
root = ROOT/'artifacts/recovery'
out = ROOT/'reports/recovery'
y,sr = librosa.load(root/(ident+'-inst.wav'),sr=22050)
hop = 256
D=librosa.stft(y,n_fft=2048,hop_length=hop)
H,P=librosa.decompose.hpss(D,margin=(2,4))
power=np.abs(P)**2
frequency=librosa.fft_frequencies(sr=sr,n_fft=2048)
bands=[('bd',35,140,.16),('sd',700,4500,.12),('hh',6500,10500,.075)]
drums=[]
for sound,low,high,separation in bands:
    energy=np.sqrt(power[(frequency>=low)&(frequency<=high)].sum(axis=0))
    if energy.max()<1e-4:
        continue
    normalized=energy/(np.quantile(energy,.97)+1e-8)
    peak,_=signal.find_peaks(normalized,height=.38,prominence=.23,distance=max(1,int(separation*sr/hop)))
    for i in peak:
        # Require a noisy transient for snare/hat; guitar harmonic attacks are not a kit.
        selected=power[(frequency>=low)&(frequency<=high),max(0,i-1):i+2].mean(axis=1)+1e-10
        flatness=float(np.exp(np.log(selected).mean())/selected.mean())
        if sound!='bd' and flatness < (.2 if sound=='sd' else .3):
            continue
        time=max(0,(i*hop/sr)-.012)
        drums.append({'start_s':round(time,4),'end_s':round(time+.08,4),'sound':sound,
                      'relative_energy':round(float(min(normalized[i],1.4)),4),
                      'spectral_flatness':round(flatness,4)})
drums.sort(key=lambda n:n['start_s'])

# YIN in a low-passed instrumental plus independent raw spectral-fundamental evidence.
low=signal.sosfiltfilt(signal.butter(5,240,fs=sr,output='sos'),y)
low=librosa.resample(low,orig_sr=sr,target_sr=4000)
f0=librosa.yin(low,fmin=35,fmax=230,sr=4000,frame_length=1024,hop_length=80)
midi_float=librosa.hz_to_midi(f0)
midi=median_filter(np.rint(midi_float).astype(int),size=5)
rms=librosa.feature.rms(y=low,frame_length=1024,hop_length=80)[0]
valid=(rms>=max(.004,np.quantile(rms,.9)*.12))&(np.abs(midi_float-midi)<.4)
spec=np.abs(librosa.stft(low,n_fft=2048,hop_length=80))
freq=librosa.fft_frequencies(sr=4000,n_fft=2048)
bass=[];i=0
while i<len(valid):
    if not valid[i]:i+=1;continue
    j=i+1
    while j<len(valid) and valid[j] and midi[j]==midi[i]:j+=1
    if j-i>=7:
        f=librosa.midi_to_hz(midi[i]);band=(freq>=f*.98)&(freq<=f*1.02)
        around=(freq>=f*.85)&(freq<=f*1.15)&~band
        ratio=float(spec[band,i:j].mean()/(spec[around,i:j].mean()+1e-8)) if band.any() else 0
        if ratio>=1.8:
            bass.append({'start_s':round(i*.02,4),'end_s':round(j*.02,4),'midi':int(midi[i]),
                         'note':librosa.midi_to_note(midi[i],unicode=False),'spectral_peak_ratio':round(ratio,3)})
    i=j
data={'id':ident,'status':'MEASURED_TIMINGS_NOT_LISTENING_APPROVED','drums':drums,'bass':bass,
      'method':'HPSS percussive-band peaks with noisy-transient gates; low-passed YIN bass corroborated by STFT fundamental',
      'limits':['Instruments are inferred from frequency/transient evidence, not isolated drum stems.',
                'No missing event or grid subdivision is filled by a generic beat.']}
(out/(ident+'-rhythm.json')).write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'id':ident,'bass_notes':len(bass),'drums':{s:sum(n['sound']==s for n in drums) for s,_,_,_ in bands},'bass_first':bass[:12]},indent=2),flush=True)
