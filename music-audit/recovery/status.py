"""Report current hashes and evidence honestly; never convert audio generation to approval."""
from pathlib import Path
import json,hashlib,datetime
REPO=Path(__file__).resolve().parents[2];AUDIT=REPO/'music-audit';FOLDER=AUDIT/'reports/recovery'
rows=[]
for entry in json.loads((REPO/'tracks/covers/catalog.json').read_text()):
    ident=entry['id'];source=REPO/'tracks/covers'/(ident+'.strudel');digest=hashlib.sha256(source.read_bytes()).hexdigest()
    path=FOLDER/(ident+'-metrics.json');metrics=json.loads(path.read_text()) if path.exists() else {}
    matches=metrics.get('capture_code_sha256')==digest and metrics.get('source_code_sha256')==digest
    changes=FOLDER/(ident+'-changes.json');log=json.loads(changes.read_text()) if changes.exists() else []
    lyric=REPO/'tracks/covers/lyrics'/(ident+'.json');lyric_data=json.loads(lyric.read_text()) if lyric.exists() else {}
    rows.append({'id':ident,'title':entry['title'],'status':entry['status'],'sha256':digest,
       'scope':log[0]['phase'] if log else 'earlier arrangement retained',
       'current_complete_audio':bool(matches and metrics.get('complete_duration_captured') and metrics.get('capture_status')=='PASSED'),
       'duration_s':metrics.get('capture_duration_s') if matches else None,
       'lufs':metrics.get('integrated_lufs') if matches else None,'true_peak_dbtp':metrics.get('true_peak_dbtp') if matches else None,
       'clipped_samples':metrics.get('full_scale_samples') if matches else None,
       'lyric_method':lyric_data.get('method'),'lyric_review':lyric_data.get('reviewStatus'),'lyric_phrases':len(lyric_data.get('cues',[])),
       'fidelity_score':None,'musically_approved':False})
report={'generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'tracks':rows,
 'listening':'Owner described the earlier Babydoll render as partially recognizable; measured vocal intonation was revised afterward and needs fresh listening. No full musical approval. Other candidates still need comparative listening.',
 'limits':['Source transcription candidates can miss notes, retain overtones, misread pitch or misclassify percussion.',
           'Without Me and Can\'t Tell Me Nothing have bounded bass repairs; their hooks and upper harmony remain unresolved.',
           'Automatic lyric drafts can contain wrong words or omitted segments. No transcript is human-approved.']}
(FOLDER/'current-status.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps([{'id':r['id'],'full_capture':r['current_complete_audio'],'lyrics':r['lyric_phrases'],'status':r['status']} for r in rows],indent=2))
