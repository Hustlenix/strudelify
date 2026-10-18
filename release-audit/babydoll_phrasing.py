"""One private experiment: retain measured voiced contours instead of retriggering pitch fragments."""
from pathlib import Path
import hashlib, json
import numpy as np
from scipy.ndimage import median_filter

ROOT = Path(__file__).resolve().parents[1]
MUSIC = ROOT.parent / 'strudelify-music/music-audit'
OUT = ROOT / 'release-audit/experiments'


def main():
    OUT.mkdir(exist_ok=True)
    target = OUT / '01-babydoll-phrasing.strudel'
    if target.exists():
        raise SystemExit('Experiment already exists; preserve it before another bounded attempt')
    source = ROOT / 'tracks/covers/01-babydoll.strudel'
    original = source.read_text(encoding='utf-8')
    data = np.load(MUSIC / 'artifacts/recovery/01-babydoll-vocal-frames.npz')
    score = json.loads((MUSIC / 'reports/recovery/01-babydoll-score.json').read_text())
    f0 = data['f0'].astype(float)
    t = np.arange(len(f0)) * .01
    midi = 69 + 12 * np.log2(np.maximum(f0, 1) / 440)
    supported = np.zeros(len(f0), dtype=bool)
    for note in score['lead']:
        supported |= (t >= note['start_s'] - .06) & (t <= note['end_s'] + .06) & (np.abs(midi - note['midi']) < 1.5)
    voiced = supported & (data['probability'] >= .42) & (data['energy'] > .003)
    # Bridge at most 50ms only when measured F0 stays close at both voiced edges.
    indices = np.flatnonzero(voiced)
    for left, right in zip(indices[:-1], indices[1:]):
        if 1 < right - left <= 6 and abs(midi[right] - midi[left]) < 2:
            voiced[left:right + 1] = True
    bounds = np.flatnonzero(np.diff(np.r_[False, voiced, False])).reshape(-1, 2)
    scale = max(float(np.percentile(data['energy'][voiced], 95)), .001)
    rows = []
    for a, b in bounds:
        if b - a < 12:
            continue
        points = np.arange(a, b, 2)
        frequencies = median_filter(f0[a:b], size=3, mode='nearest')[::2]
        levels = np.clip(data['energy'][points] / scale, 0, 1)
        levels[0] = levels[-1] = 0
        rows.append([round(a*.01, 3), round(b*.01, 3), np.round(frequencies, 2).tolist(), np.round(levels, 4).tolist()])
    assert rows
    block = '''// Owner rejected isolated note fragments. Private phrasing experiment: measured F0 and
// vocal-envelope curves, constrained to previously corroborated note regions. No recording samples.
const voiceContours = ''' + json.dumps(rows, separators=(',', ':')) + '''
registerSound('babydoll_contour', (t, value, onended) => {
  const context = getAudioContext()
  const row = voiceContours[value.sourcePhrase]
  const carrier = context.createOscillator()
  carrier.type = 'triangle'
  const modulator = context.createOscillator()
  modulator.type = 'sine'
  const index = context.createGain()
  const envelope = context.createGain()
  const duration = value.duration
  const curve = new Float32Array(row[2])
  carrier.frequency.setValueCurveAtTime(curve,t,duration)
  modulator.frequency.setValueCurveAtTime(Float32Array.from(curve,f=>f*2),t,duration)
  index.gain.setValueCurveAtTime(Float32Array.from(curve,f=>f*.12),t,duration)
  modulator.connect(index).connect(carrier.frequency)
  envelope.gain.setValueCurveAtTime(Float32Array.from(row[3],level=>level*.3),t,duration)
  carrier.connect(envelope)
  carrier.start(t)
  modulator.start(t)
  const stop = at => {try {carrier.stop(at);modulator.stop(at)} catch {}}
  carrier.onended = () => {carrier.disconnect();modulator.disconnect();index.disconnect();envelope.disconnect();onended()}
  stop(t+duration+.005)
  return {node:envelope,stop}
}, {type:'synth'})
const phrasedVoice = new Pattern(state => voiceContours.flatMap(([a,b],sourcePhrase) => {
  const whole = new TimeSpan(a*cps,b*cps)
  const part = whole.intersection(state.span)
  return part ? [new Hap(whole,part,{s:'babydoll_contour',sourcePhrase,gain:1})] : []
}))
$: phrasedVoice.lpf(3500).room(.12).gain(.25)
'''
    old = '''$: eventsAtSeconds(lead).s("triangle").fm(.12).fmh(2)
  .attack(.012).decay(.06).sustain(.8).release(.055)
  .lpf(3500).room(.12).withValue(v => ({...v,gain:v.gain*.25}))'''
    assert original.count(old) == 1
    candidate = original.replace(old, block)
    target.write_text(candidate, encoding='utf-8', newline='\n')
    report = {'id':'01-babydoll', 'attempt':1, 'scope':'Private lead-phrasing experiment only; accompaniment, bass, kit, source form and end time unchanged',
        'source_code_sha256':hashlib.sha256(source.read_bytes()).hexdigest(), 'candidate_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
        'owner_reason':'Recognized Babydoll but described random instruments/notes playing continuously and an off musical feel.',
        'before_lead_events':len(score['lead']), 'continuous_voiced_phrases':len(rows),
        'source':'Existing supplied-recording CREPE F0/confidence/RMS frames, constrained to independently corroborated lead regions',
        'source_interpolation_limits':'At most 50ms confidence gaps; pitch endpoints less than two semitones apart. No scale/chord guessing.',
        'runtime_status':'pending', 'listening_status':'unreviewed experiment', 'adopted_as_best':False, 'fidelity_score':None}
    (ROOT / 'release-audit/reports/babydoll-phrasing.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8', newline='\n')
    print(json.dumps({'before_events':len(score['lead']), 'phrases':len(rows), 'candidate':str(target), 'adopted':False}))


if __name__ == '__main__':
    main()
