"""Apply measured constant gains only; keep previous complete renders for comparison."""
from pathlib import Path
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]


def main():
    measured = json.loads((ROOT/'release-audit/reports/original-audio-quality.json').read_text())
    rows=[]
    for row in measured['tracks']:
        path=ROOT/'tracks'/f"{row['id']}.strudel"
        data=path.read_bytes()
        if hashlib.sha256(data).hexdigest()!=row['score_sha256']:
            raise SystemExit('Score changed since measurement: '+row['id'])
        factor=round(10**((-23-row['integrated_lufs'])/20),4)
        assert row['peak']*factor < .7
        text=data.decode()
        assert text.count('gain:v.gain*section[2]*fade')==1
        text=text.replace('gain:v.gain*section[2]*fade',f'gain:v.gain*section[2]*fade*{factor}')
        text=text.replace('// Draft: full human listening approval',f'// Constant master gain {factor}, based on complete v1 render toward -23 LUFS.\n// Draft: full human listening approval')
        path.write_text(text,encoding='utf-8',newline='\n')
        rows.append({'id':row['id'],'measured_lufs_before':row['integrated_lufs'],
            'constant_gain':factor,'target_lufs':-23,'source_capture':'originals-v1',
            'new_score_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
            'musical_changes':'None; all notes, rhythm, sections, envelopes and instruments retained'})
    (ROOT/'release-audit/reports/original-level-balance.json').write_text(json.dumps({'tracks':rows,'human_approval':False},indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps(rows,indent=2))


if __name__=='__main__':
    main()
