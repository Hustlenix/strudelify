"""One bounded correction: replace the unsupported bass loop with corroborated source G/D events."""
from pathlib import Path
import json
import hashlib

AUDIT=Path(__file__).resolve().parents[1]
p=AUDIT.parent/'tracks/covers/02-without-me.strudel'
old=p.read_bytes();text=old.decode('utf-8')
if 'const sourceBassNotes' in text:raise SystemExit('Bass correction already installed')
evidence=json.loads((AUDIT/'reports/recovery/02-without-me-rhythm.json').read_text())
selected=[n for n in evidence['bass'] if n['midi'] in [31,38] and n['end_s']-n['start_s']>=.14]
if len(selected)<200:raise SystemExit('Insufficient corroborated G/D observations')
start=text.index('// bass — driving eighths')
end=text.index('// drums',start)
code='''// Bass correction: actual source G1/D2 notes and timings replace the unrelated G/Eb/F/D loop.
// Low-passed YIN observations have independent fundamental-peak corroboration.
// Signature lead riff remains an unresolved review issue; rap speech was not made into a melody.
const sourceBassNotes = [
'''+''.join('  '+json.dumps([n['start_s'],n['end_s'],n['midi']],separators=(',',':'))+',\n' for n in selected)+''']
$: new Pattern(state => sourceBassNotes.flatMap(([a,b,n]) => {
  const whole = new TimeSpan(a*(112/240),b*(112/240))
  const part = whole.intersection(state.span)
  return part ? [new Hap(whole,part,{note:n})] : []
})).s("sawtooth").lpf(240).attack(.008).decay(.06).sustain(.65).release(.055).gain(.38)

'''
text=text[:start]+code+text[end:]
p.write_text(text,encoding='utf-8')
log={'id':p.stem,'phase':'corroborated-bass-only','attempt':1,'before_sha256':hashlib.sha256(old).hexdigest(),
     'after_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'source_events':len(selected),
     'change':'Replace four-chord eighth-note bass with actual G1/D2 note events across the recording; preserve existing lead, instrumentation and dynamics until a better supported riff is ready.',
     'limits':'This correction does not solve the unverified signature riff or upper harmony. Do not call the song fixed or approved.'}
(AUDIT/'reports/recovery/02-without-me-changes.json').write_text(json.dumps([log],indent=2)+'\n',encoding='utf-8')
print(json.dumps(log,indent=2))
