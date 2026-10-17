"""Local MDX separation and conservative f0 candidates. Never modifies sources.

Model: UVR-MDX-NET-Inst_HQ_3, verified against UVR's model-data hash.
The model and separated commercial audio stay in ignored local directories.
"""
from reference_check import ROOT,FF,sha
from pathlib import Path
import os,json,hashlib,subprocess,sys,time
os.environ['NUMBA_CACHE_DIR']=str(ROOT/'cache/numba')
import numpy as np, torch, onnxruntime as ort, librosa,soundfile as sf
from scipy.ndimage import median_filter

torch.set_num_threads(2)
MODEL=ROOT/'cache/UVR-MDX-NET-Inst_HQ_3.onnx'
assert hashlib.md5(MODEL.read_bytes()[-10000*1024:]).hexdigest()=='55657dd70583b0fedfba5f67df11d711'
opts=ort.SessionOptions();opts.intra_op_num_threads=2;opts.inter_op_num_threads=1
model=ort.InferenceSession(str(MODEL),opts,providers=['CPUExecutionProvider'])
FFT=6144;HOP=1024;CHUNK=HOP*255;TRIM=FFT//2;GEN=CHUNK-2*TRIM
window=torch.hann_window(FFT)
def spectrum(y):
    z=torch.stft(torch.from_numpy(y),n_fft=FFT,hop_length=HOP,window=window,center=True,return_complex=True)
    return torch.view_as_real(z).permute(0,3,1,2).reshape(1,4,FFT//2+1,256)[:,:,:3072,:].numpy()
def invert(s):
    s=np.pad(s,((0,0),(0,0),(0,1),(0,0)))
    z=torch.from_numpy(s).reshape(2,2,FFT//2+1,256).permute(0,2,3,1).contiguous()
    return torch.istft(torch.view_as_complex(z),n_fft=FFT,hop_length=HOP,window=window,center=True,length=CHUNK).numpy()
def separate(file,start,duration):
    mix=np.frombuffer(subprocess.check_output([str(FF),'-v','error','-ss',str(start),'-i',str(file),'-t',str(duration),'-ac','2','-ar','44100','-f','f32le','pipe:1']),dtype='<f4').reshape(-1,2).T.copy()
    n=mix.shape[1];padded=np.pad(mix,((0,0),(TRIM,GEN+TRIM)))
    instrumental=[]
    for i in range(0,n,GEN):
        x=spectrum(padded[:,i:i+CHUNK]);x[:,:,:3,:]=0
        y=model.run(None,{'input':x})[0]
        instrumental.append(invert(y)[:,TRIM:-TRIM])
    inst=np.concatenate(instrumental,axis=1)[:,:n]*1.022
    vocal=mix-inst
    return mix,inst,vocal
def pitches(y,sr,start):
    mono=librosa.resample(y.mean(axis=0),orig_sr=sr,target_sr=16000)
    f0,voiced,prob=librosa.pyin(mono,sr=16000,fmin=75,fmax=1000,frame_length=2048,hop_length=256,fill_na=np.nan)
    midi=librosa.hz_to_midi(np.nan_to_num(f0,nan=440));rounded=np.rint(midi).astype(int)
    mask=voiced&(prob>=.8)&(np.abs(midi-rounded)<.35)
    # A five-frame majority filter suppresses isolated octave/semitone flashes.
    stable=median_filter(rounded,size=5)
    mask&=rounded==stable
    events=[];i=0
    while i<len(mask):
        if not mask[i]:i+=1;continue
        j=i+1
        while j<len(mask) and mask[j] and rounded[j]==rounded[i]:j+=1
        a=i*256/16000;b=j*256/16000
        if b-a>=.096:events.append({'start_s':round(start+a,4),'end_s':round(start+b,4),'midi':int(rounded[i]),'note':librosa.midi_to_note(rounded[i],unicode=False),'mean_voicing_probability':round(float(prob[i:j].mean()),4),'median_cents_deviation':round(float(np.median(midi[i:j]-rounded[i])*100),2)})
        i=j
    return events,float(mask.mean())
if __name__=='__main__':
    ident=sys.argv[1];start=float(sys.argv[2]);duration=float(sys.argv[3]);part=sys.argv[4] if len(sys.argv)>4 else 'vocal'
    source=Path(r'C:\Users\LalithReddy.b\Let_It_Happen\album\audio')/(ident+'.mp3')
    prefix=ROOT/'artifacts'/f'{ident}-{start:g}-{duration:g}';prefix.parent.mkdir(exist_ok=True)
    instfile=Path(str(prefix)+'-inst.wav');vocalfile=Path(str(prefix)+'-vocal.wav')
    t=time.time()
    if instfile.exists() and vocalfile.exists():
        inst,sr=sf.read(instfile,always_2d=True,dtype='float32');vocal,_=sf.read(vocalfile,always_2d=True,dtype='float32');inst=inst.T;vocal=vocal.T
    else:
        mix,inst,vocal=separate(source,start,duration);sr=44100
        sf.write(instfile,inst.T,sr,subtype='FLOAT');sf.write(vocalfile,vocal.T,sr,subtype='FLOAT')
    print('SEPARATED',ident,part,'seconds',round(time.time()-t,2),flush=True)
    events,voiced=pitches(vocal if part=='vocal' else inst,sr,start)
    report={'id':ident,'source_sha256':sha(source),'reference_interval_s':[start,start+duration],'part':part,'method':'MDX Inst HQ3 (1.022 compensation), pYIN 75-1000 Hz, probability >= .8, within35cents, >=96ms; candidate sequence only','model_sha256':sha(MODEL),'accepted_frame_fraction':voiced,'status':'MEASURED_PITCH_CANDIDATES_NOT_CERTIFIED_MELODY','notes':events}
    (ROOT/'reports'/f'{ident}-stem-{part}-notes.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'notes':len(events),'voiced':voiced,'first':events[:24],'elapsed_s':round(time.time()-t,2)},indent=2),flush=True)
