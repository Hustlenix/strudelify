"""Source-derived note evidence. Audio/models stay local; no application writes."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from reference_check import ROOT, sha
import json
import time
import numpy as np
import librosa
import soundfile as sf
import torch
import torchcrepe
from scipy.ndimage import median_filter, uniform_filter1d

torch.set_num_threads(2)
DEST = ROOT / 'artifacts/recovery'
REPORT = ROOT / 'reports/recovery'
DEST.mkdir(parents=True, exist_ok=True)
REPORT.mkdir(parents=True, exist_ok=True)


def stems(ident, duration):
    source = Path(r'C:\Users\LalithReddy.b\Let_It_Happen\album\audio') / (ident + '.mp3')
    before = sha(source)
    inst_path, vocal_path = [DEST / (ident + '-' + part + '.wav') for part in ['inst', 'vocal']]
    if inst_path.exists() and vocal_path.exists():
        inst, sr = sf.read(inst_path, dtype='float32', always_2d=True)
        vocal, _ = sf.read(vocal_path, dtype='float32', always_2d=True)
        inst, vocal = inst.T, vocal.T
    else:
        # The original separator can retain a large inference arena. Record progress for long sources.
        import stem_probe
        print('Separating', ident, duration, 'seconds', flush=True)
        mix, inst, vocal = stem_probe.separate(source, 0, duration)
        sr = 44100
        sf.write(inst_path, inst.T, sr, subtype='FLOAT')
        sf.write(vocal_path, vocal.T, sr, subtype='FLOAT')
        # Release the large ONNX inference arena before loading the pitch network.
        stem_probe.model = None
        import gc
        gc.collect()
    if sha(source) != before:
        raise RuntimeError('Reference bytes changed')
    return source, before, inst, vocal, sr


def vocal_notes(audio, sr, capacity):
    mono = librosa.resample(audio.mean(axis=0), orig_sr=sr, target_sr=16000)
    pitch, periodicity = torchcrepe.predict(torch.from_numpy(mono).unsqueeze(0),
        16000, 160, 80, 900, capacity, batch_size=32, device='cpu',
        return_periodicity=True)
    f0, probability = pitch[0].numpy(), periodicity[0].numpy()
    midi_float = librosa.hz_to_midi(np.maximum(f0, 1))
    midi = median_filter(np.rint(midi_float).astype(int), size=5)
    probability = median_filter(probability, size=5)
    energy = np.sqrt(uniform_filter1d(mono ** 2, size=1280))[::160][:len(midi)]
    energy = np.pad(energy, (0, max(0, len(midi) - len(energy))))
    threshold = max(10 ** (-48 / 20), float(np.quantile(energy, .9)) * .085)
    mask = (probability >= .42) & (energy >= threshold) & (np.abs(midi_float - midi) <= .45)
    # Bridge only tiny holes between the same detected pitch, never create a new pitch.
    for i in range(1, len(mask) - 3):
        if mask[i-1] and not mask[i]:
            for gap in (1, 2, 3):
                if i+gap < len(mask) and mask[i+gap] and midi[i-1] == midi[i+gap]:
                    mask[i:i+gap] = True
                    midi[i:i+gap] = midi[i-1]
                    break
    notes = []
    i = 0
    while i < len(mask):
        if not mask[i]:
            i += 1
            continue
        j = i + 1
        while j < len(mask) and mask[j] and midi[j] == midi[i]:
            j += 1
        if j-i >= 8:
            notes.append({'start_s': round(i*.01, 3), 'end_s': round(j*.01, 3),
                          'midi': int(midi[i]), 'note': librosa.midi_to_note(midi[i], unicode=False),
                          'mean_periodicity': round(float(probability[i:j].mean()), 4),
                          'cents_median': round(float(np.median(midi_float[i:j]-midi[i])*100), 2)})
        i = j
    return notes, {'frame_fraction_accepted': round(float(mask.mean()), 4),
                   'energy_floor': threshold}, {'f0': f0, 'probability': probability,
                                                'mask': mask, 'midi': midi, 'energy': energy}


def main():
    ident = sys.argv[1]
    duration = float(sys.argv[2])
    capacity = sys.argv[3] if len(sys.argv) > 3 else 'tiny'
    started = time.time()
    source, digest, instrumental, vocal, sr = stems(ident, duration)
    print('Tracking vocal pitch', ident, flush=True)
    notes, metrics, frames = vocal_notes(vocal, sr, capacity)
    np.savez_compressed(DEST / (ident + '-vocal-frames.npz'), **frames)
    report = {'id': ident, 'source_path': str(source), 'source_sha256': digest,
              'interval_s': [0, duration], 'method': f'MDX Inst HQ3 vocal residual + CREPE {capacity} 0.0.24, 10 ms hop; periodicity>=.42, <=45 cents, >=80 ms; measured silence mask',
              'status': 'SOURCE_DERIVED_DRAFT_NOT_LISTENING_APPROVED',
              'notes': notes, 'metrics': metrics,
              'limitations': ['Stem leakage, octave errors and missing pitches remain possible.',
                             'Detector agreement and listening review are separate from detector confidence.']}
    (REPORT / (ident + '-vocal.json')).write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'id': ident, 'notes': len(notes), 'metrics': metrics,
                      'first_notes': notes[:30], 'elapsed_s': round(time.time()-started, 2)}, indent=2), flush=True)


if __name__ == '__main__':
    main()
