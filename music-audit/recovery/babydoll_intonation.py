"""One pitch-only correction after the owner's partial-recognition feedback."""
from pathlib import Path
import json,re,hashlib,shutil
REPO=Path(__file__).resolve().parents[2];AUDIT=REPO/'music-audit';ident='01-babydoll'
p=REPO/'tracks/covers'/(ident+'.strudel');before=p.read_bytes();text=p.read_text()
logfile=AUDIT/'reports/recovery'/(ident+'-changes.json');log=json.loads(logfile.read_text())
if any(x['phase']=='measured-vocal-intonation' for x in log):raise SystemExit('Already applied; no automatic repeat')
score=json.loads((AUDIT/'reports/recovery'/(ident+'-score.json')).read_text())['lead']
match=re.search(r'const lead = (\[[\s\S]*?\n\])',text)
rows=json.loads(re.sub(r',\s*\]',']',match.group(1)))
if len(rows)!=len(score):raise SystemExit('Lead no longer matches the preserved score evidence')
for row,note in zip(rows,score):
    if row[:3] != [note['start_s'],note['end_s'],note['midi']] or abs(note['cents_median'])>45:raise SystemExit('Pitch/time evidence mismatch')
    row[2]=round(note['midi']+note['cents_median']/100,4)
replacement='const lead = [\n'+''.join('  '+json.dumps(row,separators=(',',':'))+',\n' for row in rows)+']'
text=text[:match.start()]+replacement+text[match.end():]
text=text.replace('// Actual vocal contour represented by a lead synth, including measured rests and pickups.',
 '// Vocal contour with measured median cent offsets, including actual rests and pickups.\n// Pitch-only correction after partial-recognition review; timings, note identities and gains are unchanged.')
p.write_text(text,encoding='utf-8',newline='\n')
render=AUDIT/'artifacts/recovery'/(ident+'-render.wav')
if render.exists():shutil.copyfile(render,render.with_name(ident+'-before-intonation.wav'))
log.append({'phase':'measured-vocal-intonation','attempt':1,'before_sha256':hashlib.sha256(before).hexdigest(),
 'after_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'notes':len(rows),
 'change':'Preserve each corroborated source note\'s measured median cent deviation instead of forcing its pitch center to an integer MIDI note. No note onsets, durations, gain balance or accompaniment changes.',
 'evidence':'01-babydoll-score.json cents_median from the original full CREPE observations and independent YIN corroboration.',
 'limits':'A measured pitch-center correction, not proof of improved recognition. Does not solve missing notes, vocal slides or guitar timbre. Requires fresh capture/listening.'})
logfile.write_text(json.dumps(log,indent=2)+'\n')
review=AUDIT/'reports/recovery'/(ident+'-listening.json');data=json.loads(review.read_text());data['reviewed_code_sha256']=hashlib.sha256(before).hexdigest();data['subsequent_revision']='Vocal median cent offsets restored; fresh owner listening pending';review.write_text(json.dumps(data,indent=2)+'\n')
cat=REPO/'tracks/covers/catalog.json';entries=json.loads(cat.read_text());entries[0]['status']='draft';cat.write_text(json.dumps(entries,indent=2)+'\n')
print('Pitch-only correction applied to',len(rows),'source notes; no approval claimed.')
