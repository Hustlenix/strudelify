"""Small reversible adjustments, each logged with evidence and candidate fit.

Run one phase at a time; baseline files remain immutable.
"""
from pathlib import Path
import json,re,sys,hashlib
ROOT=Path(__file__).resolve().parent
COVERS=ROOT.parent/'tracks/covers'
PITCH={'02-without-me':2,'04-sailor-song':5,'05-cant-tell-me-nothing':-1,'06-love-me-not':4,'07-i-thought-i-saw-your-face-today':5,'08-lonely':-1}
TEMPO={'01-babydoll':84.05,'04-sailor-song':94.85,'06-love-me-not':114,'07-i-thought-i-saw-your-face-today':78}
NAMES=['c','c#','d','d#','e','f','f#','g','g#','a','a#','b']
BASE={'c':0,'d':2,'e':4,'f':5,'g':7,'a':9,'b':11}
def transpose(text,shift):
    def change(m):
        letter,acc,octave=m.groups();midi=(int(octave)+1)*12+BASE[letter]+{'':0,'#':1,'b':-1}[acc]+shift
        return NAMES[midi%12]+str(midi//12-1)
    # Only match note tokens inside note("...") literals. Never touch headers/audio names.
    return re.sub(r'note\("([^"\n]*)"\)',lambda m:'note("'+re.sub(r'(?<![a-zA-Z])([a-g])([#b]?)([0-8])(?![0-9])',change,m[1])+'")',text)
def main():
    phase=sys.argv[1]
    logpath=ROOT/'reports/adjustments.json'
    log=json.loads(logpath.read_text()) if logpath.exists() else []
    evidence={t['id']:t for t in json.loads((ROOT/'reports/reference-check.json').read_text())}
    for p in sorted(COVERS.glob('*.strudel')):
        ident=p.stem;code=p.read_text(encoding='utf-8');before=hashlib.sha256(code.encode()).hexdigest();reason=None
        if any(x['id']==ident and x['phase']==phase for x in log):continue
        if phase=='pitch' and ident in PITCH:
            shift=PITCH[ident];code=transpose(code,shift)
            row=evidence[ident];old=next(c['pitch_class_cosine'] for c in row['transpose_candidates'] if c['semitones']==0);new=next(c['pitch_class_cosine'] for c in row['transpose_candidates'] if c['semitones']==shift)
            if new<=old:raise RuntimeError('No measured improvement')
            reason=f'Existing pitched layers transposed {shift:+d} semitones; duration-weighted pitch-class cosine {old:.5f} -> {new:.5f} against source {row["reference_interval_s"]}. Relative-mode/root evidence used for 05/08 instead of blindly taking the highest cosine. This does not certify melody/chord order.'
            code=re.sub(r'// (chords|pad) .+',r'// \1 — baseline voicing sequence retained; harmonic changes still require review.',code)
            code=code.replace('// Instrumental rendition',f'// Music audit: {shift:+d} semitone tonal correction; see music-audit/reports/adjustments.json\n// Instrumental rendition',1)
        elif phase=='tempo' and ident in TEMPO:
            bpm=TEMPO[ident];old=float(re.search(r'setcps\(([\d.]+)',code)[1]);code=re.sub(r'setcps\([\d.]+/60/4\)',f'setcps({bpm}/60/4)',code)
            reason=f'Cycle tempo {old:g} -> {bpm:g} BPM; reference periodicities {evidence[ident]["tempo_candidates"][:2]}. Retained four-beat cycle convention; meter/downbeat and She & Him tempo drift remain review items.'
        elif phase=='groove' and ident=='08-lonely':
            old='[bd ~ ~ ~ bd ~ ~ ~ ~]';new='[bd ~ ~ ~ bd ~ ~ ~]'
            if code.count(old)!=1:raise RuntimeError('Expected one nine-subdivision bar')
            code=code.replace(old,new)
            reason='Removed accidental ninth subdivision in final kick cycle; both kicks now lie on the same eighth grid as the other cycles. This is a consistency repair, not a certified source kick transcription.'
        if reason:
            p.write_text(code,encoding='utf-8');after=hashlib.sha256(code.encode()).hexdigest()
            log.append({'id':ident,'phase':phase,'attempt':1,'before_sha256':before,'after_sha256':after,'change':reason,'decision':'retain for comparison; listening approval pending'})
            print(ident,reason)
    logpath.write_text(json.dumps(log,indent=2),encoding='utf-8')
if __name__=='__main__':main()
