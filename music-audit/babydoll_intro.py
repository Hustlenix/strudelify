"""One bounded repair: retain measured opening voicings, not a guessed progression."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parent
p=ROOT.parent/'tracks/covers/01-babydoll.strudel'
code=p.read_text(encoding='utf-8')
if 'const openingVoicings' in code:raise SystemExit('Opening already installed; no repeated adjustment')
report=json.loads((ROOT/'reports/01-babydoll-note-candidates.json').read_text())
rows=[n for n in report['notes'] if n['start_s']<4.37 and n['midi']<=65 and n['activation']>=.48]
events=[[n['start_s'],min(n['end_s'],4.37),n['midi']] for n in rows]
before=hashlib.sha256(code.encode()).hexdigest()
addition='''
// Bounded opening repair from the supplied recording, 0–4.37 s.
// These measured D/F/A and C#/E voicings replace the unrelated G-major opening.
// Source event times/pitches: music-audit/reports/01-babydoll-note-candidates.json.
// Machine-assisted draft; instrument identity, omissions and later melody require listening.
const openingVoicings = EVENTS
$: new Pattern(state => openingVoicings.flatMap(([a,b,n]) => {
  const whole = new TimeSpan(a * (84.05/240), b * (84.05/240))
  const part = whole.intersection(state.span)
  return part ? [new Hap(whole, part, {note:n, musicIntro:true})] : []
})).s("triangle").lpf(2600).attack(.004).decay(.18).sustain(.12).release(.12).gain(.32)

// Keep the source-derived opening clear of the old guessed bass/drum/lead layers.
all(p => p.filterHaps(h => h.value.musicIntro || Number(h.whole.begin) >= 4.37 * (84.05/240)))
'''.replace('EVENTS',json.dumps(events,separators=(',',':')))
p.write_text(code+addition,encoding='utf-8')
logfile=ROOT/'reports/adjustments.json';log=json.loads(logfile.read_text())
log.append({'id':p.stem,'phase':'opening-voicings','attempt':1,'before_sha256':before,'after_sha256':hashlib.sha256((code+addition).encode()).hexdigest(),'change':'Replace only 0–4.37 s with measured opening note events (Basic Pitch >=.48, MIDI <=65); preserve original arrangement afterwards. Original G/D/Em/C opening contradicted repeated measured D/F/A and C#/E voicings. No missing pitches were filled by guesswork.','decision':'candidate; requires capture and source-window comparison; no listening approval'})
logfile.write_text(json.dumps(log,indent=2),encoding='utf-8')
print('Opening installed:',len(events),'measured note events')
