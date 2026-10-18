"""Visualize raw source spectra around a requested phrase for manual note inspection."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from reference_check import ROOT
import librosa
import numpy as np
import soundfile as sf
from PIL import Image,ImageDraw

ident=sys.argv[1];start=float(sys.argv[2]);duration=float(sys.argv[3])
path=ROOT/'artifacts/recovery'/(ident+'-inst.wav')
y,sr=sf.read(path,start=int(start*44100),stop=int((start+duration)*44100),dtype='float32',always_2d=True)
y=librosa.resample(y.mean(axis=1),orig_sr=sr,target_sr=11025)
C=np.abs(librosa.cqt(y,sr=11025,hop_length=128,fmin=librosa.midi_to_hz(36),n_bins=60,bins_per_octave=12))
db=librosa.amplitude_to_db(C,ref=np.max)
data=np.uint8(np.clip((db+55)/55,0,1)*255)
colors=np.stack((data,np.minimum(data.astype(int)*2,255).astype('uint8'),255-data),axis=-1)[::-1]
image=Image.fromarray(colors).resize((1400,720))
canvas=Image.new('RGB',(1510,800),'#151515');canvas.paste(image,(100,30))
d=ImageDraw.Draw(canvas)
for n in range(36,96):
    ypos=30+(95-n+.5)*12
    if n%12 in [0,2,4,5,7,9,11]:d.text((3,ypos-5),librosa.midi_to_note(n,unicode=False),fill='white')
    d.line((100,ypos+6,1500,ypos+6),fill='#666666',width=1)
for t in np.arange(0,duration,.5):
    x=100+1400*t/duration;d.text((x,765),str(round(start+t,2)),fill='white')
    d.line((x,30,x,750),fill='#444444')
out=ROOT/'artifacts/recovery'/(ident+'-riff.png');canvas.save(out)
print(out)
for t in np.arange(0,duration,.13):
    i=min(C.shape[1]-1,int(t*11025/128));column=C[19:50,max(0,i-2):i+3].mean(axis=1)
    top=np.argsort(column)[-4:][::-1]+55
    print(round(start+t,2),[(librosa.midi_to_note(n,unicode=False),round(float(column[n-55]),2)) for n in top])
