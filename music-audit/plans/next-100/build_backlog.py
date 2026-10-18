"""Generate planning data only. Never modifies music files or the production catalog."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parent
DATE='2026-10-18'
HOT='https://ca.billboard.com/charts/hot-100/2026-10-17'
UK='https://www.officialcharts.com/charts/singles-chart/20261016/7501/'
GLOBAL='https://ca.billboard.com/charts/billboard-global-excl-us/2026-10-17'
seeds=[
 ('Patient Zero','Taylor Swift',HOT,'Billboard Hot 100','2026-10-17',1),
 ('Solar Eclipse','Drake & Don Toliver',HOT,'Billboard Hot 100','2026-10-17',5),
 ('Nicole Kidman','ADELA',HOT,'Billboard Hot 100','2026-10-17',9),
 ('Draw You Out','Noah Kahan',HOT,'Billboard Hot 100','2026-10-17',25),
 ('Last Thing You Need','Morgan Wallen',HOT,'Billboard Hot 100','2026-10-17',16),
 ('Stop The Wedding','Ashe',UK,'Official UK Singles Chart','2026-10-16',3),
 ('Great Expectation','Sienna Spiro',UK,'Official UK Singles Chart','2026-10-16',4),
 ("My Body Isn't Ready",'sombr',UK,'Official UK Singles Chart','2026-10-16',10),
 ('BbY WOW','Karol G with Judeline & rusowsky',GLOBAL,'Billboard Global Excl. US','2026-10-17',1),
 ('Loser','Tame Impala',GLOBAL,'Billboard Global Excl. US','2026-10-17',20),
]
candidates=[]
for i,(title,artist,url,chart,week,rank) in enumerate(seeds,1):
 candidates.append({'candidate_id':f'candidate-{i:03}','title_as_charted':title,'artist_as_charted':artist,'selection_state':'research-candidate','chart_evidence':{'source_url':url,'chart':chart,'chart_date':week,'position':rank,'checked_on':DATE},'verified_viral':False,'growth_evidence':[],'official_recording_url':None,'recording_id':None,'original_album':None,'release_date':None,'full_reference_path':None,'full_reference_sha256':None,'bpm':None,'key':None,'duration_s':None,'arrangement_file':None,'catalog_status':None,'next_gate':'Verify release identity, current growth/viral evidence and full reference; audition arranging suitability'})
lanes=['global-english-mainstream']*6+['global-english-alternative']*2+['global-electronic-dance','global-english-breakout']
slots=[{'slot_id':f'next-{i:03}','ordinal':i,'batch':(i-1)//10+1,'selection_lane':lanes[(i-1)%10],'candidate_id':None,'selection_state':'unfilled','arrangement_file':None,'catalog_status':None} for i in range(1,101)]
def save(name,obj):
 p=ROOT/name
 if p.exists():raise RuntimeError(f'Refusing to overwrite an existing planning file: {p.name}')
 p.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
save('candidates-2026-10-18.json',{'snapshot_date':DATE,'evidence_level':'Chart presence verified; virality, exact release identity and full-reference access pending','scope':'Research shortlist only, not ten locked production choices','sources':[HOT,UK,GLOBAL],'candidates':candidates})
save('backlog.json',{'created_on':DATE,'scope':'100 individual additional songs','scope_confirmed':True,'catalog_focus':'Global / English focus','focus_confirmed':True,'composition_started':False,'existing_eight_excluded_from_count':True,'selection_policy':'Lock and refresh ten titles at a time; slots are not playable tracks','slots':slots})
save('track-brief.template.json',{'song_id':None,'title':None,'artist':None,'original_album':None,'recording_version':None,'official_recording_url':None,'release_date':None,'selection_evidence':[],'reference':{'private_audio_path':None,'sha256':None,'duration_s':None},'musical_analysis':{'bpm':None,'bpm_confidence':None,'meter':None,'downbeat_offset_s':None,'key':None,'key_confidence':None,'hook_intervals':[],'bass_transcription':[],'chord_events':[],'melody_events':[],'sections':[],'transitions':[]},'arrangement':{'code_path':None,'runtime_version':None,'source_code_sha256':None,'render_duration_s':None},'quality':{'runtime_report':None,'full_audio_metrics':None,'critical_listening':[],'blind_recognition_review':[],'major_open_issues':[],'fidelity_score':None,'catalog_status':'draft'},'public_release_clearance':None})
print(json.dumps({'planned_slots':len(slots),'batches':len(set(s['batch'] for s in slots)),'chart_candidates':len(candidates),'locked_titles':0,'new_arrangements':0}))
