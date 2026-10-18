"""Timed lyric drafts transcribed only from the owner's supplied local recordings.

No web lyric scraping, guessed text, uploaded audio or source changes. Model remains ignored.
The transcript is explicitly unreviewed and uncertain ASR segments are omitted.
"""
from pathlib import Path
import sys,json,subprocess,hashlib,shutil
import numpy as np
from faster_whisper import WhisperModel
REPO=Path(__file__).resolve().parents[2];AUDIT=REPO/'music-audit'
FF=Path(r'C:\Users\LalithReddy.b\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe')
durations=[98.112,297.624,221.256,209.533,271.704,213.067,170.4,263.064]
capacity=sys.argv[1] if len(sys.argv)>1 else 'base.en'
model=WhisperModel(capacity,device='cpu',compute_type='int8',cpu_threads=2,
                   download_root=str(AUDIT/'cache/whisper'))
out=REPO/'tracks/covers/lyrics';out.mkdir(exist_ok=True)
for meta,duration in zip(json.loads((REPO/'tracks/covers/catalog.json').read_text()),durations):
    ident=meta['id'];print('TRANSCRIBING',ident,flush=True)
    source=Path(r'C:\Users\LalithReddy.b\Let_It_Happen\album\audio')/(ident+'.mp3')
    before=hashlib.sha256(source.read_bytes()).hexdigest()
    vocal=AUDIT/'artifacts/recovery'/(ident+'-vocal.wav')
    signal=vocal if capacity!='base.en' and vocal.exists() else source
    audio=np.frombuffer(subprocess.check_output([str(FF),'-v','error','-i',str(signal),'-t',str(duration),'-ac','1','-ar','16000','-f','f32le','pipe:1']),dtype='<f4').copy()
    segments,info=model.transcribe(audio,language='en',beam_size=5,word_timestamps=True,
        initial_prompt=meta['title']+'. '+meta['artist']+'. Song lyrics.',
        vad_filter=False,condition_on_previous_text=False,temperature=0)
    cues=[];omitted=[]
    for s in segments:
        # Keep the measured text, never infer words in a missing/low-confidence interval.
        if s.avg_logprob < -.8 or s.no_speech_prob>.7 or s.compression_ratio>2.4:
            omitted.append({'start':s.start,'end':s.end,'reason':'low confidence or repetitive ASR'});continue
        if s.words:
            # Phrase breaks follow measured word boundaries, not invented equal time slots.
            phrase=[]
            for word in s.words:
                phrase.append(word)
                if len(phrase)>=8 or word.word.rstrip().endswith(('.',',','!','?')):
                    cues.append({'start':round(phrase[0].start,2),'end':round(min(phrase[-1].end,duration),2),'text':''.join(w.word for w in phrase).strip()});phrase=[]
            if phrase:cues.append({'start':round(phrase[0].start,2),'end':round(min(phrase[-1].end,duration),2),'text':''.join(w.word for w in phrase).strip()})
        elif s.text.strip():cues.append({'start':round(s.start,2),'end':round(min(s.end,duration),2),'text':s.text.strip()})
    if hashlib.sha256(source.read_bytes()).hexdigest()!=before:raise SystemExit('Original recording changed')
    report={'id':ident,'language':'en','reviewStatus':'draft','method':f'Whisper {capacity} via faster-whisper 1.2.1; '+('local vocal residual' if signal==vocal else 'supplied local recording'),
            'source_sha256':before,'duration':duration,'notice':'Automatic transcript from the supplied recording; words and timing may contain errors. Uncertain segments are omitted.',
            'cues':cues}
    target=out/(ident+'.json')
    if target.exists():
        saved=AUDIT/'artifacts/lyrics-base';saved.mkdir(exist_ok=True)
        if not (saved/target.name).exists():shutil.copyfile(target,saved/target.name)
    target.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8',newline='\n')
    (AUDIT/'reports/recovery'/(ident+'-lyrics.json')).write_text(json.dumps({'id':ident,'source_sha256':before,'cues':len(cues),'omitted':omitted,'status':'ASR_DRAFT_NOT_LISTENING_APPROVED'},indent=2)+'\n')
    print('LYRIC DRAFT READY',ident,len(cues),'cues;',len(omitted),'omitted segments',flush=True)
