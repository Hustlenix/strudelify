"""Use SoundFile for torchcrepe's file I/O on this Torch build; inference is unchanged."""
from pathlib import Path
import importlib.util

package = importlib.util.find_spec('torchcrepe')
if package is None:
    raise SystemExit('Install torchcrepe 0.0.24 into the music-audit venv first')
file = Path(package.origin).with_name('load.py')
text = file.read_text(encoding='utf-8')
old = '    return torchaudio.load(filename)'
new = "    samples, sample_rate = sf.read(filename, dtype='float32', always_2d=True)\n    return torch.from_numpy(samples.T.copy()), sample_rate"
if old in text:
    text = text.replace('import torchaudio', 'import soundfile as sf').replace(old, new)
    file.write_text(text, encoding='utf-8')
    print('Replaced only the optional file loader; CREPE network, weights and decoder unchanged')
elif new in text:
    print('SoundFile loader already installed')
else:
    raise SystemExit('Unknown torchcrepe loader version; no changes made')
