"""Measure a private capture and align it to the unchanged instrumental intro, not a fidelity score."""
from pathlib import Path
import hashlib, json, subprocess
import numpy as np
from scipy.io import wavfile
from scipy.signal import correlate, correlation_lags, resample_poly

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / 'release-audit/private'
MUSIC = ROOT.parent / 'strudelify-music/music-audit'


def read_alignment_intro(path):
    """Convert only the first eight seconds, keeping the historical scaling."""
    try:
        sr, data = wavfile.read(path, mmap=True)
    except ValueError as exc:
        # SciPy cannot map packed PCM encodings such as 24-bit WAV. Fall back to
        # one normal decode only for that limitation; malformed WAVs still fail.
        if 'mmap' not in str(exc).lower():
            raise
        sr, data = wavfile.read(path, mmap=False)
    integer_pcm = np.issubdtype(data.dtype, np.integer)
    intro = data[:sr*8].astype(float)
    # Drop the complete mapped/decoded array before resampling the small copy.
    del data
    if integer_pcm:
        intro /= 32768
    if intro.ndim > 1:
        intro = intro.mean(axis=1)
    return sr, intro


def main():
    raw = np.fromfile(PRIVATE / 'babydoll-phrasing.f32', dtype='<f4').reshape(-1,2)
    assert np.isfinite(raw).all() and np.max(np.abs(raw)) < 1
    capture = json.loads((ROOT / 'release-audit/reports/babydoll-phrasing-capture.json').read_text())
    assert capture['status'] == 'PASSED'
    wav = PRIVATE / 'babydoll-phrasing.wav'
    if wav.exists():
        raise SystemExit('Preserve the measured render before repeating this measurement')
    wavfile.write(wav,48000,raw)
    sr, old = read_alignment_intro(MUSIC / 'artifacts/recovery/01-babydoll-render.wav')
    # No melody changed before 10.58 seconds. Align on the unchanged first eight seconds.
    previous = resample_poly(old,8000,sr)
    new = resample_poly(raw[:48000*8].mean(axis=1),1,6)
    cc = correlate(new,previous,mode='full',method='fft')
    lags = correlation_lags(len(new),len(previous),mode='full')
    eligible = np.abs(lags) < 4000
    lag = int(lags[eligible][np.argmax(cc[eligible])])
    shift = lag / 8000
    start = max(0,10.33+shift)
    excerpt = PRIVATE / 'listening/babydoll-phrasing-15s.wav'
    wavfile.write(excerpt,48000,raw[round(start*48000):round((start+15)*48000)])
    subprocess.run(['rtk','proxy','ffmpeg','-v','error','-nostdin','-i',str(excerpt),
        '-af','loudnorm=I=-23:TP=-3:LRA=7','-ar','22050','-ac','1',
        str(PRIVATE / 'listening/babydoll-phrasing-normalized.wav')],check=True)
    meter = subprocess.run(['rtk','proxy','ffmpeg','-v','info','-i',str(wav),'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True)
    assert meter.returncode == 0
    report = json.loads((ROOT / 'release-audit/reports/babydoll-phrasing.json').read_text())
    report.update({'runtime_status':'passed actual Strudel 1.2.6 and complete stereo WebAudio capture',
        'capture_seconds':len(raw)/48000,'source_code_sha256_current':hashlib.sha256(Path(capture['source']).read_bytes()).hexdigest(),
        'peak_linear':float(np.max(np.abs(raw))),'clipped_samples':int(np.sum(np.abs(raw)>=1)),
        'nonfinite_samples':int(np.sum(~np.isfinite(raw))),
        'intro_alignment_shift_seconds':shift,'comparison_source_interval_seconds':[10.33,25.33],
        'excerpt_capture_interval_seconds':[start,start+15],
        'alignment_method':'Cross-correlation of the unchanged synthesized instrumental intro only; no perceptual/fidelity rating',
        'loudness_summary':meter.stderr[meter.stderr.rfind('Summary:'):],
        'adopted_as_best':False,'listening_status':'New candidate unreviewed; earlier candidate was criticized by owner'})
    (ROOT / 'release-audit/reports/babydoll-phrasing.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    key = json.loads((PRIVATE / 'listening/answer-key.json').read_text())
    case = next(row['case'] for row in key if row['id'] == '01-babydoll')
    template = (ROOT / 'release-audit/babydoll-comparison.html').read_text(encoding='utf-8')
    (PRIVATE / 'listening/babydoll.html').write_text(template.replace('case-02',case),encoding='utf-8',newline='\n')
    print(json.dumps({'full_capture_seconds':len(raw)/48000,'peak':report['peak_linear'],'clipped':0,'alignment_shift_seconds':shift,'excerpt':str(excerpt)}))
    print(report['loudness_summary'])


if __name__ == '__main__':
    main()
