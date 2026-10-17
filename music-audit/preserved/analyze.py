"""Reference measurement pipeline. Never edits sources. Estimates are not listening results."""
from pathlib import Path
import json, subprocess, urllib.request, urllib.parse, hashlib, argparse
import numpy as np
import scipy.signal as sig
import librosa

ROOT = Path(__file__).resolve().parent
MEDIA = Path(r'C:\Users\LalithReddy.b\media\playlists')
FF = Path(r'C:\Users\LalithReddy.b\ffmpeg\ffmpeg-master-latest-win64-gpl\bin')
TRACKS = [
 ('01-babydoll','Dominic Fike','Babydoll','Dominic Fike - Babydoll'),
 ('02-without-me','Eminem','Without Me','Eminem - Without Me'),
 ('03-everyday-normal-guy-2','Jon Lajoie','Everyday Normal Guy 2','Everyday Normal Guy 2'),
 ('04-sailor-song','Gigi Perez','Sailor Song','Gigi Perez - Sailor Song'),
 ('05-cant-tell-me-nothing','Kanye West',"Can't Tell Me Nothing",'Kanye West - Can'),
 ('06-love-me-not','Ravyn Lenae','Love Me Not','Ravyn Lenae - Love Me Not'),
 ('07-i-thought-i-saw-your-face-today','She & Him','I Thought I Saw Your Face Today','She & Him - I Thought'),
 ('08-lonely','Akon','Lonely','Akon - Lonely')]
NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
def save(path,obj):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(obj,indent=2,ensure_ascii=False),encoding='utf-8')
def decode(path,sr=11025,start=0,duration=None):
 args=[str(FF/'ffmpeg.exe'),'-v','error','-ss',str(start),'-i',str(path)]
 if duration: args+=['-t',str(duration)]
 args+=['-ac','1','-ar',str(sr),'-f','f32le','pipe:1']
 return np.frombuffer(subprocess.check_output(args),dtype='<f4').copy()
def catalog(artist,title,slug):
 p=ROOT/'cache'/f'{slug}-catalog.json'
 if p.exists(): return json.loads(p.read_text(encoding='utf-8'))
 url='https://itunes.apple.com/search?'+urllib.parse.urlencode({'term':artist+' '+title,'entity':'song','limit':15})
 data=json.load(urllib.request.urlopen(url,timeout=40))
 rows=[x for x in data.get('results',[]) if x.get('trackName','').lower()==title.lower() and x.get('artistName','').lower()==artist.lower()]
 if not rows: return {'status':'PENDING','reason':'No exact artist/title catalog match','query_url':url}
 x=rows[0]; out={k:x.get(k) for k in ['artistName','trackName','trackTimeMillis','previewUrl','trackViewUrl']};out['query_url']=url
 save(p,out); return out
def wave_matches(a,b):
 # Compare waveforms from the same master, independent of DC/gain. No identity claim on weak scores.
 b=b-b.mean(); a=a-a.mean(); n=len(b)
 cross=sig.fftconvolve(a,b[::-1],mode='valid')
 norm=np.sqrt(np.maximum(sig.fftconvolve(a*a,np.ones(n,dtype=np.float32),mode='valid'),1e-12)*np.sum(b*b))
 corr=np.abs(cross/norm)
 peaks,_=sig.find_peaks(corr,distance=2205*20)
 top=sorted(set(peaks.tolist()+[0,len(corr)-1]),key=lambda i:float(corr[i]),reverse=True)[:40]
 return [{'source_offset_s':round(float(i/2205),6),'absolute_correlation':round(float(corr[i]),4)} for i in top]
def fingerprint(y, preview):
 return wave_matches(librosa.resample(y,orig_sr=11025,target_sr=2205),decode(preview,sr=2205))
def key_candidates(chroma):
 major=np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88])
 minor=np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
 c=chroma.mean(axis=1)
 out=[{'key':NAMES[i]+' '+mode,'profile_correlation':round(float(np.corrcoef(c,np.roll(p,i))[0,1]),4)} for mode,p in [('major',major),('minor',minor)] for i in range(12)]
 return sorted(out,key=lambda x:x['profile_correlation'],reverse=True)[:4]
def spectral_notes(S,sr,lo,hi,hop):
 pitch,mag=librosa.piptrack(S=S,sr=sr,n_fft=4096,hop_length=hop,fmin=lo,fmax=hi,threshold=.15)
 ix=mag.argmax(axis=0); strength=mag[ix,np.arange(mag.shape[1])]; hz=pitch[ix,np.arange(pitch.shape[1])]
 valid=(hz>0)&(strength>np.percentile(strength,35)); mids=np.zeros(len(hz),dtype=int); mids[valid]=np.rint(librosa.hz_to_midi(hz[valid])).astype(int)
 counts={librosa.midi_to_note(int(n),unicode=False):int(np.sum(mids[valid]==n)) for n in np.unique(mids[valid])}
 events=[]
 for a in range(0,min(len(hz),int(16*sr/hop)),max(1,int(.125*sr/hop))):
  b=min(len(hz),a+max(1,int(.125*sr/hop))); z=mids[a:b]; z=z[z>0]
  if len(z): events.append({'t_s':round(a*hop/sr,3),'spectral_peak_note':librosa.midi_to_note(int(np.bincount(z).argmax()),unicode=False)})
 return {'top_notes':dict(sorted(counts.items(),key=lambda x:x[1],reverse=True)[:12]),'first_16s_peak_observations':events,'confidence':'LOW: polyphonic spectral peaks can be harmonics; these are not isolated bass or lead transcriptions.'}
def run(track):
 slug,artist,title,prefix=track
 sources=list(MEDIA.glob(prefix+'*.mp3'))
 if len(sources)!=1: raise RuntimeError(f'{slug}: expected one source, got {sources}')
 source=sources[0]; print('ANALYZING',slug,flush=True)
 metadata=json.loads(subprocess.check_output([str(FF/'ffprobe.exe'),'-v','error','-show_format','-show_streams','-of','json',str(source)],text=True))
 full=decode(source); duration=len(full)/11025
 cat=catalog(artist,title,slug)
 matches=[]
 if cat.get('previewUrl'):
  preview=ROOT/'cache'/f'{slug}-preview.m4a'
  if not preview.exists(): urllib.request.urlretrieve(cat['previewUrl'],preview)
  matches=fingerprint(full,preview)
 catalog_duration=cat.get('trackTimeMillis',0)/1000
 # Coarse full-record measurements identify padding/repetitions and candidate cuts.
 seconds=np.arange(0,int(duration))
 rms=np.array([np.sqrt(np.mean(full[i*11025:(i+1)*11025]**2)) for i in seconds])
 bands=[]
 for i in seconds:
  z=full[i*11025:i*11025+8192]; ft=abs(np.fft.rfft(z,n=8192)); bands.append([np.log1p(np.sum(q)) for q in np.array_split(ft,32)])
 bands=np.array(bands).T
 novelty=np.linalg.norm(np.diff(bands,axis=1),axis=0)
 peaks,_=sig.find_peaks(novelty,distance=10,prominence=max(.1,np.std(novelty)))
 boundary=None; repeat_evidence=None
 if duration>600:
  expected=catalog_duration
  choices=[int(i+1) for i in peaks if abs((i+1)-expected)<20]
  boundary=min(choices,key=lambda i:abs(i-expected)) if choices else expected
  a=librosa.resample(full,orig_sr=11025,target_sr=2205)
  repeats=wave_matches(a,a[5*2205:25*2205].copy())
  repeat_candidates=sorted([x for x in repeats if x['absolute_correlation']>.95 and x['source_offset_s']>65],key=lambda x:x['source_offset_s'])
  if repeat_candidates:
   period=repeat_candidates[0]['source_offset_s']-5
   n=int(round(period*2205)); n=min(n,len(a)-n)
   corr=float(np.corrcoef(a[:n],a[int(round(period*2205)):int(round(period*2205))+n])[0,1])
   repeat_evidence={'repeat_period_s':round(period,3),'whole_cycle_correlation':round(corr,4),'intro_recurrences':repeats}
   if corr>.8: boundary=period
  end=min(duration,float(boundary))
 else: end=duration
 y=full[:int(end*11025)];sr=11025; hop=512
 S=np.abs(librosa.stft(y,n_fft=4096,hop_length=hop))
 chroma=librosa.feature.chroma_stft(S=S**2,sr=sr,n_fft=4096,hop_length=hop)
 onsethop=128
 onset=librosa.onset.onset_strength(y=y,sr=sr,hop_length=onsethop,n_fft=1024)
 tempo,beats=librosa.beat.beat_track(onset_envelope=onset,sr=sr,hop_length=onsethop)
 bpm=float(np.asarray(tempo).reshape(-1)[0]); bt=librosa.frames_to_time(beats,sr=sr,hop_length=onsethop)
 autoc=librosa.autocorrelate(onset,max_size=int(sr/onsethop*2))
 ip,_=sig.find_peaks(autoc[1:]); ip=ip+1;ip=[i for i in ip if 55<=60*sr/onsethop/i<=210]
 candidates=sorted(ip,key=lambda i:autoc[i],reverse=True)[:5]
 tempoc=[{'bpm':round(60*sr/onsethop/i,2),'autocorrelation':round(float(autoc[i]),3)} for i in candidates]
 key=key_candidates(chroma)
 # Triad fit on inferred four-beat bars; labels remain tentative and meter unverified.
 templates=[];labels=[]
 for root in range(12):
  for quality,third in [('',4),('m',3)]:
   t=np.zeros(12);t[[root,(root+third)%12,(root+7)%12]]=1/np.sqrt(3);templates.append(t);labels.append(NAMES[root]+quality)
 templates=np.array(templates); barsec=240/bpm if bpm else 2
 chords=[]
 for a in np.arange(0,end,barsec):
  z=chroma[:,int(a*sr/hop):max(int((a+barsec)*sr/hop),int(a*sr/hop)+1)].mean(axis=1);z=z/(np.linalg.norm(z)+1e-9)
  scores=templates@z;ix=np.argsort(scores)[::-1]
  chords.append({'start_s':round(float(a),2),'end_s':round(min(float(a+barsec),end),2),'triad_candidate':labels[ix[0]],'alternative':labels[ix[1]],'cosine':round(float(scores[ix[0]]),3),'margin':round(float(scores[ix[0]]-scores[ix[1]]),3)})
 # Textural boundary proposals, not claimed verse/chorus labels.
 mfcc=librosa.feature.mfcc(S=librosa.power_to_db(S**2+1e-9),sr=sr,n_mfcc=8)
 features=np.vstack([chroma,mfcc/40])
 n=features.shape[1];w=int(5*sr/hop); nov=np.zeros(n)
 for i in range(w,n-w): nov[i]=np.linalg.norm(features[:,i-w:i].mean(axis=1)-features[:,i:i+w].mean(axis=1))
 pk,_=sig.find_peaks(nov,distance=int(12*sr/hop),prominence=max(.1,np.std(nov)))
 pk=sorted(pk,key=lambda i:nov[i],reverse=True)[:10]; cuts=sorted([0]+[round(float(i*hop/sr),2) for i in pk]+[round(end,2)])
 timeline=[]
 for i,(a,b) in enumerate(zip(cuts[:-1],cuts[1:])):
  z=y[int(a*sr):int(b*sr)];level=20*np.log10(np.sqrt(np.mean(z*z))+1e-12)
  local=chroma[:,int(a*sr/hop):max(int(b*sr/hop),int(a*sr/hop)+1)]
  timeline.append({'id':chr(65+i),'start_s':a,'end_s':b,'rms_dbfs':round(float(level),2),'key_candidate':key_candidates(local)[0]['key'],'function':'UNASSIGNED: intro/verse/chorus/bridge/outro requires listening','boundary_confidence':'LOW: automatic textural change'})
 bass=spectral_notes(S,sr,40,250,hop); upper=spectral_notes(S,sr,250,1500,hop)
 onset_times=librosa.onset.onset_detect(onset_envelope=onset,sr=sr,hop_length=onsethop,units='time')
 intervals=np.diff(bt); stable=float(np.std(intervals)/np.mean(intervals)) if len(intervals) else None
 data={'slug':slug,'title':title,'artist':artist,'source_filename':source.name,'source_path':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
 'source_duration_s':round(duration,3),'catalog':cat,'preview_fingerprint_matches':matches,
 'usable_segment':{'start_s':0,'end_s':round(end,3),'status':'IDENTIFIED_REPEAT_CYCLE' if repeat_evidence and repeat_evidence['whole_cycle_correlation']>.8 else 'PROVISIONAL' if duration>600 else 'FULL_FILE_EXAMINED','evidence': 'Named catalog preview waveform match; first 20-second passage recurs and whole-cycle waveform correlation identifies loop boundary. Tail not exhaustively identity-certified.' if repeat_evidence and repeat_evidence['whole_cycle_correlation']>.8 else 'Full source decoded; semantic boundaries require listening.','end_confidence':'HIGH for repeated-cycle boundary' if repeat_evidence and repeat_evidence['whole_cycle_correlation']>.8 else 'HIGH for file end, not semantic song end'},
 'repeat_evidence':repeat_evidence,'tail_duration_s':round(duration-end,3),'tail_status':'REPEATED SONG detected; remaining tail not exhaustively identity-certified' if repeat_evidence and repeat_evidence['whole_cycle_correlation']>.8 else 'UNIDENTIFIED: see full-record profile' if duration>600 else 'No excluded tail',
 'tempo':{'beat_tracker_bpm':round(bpm,3),'half_time':round(bpm/2,3),'double_time':round(bpm*2,3),'candidates':tempoc,'confidence':'MEDIUM for periodicity; beat level and drift require listening','beat_interval_cv':stable},
 'meter':{'candidate':'4/4','status':'UNVERIFIED hypothesis; beat tracker does not infer time signature'},
 'key_candidates':key,'key_confidence':'LOW/MEDIUM: global chroma profile fit on mixed audio, relative modes may be ambiguous',
 'peak_dbfs':round(float(20*np.log10(np.max(np.abs(full))+1e-12)),3),'mono_decoded_samples_at_or_above_0dbfs':int(np.sum(np.abs(full)>=1)),
 'silent_seconds_below_minus50db':int(np.sum(rms<10**(-50/20))),'timeline':timeline,'chord_chart':chords,'bass_observations':bass,'upper_register_observations':upper,
 'onset_times_first_32s':np.round(onset_times[onset_times<32],3).tolist(),'listening_status':'NOT_PERFORMED: no perceptual similarity or instrument identity claimed'}
 save(ROOT/'timelines'/f'{slug}.json',data)
 save(ROOT/'reports'/f'{slug}-full-record-profile.json',{'duration_s':duration,'per_second_rms_dbfs':np.round(20*np.log10(rms+1e-12),2).tolist(),'spectral_change_candidates_s':(peaks+1).tolist(),'preview_matches':matches})
 save(ROOT/'transcriptions'/f'{slug}-observations.json',{'status':'CANDIDATES_ONLY_NOT_VALIDATED_TRANSCRIPTION','chord_chart':chords,'bass':bass,'upper_register':upper,'onsets_first_32s':data['onset_times_first_32s']})
 return data
if __name__=='__main__':
 for folder in ['analysis','timelines','transcriptions','reports','cache','tests']: (ROOT/folder).mkdir(exist_ok=True)
 parser=argparse.ArgumentParser();parser.add_argument('--track',default='all');args=parser.parse_args()
 manifest=[]
 for tr in TRACKS:
  manifest.append({'id':tr[0],'artist':tr[1],'title':tr[2],'expected_filename':tr[0]+'.strudel','source_prefix':tr[3]})
 save(ROOT/'album-manifest.json',manifest)
 for tr in TRACKS:
  if args.track not in ['all',tr[0]]:continue
  try: run(tr)
  except Exception as exc: save(ROOT/'reports'/f'{tr[0]}-analysis-error.json',{'status':'FAILED','error':repr(exc)}); print('ERROR',tr[0],repr(exc),flush=True)
