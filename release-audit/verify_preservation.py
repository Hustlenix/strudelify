"""Confirm the original scores, source recordings and separate worktree remain unchanged."""
from pathlib import Path
import hashlib, json
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]


def main():
    baseline = json.loads((ROOT / 'release-audit/reports/baseline.json').read_text())
    rows = []
    for entry in baseline['files']:
        path = ROOT.parent / entry['repository'] / entry['path']
        rows.append({'path':str(path), 'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                     'matches_baseline':hashlib.sha256(path.read_bytes()).hexdigest() == entry['sha256']})
    originals = []
    for entry in baseline['previous_source_integrity']['originals']:
        path = Path(entry['path'])
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        originals.append({'id':entry['id'], 'kind':entry['kind'], 'sha256':digest, 'matches':digest == entry['sha256']})
    report = {'checked_at':datetime.now(timezone.utc).isoformat(), 'preserved_files':rows,
              'original_recordings':originals, 'passed':all(row['matches_baseline'] for row in rows) and all(row['matches'] for row in originals)}
    (ROOT / 'release-audit/reports/preservation-check.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps({'passed':report['passed'], 'music_art_and_lyric_resources':len(rows), 'original_recording_copies':len(originals)}))
    if not report['passed']:
        raise SystemExit('Preservation check failed')


if __name__ == '__main__':
    main()
