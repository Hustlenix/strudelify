"""Cross-check timed notes against independent reference spectral/period evidence."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from reference_check import ROOT
import json
import numpy as np
import librosa
from scipy.ndimage import median_filter

ident = sys.argv[1]
dest = ROOT/'reports/recovery'
art = ROOT/'artifacts/recovery'
vocal, sr = librosa.load(art/(ident+'-vocal.wav'), sr=16000)
f0 = librosa.yin(vocal, fmin=80, fmax=900, sr=sr,
    frame_length=2048, hop_length=160, trough_threshold=.15)
energy = librosa.feature.rms(y=vocal,frame_length=2048,hop_length=160)[0]
midi = librosa.hz_to_midi(np.nan_to_num(f0, nan=440))
v = json.loads((dest/(ident+'-vocal.json')).read_text())
lead = []
for n in v['notes']:
    a = max(0, int(n['start_s']*100)); b = min(len(midi), int(n['end_s']*100))
    valid = energy[a:b] >= max(.002, float(np.quantile(energy,.9))*.08)
    agreement = float(np.mean(np.abs(midi[a:b][valid]-n['midi'])<.65)) if valid.any() else 0
    covered = float(valid.mean()) if len(valid) else 0
    row = {**n, 'yin_agreement':round(agreement,4), 'yin_coverage':round(covered,4)}
    # Clear independent agreement, or high confidence + some agreement; no scale-forced notes.
    if (agreement >= .72 and covered >= .32) or (agreement >= .50 and covered >= .5 and n['mean_periodicity'] >= .8):
        lead.append(row)

instrumental, sr = librosa.load(art/(ident+'-inst.wav'), sr=22050)
S = np.abs(librosa.stft(instrumental,n_fft=8192,hop_length=256))
freq = librosa.fft_frequencies(sr=sr,n_fft=8192)
chroma = librosa.feature.chroma_stft(S=S**2,sr=sr,n_fft=8192,hop_length=256)
a = json.loads((dest/(ident+'-accompaniment.json')).read_text())
accompaniment = []
for n in a['notes']:
    i = max(0, int((n['start_s']+.03)*sr/256)); j = min(S.shape[1], max(i+1,int((n['end_s']-.02)*sr/256)))
    f = librosa.midi_to_hz(n['midi'])
    band = (freq>=f*2**(-.45/12)) & (freq<=f*2**(.45/12))
    neighborhood = (freq>=f*2**(-2.5/12)) & (freq<=f*2**(2.5/12)) & ~band
    fundamental = S[band,i:j].max(axis=0) if band.any() and j>i else np.zeros(1)
    context = S[neighborhood,i:j].mean(axis=0) if neighborhood.any() and j>i else np.ones_like(fundamental)
    ratio = float(np.median(fundamental/(context+1e-7)))
    prominence = float(np.median(chroma[n['midi']%12,i:j]/(chroma[:,i:j].max(axis=0)+1e-8))) if j>i else 0
    if ratio>=1.6 and prominence>=.2:
        accompaniment.append({**n,'spectral_peak_ratio':round(ratio,3),'pitch_class_prominence':round(prominence,3)})

result = {'id':ident,'source_sha256':v['source_sha256'],
          'status':'CROSS_CHECKED_SOURCE_NOTES_AWAITING_LISTENING',
          'lead_method':'CREPE candidates corroborated by independent YIN difference-function pitch estimates, no quantization or scale projection',
          'accompaniment_method':'Basic Pitch on instrumental corroborated by raw-STFT fundamental peak and frame chroma',
          'lead':lead,'accompaniment':accompaniment,
          'counts':{'lead_candidates':len(v['notes']),'lead_kept':len(lead),
                    'accompaniment_candidates':len(a['notes']),'accompaniment_kept':len(accompaniment)},
          'limits':['Cross-checking is not a human musical/listening review.','Missing and uncertain events are omitted, not filled by generic loops.']}
(dest/(ident+'-score.json')).write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'id':ident,'counts':result['counts'],'lead_first':lead[:12]},indent=2),flush=True)
