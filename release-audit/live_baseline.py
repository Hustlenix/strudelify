"""Fresh read-only comparison of deployed files against the previous successful main build."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PREVIOUS = ROOT.parent / 'strudelify-music/music-audit/reports/deployed-recovery.json'


def main():
    previous = json.loads(PREVIOUS.read_text())
    def check(entry):
        url = previous['base_url'] + entry['path']
        for attempt in range(3):
            try:
                with urlopen(Request(url, headers={'Cache-Control':'no-cache', 'Connection':'close'}), timeout=30) as response:
                    digest = sha256(response.read().replace(b'\r\n', b'\n')).hexdigest()
                    return {'url':url, 'http_status':response.status, 'sha256_lf':digest,
                            'matches_expected_main':digest == entry['public_sha256_lf'], 'attempts':attempt + 1}
            except (OSError, TimeoutError) as error:
                if attempt == 2:
                    return {'url':url, 'http_status':None, 'matches_expected_main':False, 'error':str(error), 'attempts':3}
    with ThreadPoolExecutor(max_workers=4) as pool:
        resources = list(pool.map(check, previous['resources']))
    report = {'checked_at':datetime.now(timezone.utc).isoformat(), 'commit':previous['main_commit'],
              'base_url':previous['base_url'], 'resources':resources,
              'passed':all(entry['matches_expected_main'] and entry['http_status'] == 200 for entry in resources),
              'candidate_deployed':False,
              'note':'This is the existing public baseline, including older studies/lyrics. Proposed original-only candidate is local and undeployed.'}
    (ROOT / 'release-audit/reports/live-baseline.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps({'passed':report['passed'], 'resources':len(resources), 'commit':report['commit'], 'candidate_deployed':False}))
    if not report['passed']:
        raise SystemExit('Public baseline changed; reconcile before further release claims')


if __name__ == '__main__':
    main()
