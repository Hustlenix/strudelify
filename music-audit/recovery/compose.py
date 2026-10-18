"""Encode the reviewed evidence layers in finite Strudel scores; no application edits."""
from pathlib import Path
import sys
import json
import hashlib
import re

AUDIT=Path(__file__).resolve().parents[1]
REPO=AUDIT.parent
ident=sys.argv[1]
phase=sys.argv[2] if len(sys.argv)>2 else 'sung'
if phase not in ('sung', 'instrumental'): raise SystemExit('Use sung or instrumental')
reports=AUDIT/'reports/recovery'
score=json.loads((reports/(ident+'-score.json')).read_text())
rhythm=json.loads((reports/(ident+'-rhythm.json')).read_text())
catalog=json.loads((REPO/'tracks/covers/catalog.json').read_text())
metadata=next(t for t in catalog if t['id']==ident)
target=REPO/'tracks/covers'/(ident+'.strudel')
old=target.read_bytes()
digest=hashlib.sha256(old).hexdigest()
saved=AUDIT/'artifacts/recovery'/(ident+'-pre-repair.strudel')
if not saved.exists():saved.write_bytes(old)
duration=json.loads((reports/(ident+'-vocal.json')).read_text())['interval_s'][1]
bpm=metadata['bpm']
lead=[[n['start_s'],n['end_s'],n['midi'],round(.70+.25*n['mean_periodicity'],3)] for n in score['lead']]
if phase == 'instrumental': lead=[]  # Spoken rap F0 is not a sung melody.
harmony=[[n['start_s'],n['end_s'],n['midi'],round(.65+.3*min(n['activation'],1),3)] for n in score['accompaniment']]
if phase == 'instrumental' and sum(n[2]>=60 for n in harmony)<32:
    raise SystemExit('Sparse instrumental melody evidence: preserve the earlier score; a bass-only correction needs separate review. Do not replace a song with detected bass/drums.')
bass=[[n['start_s'],n['end_s'],n['midi'],.8] for n in rhythm['bass']]
drums=[[n['start_s'],n['end_s'],n['sound'],round(min(n['relative_energy'],1),3)] for n in rhythm['drums']]

def rows(name,values):
    # Single-quoted strings remain literal data in Strudel's transpiler.
    rendered = [json.dumps(n,separators=(',',':')) for n in values]
    if name == 'drums':
        rendered = [re.sub(r'"(bd|sd|hh)"', r"'\1'", n) for n in rendered]
    return 'const '+name+' = [\n'+''.join('  '+n+',\n' for n in rendered)+']\n'

code=f'''// title: {metadata['title']}
// artist: {metadata['artist']}
// Source-derived instrumental score; no original audio or lyrics embedded.
// Evidence: music-audit/reports/recovery/{ident}-score.json and -rhythm.json
// Source SHA-256: {score['source_sha256']}
// The former unverified repeating tune/chord loop has been replaced by timed source notes.
// Timing preserves the recording; BPM is catalog metadata, not a claim of fixed meter.
// Listening approval remains pending; omitted/uncertain notes are not replaced by generic beats.

setcps({bpm}/60/4)
const cps = {bpm}/240
const endSeconds = {duration}
const eventsAtSeconds = rows => new Pattern(state => rows.flatMap(([a,b,n,level]) => {{
  if(a >= endSeconds) return []
  const whole = new TimeSpan(a*cps, Math.min(b,endSeconds)*cps)
  const part = whole.intersection(state.span)
  return part ? [new Hap(whole, part, {{note:n, gain:level}})] : []
}}))

// Harmonic/accompaniment note onsets and voicings measured from the instrumental stem.
'''+rows('accompaniment',harmony)+'''
$: eventsAtSeconds(accompaniment).s("triangle").fm(.35).fmh(2)
  .fmdecay(.08).fmsustain(0).attack(.003).decay(.14).sustain(.16)
  .release(.08).lpf(3000).room(.10).withValue(v => ({...v,gain:v.gain*.16}))

// Corroborated sung vocal contour; intentionally empty for spoken-rap profiles.
'''+rows('lead',lead)+'''
$: eventsAtSeconds(lead).s("triangle").fm(.12).fmh(2)
  .attack(.012).decay(.06).sustain(.8).release(.055)
  .lpf(3500).room(.12).withValue(v => ({...v,gain:v.gain*.25}))

// Measured bass movement, never a guessed root-note ostinato.
'''+rows('bass',bass)+'''
$: eventsAtSeconds(bass).s("sine").attack(.008).decay(.08).sustain(.7)
  .release(.07).lpf(350).withValue(v => ({...v,gain:v.gain*.20}))

// Detected source transient times, with no repeated replacement kit pattern.
'''+rows('drums',drums)+'''
const kit = new Pattern(state => drums.flatMap(([a,b,sound,level]) => {
  if(a >= endSeconds) return []
  const whole = new TimeSpan(a*cps, Math.min(b,endSeconds)*cps)
  const part = whole.intersection(state.span)
  return part ? [new Hap(whole, part, {s:sound,bank:'RolandTR909',gain:level})] : []
}))
$: kit.withValue(v => ({...v,gain:v.gain*.14}))
'''
if ident == '07-i-thought-i-saw-your-face-today':
    # Conservative mix choice: the source is led by pitched material; kit identification
    # from broad-band transient candidates is uncertain. Do not let a synthetic kick dominate.
    code=code.replace('gain:v.gain*.14','gain:v.gain*.045')
# Preserve a literal per-stage diff/checkpoint; do not silently regenerate an edited score.
logfile=reports/(ident+'-changes.json')
log=json.loads(logfile.read_text()) if logfile.exists() else []
if log and hashlib.sha256(code.encode()).hexdigest()==digest:
    raise SystemExit('Score already matches this evidence; no repeated rewrite')
if log:
    raise SystemExit('Existing repair checkpoint; use a targeted edit, not an automatic rewrite')
target.write_text(code,encoding='utf-8',newline='\n')
log.append({'phase':'replace-unverified-pitch-and-rhythm-score','attempt':1,
            'reason':'Owner rejected every public song; current cover lead/harmony/groove were unverified and source evidence contradicts the old repeated notes. Preserve instrumentation roles but replace pitch/timing content with independently corroborated source events across the full reference.',
            'before_sha256':digest,'after_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
            'profile':phase,
            'counts':{'lead':len(lead),'accompaniment':len(harmony),'bass':len(bass),'drums':len(drums)},
            'duration_s':duration,'decision':'candidate, requires real runtime/full capture; no listening approval'})
logfile.write_text(json.dumps(log,indent=2)+'\n',encoding='utf-8')
metadata['status']='draft'
(REPO/'tracks/covers/catalog.json').write_text(json.dumps(catalog,indent=2)+'\n',encoding='utf-8')
print(json.dumps(log[-1],indent=2))
