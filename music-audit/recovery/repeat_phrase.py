"""Inspect repeating pitched material; reject changing speech as an instrumental motif."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from reference_check import ROOT
import numpy as np
import librosa
from PIL import Image,ImageDraw
import json

ident=sys.argv[1];bpm=float(sys.argv[2]);period=float(sys.argv[3])*60/bpm
path=ROOT/'artifacts/recovery'/(ident+'-vocal.wav')
y,sr=librosa.load(path,sr=11025)
hop=128
S=np.abs(librosa.cqt(y,sr=sr,hop_length=hop,fmin=librosa.midi_to_hz(53),n_bins=36))
# A frequency whitening term reduces permanently present bass overtones.
normal=S/(np.quantile(S,.5,axis=1,keepdims=True)+.02)
normal=np.minimum(normal,30)
grid=np.arange(0,period,.02)
cycles=[]
for start in np.arange(20,len(y)/sr-period,period):
    index=(start+grid)*sr/hop
    cycles.append(np.array([np.interp(index,np.arange(S.shape[1]),r) for r in normal]))
template=np.quantile(np.array(cycles),.75,axis=0)
template=template/(template.max(axis=0,keepdims=True)+1e-8)
pixels=np.uint8(np.clip(template,0,1)*255)
colors=np.stack([pixels,pixels,255-pixels],axis=-1)[::-1]
image=Image.fromarray(colors).resize((1400,720))
canvas=Image.new('RGB',(1510,790),'#151515');canvas.paste(image,(100,20));draw=ImageDraw.Draw(canvas)
for n in range(53,89):
    yy=20+(88-n+.5)*20
    draw.text((2,yy-5),librosa.midi_to_note(n,unicode=False),fill='white')
    draw.line((100,yy+10,1500,yy+10),fill='#555555')
for t in np.arange(0,period,.5):
    xx=100+1400*t/period;draw.text((xx,750),str(round(t,2)),fill='white')
    draw.line((xx,20,xx,740),fill='#555555')
out=ROOT/'artifacts/recovery'/(ident+'-folded.png');canvas.save(out)
print(out,flush=True)
best=np.argmax(template,axis=0)+53
notes=[];i=0
while i<len(best):
    j=i+1
    while j<len(best) and best[j]==best[i]:j+=1
    if j-i>=4:
        notes.append({'phase_s':round(i*.02,3),'end_phase_s':round(j*.02,3),
                      'midi':int(best[i]),'note':librosa.midi_to_note(best[i],unicode=False)})
    i=j
print(json.dumps(notes,indent=2),flush=True)
