"""Classify whole long recordings by matching ten-second blocks to their first song cycle."""
import sys,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from analyze import ROOT,decode,wave_matches,save
results=[]
for slug in ['04-sailor-song','06-love-me-not']:
 d=json.loads((ROOT/'timelines'/f'{slug}.json').read_text(encoding='utf-8'))
 y=decode(d['source_path'],sr=2205);end=d['usable_segment']['end_s'];reference=y[:round(end*2205)];blocks=[]
 for start in range(0,int(len(y)/2205)-9,10):
  chunk=y[start*2205:(start+10)*2205]
  candidates=wave_matches(reference,chunk)
  best=max(candidates,key=lambda x:x['absolute_correlation']) if candidates else {'absolute_correlation':0}
  blocks.append({'start_s':start,'end_s':start+10,'best_first_cycle_match':best,'status':'MATCHED_NAMED_RECORDING' if best['absolute_correlation']>=.8 else 'UNRESOLVED: edit/transition/other audio; listening needed'})
 item={'track':slug,'method':'Normalized waveform correlation of each full ten-second source block against identified first cycle; .8 threshold. Blocks spanning a loop/edit may fail despite containing the same song.','matched_blocks':sum(b['status']=='MATCHED_NAMED_RECORDING' for b in blocks),'total_blocks':len(blocks),'blocks':blocks,'remainder_under_10s':'Decoded/profiled in main analysis, not identity-certified by this block test'};results.append(item)
 print(slug,item['matched_blocks'],'/',item['total_blocks'],flush=True)
save(ROOT/'reports/long-record-identification.json',results)
