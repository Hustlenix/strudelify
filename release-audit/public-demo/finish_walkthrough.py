"""Encode a genuine recorded session and its captured synthesis; no replacement music."""
from pathlib import Path
from array import array
import hashlib, json, math, subprocess, sys

ROOT=Path(__file__).resolve().parent
FOLDER=Path(sys.argv[1] if len(sys.argv)>1 else ROOT.parents[1]/'release-audit/private/public-demo').resolve()
capture=json.loads((FOLDER/'capture.json').read_text(encoding='utf-8'))
assert capture['status']=='PASSED'


def run(args,**options):
    return subprocess.run(['rtk','proxy']+args,cwd=FOLDER,check=True,**options)


probe=json.loads(run(['ffprobe','-v','error','-show_format','-of','json',capture['raw_video']],
    capture_output=True,text=True).stdout)
offset=float(probe['format']['duration'])-capture['duration_seconds']
assert 0<=offset<30
subtitles='''1
00:00:00,000 --> 00:00:05,000
Hustlenix Music: six live Strudel instrumentals
Agent-operated recording of the deployed beta

2
00:00:05,000 --> 00:00:13,000
Switch, pause, resume and Stop
Audio comes from this browser's live synthesis

3
00:00:13,000 --> 00:00:18,000
Open the selected track's actual source

4
00:00:18,000 --> 00:00:23,000
Copy the current score into the local editor

5
00:00:23,000 --> 00:00:26,000
Change one musical parameter: tempo, 68 to 100 BPM

6
00:00:26,000 --> 00:00:34,000
Preview the changed code live
Actual scheduler tempo verified: 100 BPM

7
00:00:34,000 --> 00:00:35,000
Closing the editor stops its preview

8
00:00:35,000 --> 00:00:45,000
Responsive browser layout at 390px: emulation
This is not a physical-phone test
'''
(FOLDER/'walkthrough.srt').write_text(subtitles,encoding='utf-8')
video=FOLDER/'hustlenix-music-walkthrough.mp4'
run(['ffmpeg','-hide_banner','-loglevel','error','-nostdin','-n',
    '-i',capture['raw_video'],'-f','f32le','-ar',str(capture['audio']['sample_rate']),'-ac','2','-i','live-audio.f32',
    '-filter_complex',f"[0:v]trim=start={offset:.6f}:duration=45,setpts=PTS-STARTPTS,pad=1280:880:0:0:black,subtitles=walkthrough.srt:force_style='FontName=Arial,FontSize=10,Outline=1,Alignment=2,MarginV=3'[v]",
    '-map','[v]','-map','1:a','-t','45','-r','25','-c:v','libx264','-preset','medium','-crf','20',
    '-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',str(video)])
run(['ffmpeg','-hide_banner','-loglevel','error','-nostdin','-i',str(video),'-f','null','-'])
metadata=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)],capture_output=True,text=True).stdout)
samples=array('f'); samples.frombytes((FOLDER/'live-audio.f32').read_bytes())
rate=capture['audio']['sample_rate']
silences=[]
for first,last,name in [(8.5,9.5,'Pause'),(15,22,'Stop'),(43,44,'Final Stop')]:
    values=samples[int(first*rate)*2:int(last*rate)*2]
    peak=max(map(abs,values),default=0)
    silences.append({'name':name,'peak':peak})
assert all(row['peak']<.00001 for row in silences),silences
report={
    'status':'VERIFIED','public_application_commit':capture['release']['commit'],
    'source_url':capture['url'],'recorded_at':capture['recorded_at'],
    'operator':'Codex-controlled isolated Chromium session; not an independent human review',
    'physical_phone_tested':False,'video':video.name,'duration_seconds':float(metadata['format']['duration']),
    'width':metadata['streams'][0]['width'],'height':metadata['streams'][0]['height'],
    'codecs':[row['codec_name'] for row in metadata['streams']],
    'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'bytes':video.stat().st_size,
    'audio_source':capture['audio']['source'],'audio_sync_limit':capture['audio']['synchronization'],
    'audible_segments':capture['audio']['segments'],'silence_checks':silences,
    'edit':capture['edit'],'events':capture['events'],'decode_errors':[],
    'artwork_notice':'Real screen capture depicts the existing Codex-generated SVG covers. It does not convert those assets into human-made artwork or change their authorship.'}
assert abs(report['duration_seconds']-45)<.1 and report['codecs']==['h264','aac']
(FOLDER/'recording-provenance.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
run(['ffmpeg','-hide_banner','-loglevel','error','-nostdin','-n','-ss','29','-i',str(video),'-frames:v','1','proof-frame-29.png'])
print(json.dumps({'status':report['status'],'duration':report['duration_seconds'],'bytes':report['bytes'],'sha256':report['sha256']}))
