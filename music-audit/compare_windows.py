"""Feature comparisons of actual recordings and WebAudio PCM. No fidelity scores."""
from reference_check import ROOT,decode,cosine
import json
import numpy as np,librosa
R=ROOT/'reports'
baseline={t['id']:t for t in json.loads((R/'baseline-browser.json').read_text())['tracks']}
candidate={t['id']:t for t in json.loads((R/'final-browser.json').read_text())['tracks']}
refs=json.loads((R/'reference-check.json').read_text())
def chroma(y,sr):
    y=librosa.resample(y,orig_sr=sr,target_sr=11025)
    S=abs(librosa.stft(y,n_fft=4096,hop_length=256));H,_=librosa.decompose.hpss(S)
    return librosa.feature.chroma_stft(S=H**2,sr=11025,n_fft=4096,hop_length=256)
def captured(row):
    return np.fromfile(ROOT/row['pcm_file'],dtype='<f4').reshape(-1,2).mean(axis=1)
rows=[]
for ref in refs:
    ident=ref['id'];a=baseline[ident];b=candidate[ident]
    ca=chroma(captured(a),a['sample_rate']);cb=chroma(captured(b),b['sample_rate'])
    target=np.array(ref['chroma'])
    row={'id':ident,'source_interval_s':ref['reference_interval_s'],'baseline_render_interval_s':[0,a['frames']/a['sample_rate']],'candidate_render_interval_s':[0,b['frames']/b['sample_rate']],'baseline_harmonic_pitch_class_cosine':round(cosine(target,ca.mean(axis=1)),5),'candidate_harmonic_pitch_class_cosine':round(cosine(target,cb.mean(axis=1)),5),'interpretation':'Aggregate harmonic pitch classes only; unequal render durations and different loop/source phase. Not an aligned motif, chord or perceptual fidelity assessment.'}
    if ident=='01-babydoll':
        source=chroma(decode(ref['source'],0,4.37,sr=11025),11025)
        aintro=ca[:,:source.shape[1]];bintro=cb[:,:source.shape[1]]
        row['bounded_opening']={'source_interval_s':[0,4.37],'baseline_render_interval_s':[0,4.37],'candidate_render_interval_s':[0,4.37],'baseline_cosine':round(cosine(source.mean(axis=1),aintro.mean(axis=1)),5),'candidate_cosine':round(cosine(source.mean(axis=1),bintro.mean(axis=1)),5),'limitation':'Source-derived note selection is not independent blind transcription validation. Does not assess articulation or timbre likeness.'}
    rows.append(row);print(ident,row,flush=True)
(R/'capture-comparisons.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
md='# Recorded source / render feature comparison\n\nThese are cosine similarities of averaged harmonic pitch classes, not fidelity scores. They cannot certify a motif, chord order, timbre or recognizability. Source intervals are explicit in capture-comparisons.json; baseline captures are 24 s and candidates are 32 s, so phase and duration differ.\n\n| Track | Baseline cosine | Candidate cosine |\n|---|---:|---:|\n'
md+='\n'.join(f'| {x["id"]} | {x["baseline_harmonic_pitch_class_cosine"]} | {x["candidate_harmonic_pitch_class_cosine"]} |' for x in rows)
intro=rows[0]['bounded_opening']
md+=f'\n\nBabydoll 0–4.37 s opening: {intro["baseline_cosine"]} baseline vs {intro["candidate_cosine"]} candidate. This supports retaining the bounded voicing repair, but it uses the same recording from which notes were selected, so it is not independent blind validation.\n\nHuman comparative listening has not been performed. Use the local A/B review page and document observations before upgrading catalog status.\n'
(R/'COMPARISON.md').write_text(md,encoding='utf-8')
