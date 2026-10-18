"""Bounded bass correction after sparse hook evidence prevented a whole-score rewrite."""
from pathlib import Path
import json,hashlib
REPO=Path(__file__).resolve().parents[2];AUDIT=REPO/'music-audit';ident='05-cant-tell-me-nothing'
p=REPO/'tracks/covers'/(ident+'.strudel');before=p.read_bytes();text=p.read_text()
if 'const sourceBassNotes' in text:raise SystemExit('Already corrected; no automatic repeat')
evidence=json.loads((AUDIT/'reports/recovery'/(ident+'-rhythm.json')).read_text())
notes=[n for n in evidence['bass'] if 24<=n['midi']<=47 and n['spectral_peak_ratio']>=2.5]
if len(notes)<80:raise SystemExit('Insufficient bass evidence')
start=text.index('// 808 bass');end=text.index('// stomp',start)
replacement='''// Actual source-timed bass replaces the guessed F/Db/Ab/Eb root loop.
// Lead and upper harmony remain unverified; rap speech is not promoted to a sung melody.
const sourceBassNotes = [
'''+''.join('  '+json.dumps([n['start_s'],n['end_s'],n['midi']],separators=(',',':'))+',\n' for n in notes)+''']
$: new Pattern(state => sourceBassNotes.flatMap(([a,b,n]) => {
  const whole = new TimeSpan(a*(80/240),b*(80/240))
  const part = whole.intersection(state.span)
  return part ? [new Hap(whole,part,{note:n})] : []
})).s("sine").lpf(160).attack(.008).decay(.08).sustain(.7).release(.06).gain(.8)

'''
text=text[:start]+replacement+text[end:];p.write_text(text,encoding='utf-8',newline='\n')
log=[{'phase':'corroborated-bass-only','attempt':1,'before_sha256':hashlib.sha256(before).hexdigest(),
      'after_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'source_events':len(notes),
      'reason':'Instrumental transcription is predominantly bass and insufficient for the signature hook. Preserve the earlier upper layers rather than replacing the song with drums/bass alone. Correct only independently corroborated low notes/timing.',
      'limits':'Hook, upper harmony and vocal-derived sample motif remain unresolved. Not a completed faithful cover.'}]
(AUDIT/'reports/recovery'/(ident+'-changes.json')).write_text(json.dumps(log,indent=2)+'\n')
cat=REPO/'tracks/covers/catalog.json';a=json.loads(cat.read_text());next(t for t in a if t['id']==ident)['status']='draft';cat.write_text(json.dumps(a,indent=2)+'\n')
print('Bass-only candidate',len(notes),'source events')
