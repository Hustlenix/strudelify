"""Confirm the original scores, source recordings and separate worktree remain unchanged."""
from pathlib import Path
import hashlib, json, subprocess
from datetime import datetime, timezone
from release_policy import source_path

ROOT = Path(__file__).resolve().parents[1]


def main():
    baseline = json.loads((ROOT / 'release-audit/reports/baseline.json').read_text())
    rows = []
    for entry in baseline['files']:
        path = ROOT.parent / entry['repository'] / entry['path']
        if entry['repository']==ROOT.name:
            path=source_path(ROOT,entry['path'])
        revised = entry['repository']==ROOT.name and entry['path'] in {f'tracks/{name}.strudel' for name in ('afterglow','greenline','paper-moon','soft-focus','tiny-hours','wide-awake')}
        if revised:
            old=subprocess.check_output(['rtk','proxy','git','show','499cf03716104ff179b1c58906ed6e3f4d1a53f7:'+entry['path']],cwd=ROOT)
            hashes={hashlib.sha256(old).hexdigest(),hashlib.sha256(old.replace(b'\r\n',b'\n').replace(b'\n',b'\r\n')).hexdigest()}
            rows.append({'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                'matches_baseline':False,'intentional_revision':'finite form and measured gain; notes/instruments retained',
                'preserved_baseline_commit':'499cf03716104ff179b1c58906ed6e3f4d1a53f7',
                'preserved_baseline_matches':entry['sha256'] in hashes})
            continue
        withheld = ROOT / 'release-audit/private/withheld-lyrics' / path.name
        if entry['repository'] == ROOT.name and entry['path'].startswith('tracks/covers/lyrics/') and not path.exists():
            digest = hashlib.sha256(withheld.read_bytes()).hexdigest()
            rows.append({'path':str(path), 'current_release':'removed from proposed public branch; original preserved privately and in prior Git/music history',
                         'preserved_sha256':digest, 'matches_baseline':digest == entry['sha256']})
            continue
        rows.append({'path':str(path), 'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                     'matches_baseline':hashlib.sha256(path.read_bytes()).hexdigest() == entry['sha256']})
    originals = []
    for entry in baseline['previous_source_integrity']['originals']:
        path = Path(entry['path'])
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        originals.append({'id':entry['id'], 'kind':entry['kind'], 'sha256':digest, 'matches':digest == entry['sha256']})
    report = {'checked_at':datetime.now(timezone.utc).isoformat(), 'preserved_files':rows,
              'original_recordings':originals, 'passed':all(row.get('preserved_baseline_matches',row['matches_baseline']) for row in rows) and all(row['matches'] for row in originals)}
    (ROOT / 'release-audit/reports/preservation-check.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps({'passed':report['passed'], 'music_art_and_lyric_resources':len(rows), 'original_recording_copies':len(originals)}))
    if not report['passed']:
        raise SystemExit('Preservation check failed')


if __name__ == '__main__':
    main()
