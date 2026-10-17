"""Supporting signal comparisons only. Never emits a perceptual fidelity score."""
import argparse,json
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from analyze import decode
import numpy as np,librosa
p=argparse.ArgumentParser();p.add_argument('--reference',required=True);p.add_argument('--render',required=True);p.add_argument('--start',type=float,default=0);p.add_argument('--render-start',type=float,default=0);p.add_argument('--duration',type=float,default=10);p.add_argument('--output',required=True);args=p.parse_args()
sr=11025
a=decode(args.reference,start=args.start,duration=args.duration);b=decode(args.render,start=args.render_start,duration=args.duration)
def features(y):
 chroma=librosa.feature.chroma_stft(y=y,sr=sr,n_fft=2048,hop_length=256)
 onset=librosa.onset.onset_strength(y=y,sr=sr,n_fft=1024,hop_length=128)
 tempo=librosa.feature.tempo(onset_envelope=onset,sr=sr,hop_length=128)
 return chroma,float(tempo[0])
ca,ta=features(a);cb,tb=features(b)
D,route=librosa.sequence.dtw(X=ca,Y=cb,metric='cosine',global_constraints=True,band_rad=.25)
result={'status':'SUPPORTING_MEASUREMENT','perceptual_similarity':'UNVERIFIED; listening required','source_window_s':[args.start,args.start+len(a)/sr],'render_window_s':[args.render_start,args.render_start+len(b)/sr],'reference_tempo_estimate':ta,'render_tempo_estimate':tb,'tempo_difference_bpm':tb-ta,'chroma_dtw_mean_cost':float(D[-1,-1]/len(route)),'reference_peak_dbfs':float(20*np.log10(np.max(np.abs(a))+1e-12)),'render_peak_dbfs':float(20*np.log10(np.max(np.abs(b))+1e-12)),'render_samples_at_or_above_0dbfs':int(np.sum(np.abs(b)>=1)),'limitations':['DTW tolerates timing distortion; low cost is not proof of accurate rhythm or melody.','Global tempo on short clips is ambiguous.','Use explicitly corresponding intervals; automatic full-song alignment is not implemented.']}
Path(args.output).write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result,indent=2))
