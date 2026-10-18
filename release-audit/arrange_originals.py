"""Bound the existing original loops without replacing any notes or instruments.

One deliberate correction: give an endless loop entries, a reduced section, a return,
and a fading ending. This is arrangement work, not a human listening approval.
"""
from pathlib import Path
import hashlib, json, re, subprocess

ROOT = Path(__file__).resolve().parents[1]
BASE = '499cf03716104ff179b1c58906ed6e3f4d1a53f7'
FORMS = {
    'afterglow': (32, [[[0,32,1]], [[4,16,1],[20,30,.9]], [[8,16,1],[20,28,.85]]]),
    'greenline': (40, [[[0,40,1]], [[4,20,1],[24,36,.9]], [[8,20,1],[28,36,.85]]]),
    'paper-moon': (36, [[[0,36,1]], [[4,20,1],[24,32,.9]], [[8,20,1],[24,32,.9]]]),
    'soft-focus': (32, [[[4,16,1],[20,32,.85]], [[0,32,1]], [[8,16,1],[24,28,.8]]]),
    'tiny-hours': (40, [[[0,40,1]], [[4,16,1],[24,36,.9]], [[8,16,1],[20,36,.85]]]),
    'wide-awake': (40, [[[0,40,1]], [[4,20,1],[24,38,.85]], [[8,20,1],[28,36,.9]]]),
}


def main():
    report = {'baseline_commit': BASE, 'change': 'Finite form and reduced sections; original note strings, instruments and effects retained',
              'human_listening_approval': False, 'tracks': []}
    catalog = json.loads((ROOT/'tracks/catalog.json').read_text())
    for row in catalog:
        name = row['id']
        path = ROOT/'tracks'/f'{name}.strudel'
        old = subprocess.check_output(['rtk','proxy','git','show',f'{BASE}:tracks/{name}.strudel'],cwd=ROOT).decode()
        if path.read_text().replace('\r\n','\n') != old.replace('\r\n','\n'):
            raise SystemExit(f'Preserve or review existing changes before arranging {name}')
        bars, windows = FORMS[name]
        parts = old.split('$:')[1:]
        assert len(parts) == 3
        duration = round(bars*240/row['bpm']+8, 6)
        header = old.split('$:')[0].strip()
        helper = f'''
// Arrangement revision: 18 October 2026. Original pitches and sound design retained.
// Bars 0-{bars}: staggered entry, reduced texture, return, four-bar fade; 8s effect tail.
// Draft: full human listening approval is still required.
const endSeconds = {duration}
const totalBars = {bars}
const arranged = (pattern, windows) => pattern
  .filterHaps(h => h.whole && windows.some(([a,b]) => +h.whole.begin >= a && +h.whole.begin < b))
  .withHap(h => {{
    const t = +h.whole.begin
    const section = windows.find(([a,b]) => t >= a && t < b)
    const fade = Math.min(1, Math.max(0, (totalBars-t)/4))
    return h.withValue(v => ({{...v, gain:v.gain*section[2]*fade}}))
  }})
'''
        code = header+'\n'+helper+'\n'
        for i, (part, spans) in enumerate(zip(parts, windows), 1):
            code += f'// Voice {i}: [entry bar, exit bar, level].\n'
            code += '$: arranged(\n  '+part.strip()+',\n  '+json.dumps(spans,separators=(',',':'))+'\n)\n\n'
        assert re.findall(r'note\(([^\n]+)', old) == re.findall(r'note\(([^\n]+)', code)
        code=code.rstrip()+chr(10)
        path.write_text(code,encoding='utf-8',newline='\n')
        row.update(durationSeconds=duration, status='draft', reviewStatus='unreviewed')
        report['tracks'].append({'id':name,'bpm':row['bpm'],'bars':bars,'end_seconds':duration,
            'windows':windows,'baseline_sha256':hashlib.sha256(old.encode()).hexdigest(),
            'score_sha256':hashlib.sha256(code.encode()).hexdigest(),
            'reason':'All three source patterns repeated forever with no section changes or ending.',
            'not_claimed':'No human listening decision or subjective quality score.'})
    (ROOT/'tracks/catalog.json').write_text(json.dumps(catalog,indent=2)+'\n',encoding='utf-8',newline='\n')
    (ROOT/'release-audit/reports/original-arrangements.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps(report,indent=2))


if __name__ == '__main__':
    main()
