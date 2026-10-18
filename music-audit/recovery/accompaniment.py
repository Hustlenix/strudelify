"""Independent polyphonic note evidence from the instrumental stem; no guessed chord loop."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from reference_check import ROOT, sha
import json
import time
import numpy as np
import soundfile as sf
import librosa
from basic_pitch.inference import Model, predict
from basic_pitch import ICASSP_2022_MODEL_PATH

ident = sys.argv[1]
stem = ROOT / 'artifacts/recovery' / (ident + '-inst.wav')
source = Path(r'C:\Users\LalithReddy.b\Let_It_Happen\album\audio') / (ident+'.mp3')
if not stem.exists():
    raise SystemExit('Separate the reference first')
started = time.time()
print('Tracking accompaniment', ident, flush=True)
model = Model(ICASSP_2022_MODEL_PATH)
output, midi, candidates = predict(stem, model, onset_threshold=.5, frame_threshold=.3,
                                   minimum_note_length=100, melodia_trick=False)
rows = []
for a, b, n, confidence, *_ in candidates:
    if 40 <= n <= 81 and confidence >= .43:
        rows.append({'start_s':round(float(a),4), 'end_s':round(float(b),4),
                     'midi':int(n), 'note':librosa.midi_to_note(n,unicode=False),
                     'activation':round(float(confidence),4)})
rows.sort(key=lambda x:(x['start_s'],x['midi']))
dest = ROOT/'reports/recovery'/f'{ident}-accompaniment.json'
dest.parent.mkdir(parents=True, exist_ok=True)
data = {'id':ident,'source_sha256':sha(source),'stem_sha256':sha(stem),
        'method':'Basic Pitch 0.4.0 on MDX instrumental, onset .5/frame .3/min100ms; MIDI40-81, mean activation>=.43',
        'status':'SOURCE_DERIVED_CANDIDATES_NOT_LISTENING_APPROVED',
        'notes':rows,'limitations':['Possible omitted notes, octave errors, overtones and stem leakage.',
                                  'These are timed note observations, not certified chord names or sections.']}
dest.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'id':ident,'notes':len(rows),'first_notes':rows[:24],
                  'elapsed_s':round(time.time()-started,2)},indent=2),flush=True)
