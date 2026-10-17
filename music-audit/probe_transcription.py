"""Independent machine note candidates. Never a certified transcription."""
from reference_check import ROOT,decode,sha
import os,json,sys
os.environ['NUMBA_CACHE_DIR']=str(ROOT/'cache/numba')
import numpy as np, soundfile as sf, librosa
from basic_pitch.inference import Model,predict
from basic_pitch import ICASSP_2022_MODEL_PATH

model=Model(ICASSP_2022_MODEL_PATH)
intervals={
 '01-babydoll':(0,12),
 '02-without-me':(14.5,17.15),
 '03-everyday-normal-guy-2':(5,16),
 '04-sailor-song':(5,20),
 '05-cant-tell-me-nothing':(7,12),
 '06-love-me-not':(17,16),
 '07-i-thought-i-saw-your-face-today':(0,16),
 '08-lonely':(28,16),
}
for ident,(start,duration) in intervals.items():
    if len(sys.argv)>1 and ident[:2] not in sys.argv[1:]:continue
    source=ROOT.parent/'missing'
    from pathlib import Path
    source=Path(r'C:\Users\LalithReddy.b\Let_It_Happen\album\audio')/(ident+'.mp3')
    y=decode(source,start,duration)
    wav=ROOT/'artifacts'/f'{ident}-probe.wav';wav.parent.mkdir(exist_ok=True)
    sf.write(wav,y,22050)
    print('TRANSCRIBING',ident,flush=True)
    output,midi,notes=predict(wav,model,onset_threshold=.6,frame_threshold=.4,minimum_note_length=140,melodia_trick=False)
    rows=[{'start_s':round(float(a+start),4),'end_s':round(float(b+start),4),'midi':int(n),'note':librosa.midi_to_note(n,unicode=False),'activation':round(float(v),4)} for a,b,n,v,*_ in notes]
    rows.sort(key=lambda x:(x['start_s'],x['midi']))
    obj={'id':ident,'source_sha256':sha(source),'interval_s':[start,start+duration],'method':'Basic Pitch 0.4.0 ONNX CPU, onset .6 frame .4 min140ms, no melodia trick','status':'MACHINE_CANDIDATES_NOT_LISTENING_REVIEWED','limitations':['Full mix, not isolated instruments. False positives, octave errors and omissions possible.','No machine note is accepted as a correct lead solely because it was detected.'],'notes':rows}
    p=ROOT/'reports'/f'{ident}-note-candidates.json';p.parent.mkdir(exist_ok=True)
    p.write_text(json.dumps(obj,indent=2),encoding='utf-8')
    print(ident,len(rows),'candidates',rows[:14],flush=True)
