"""Compare public text resources with the tested isolated integration checkout."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT.parent / 'strudelify-catalog'
BASE = 'https://hustlenix.github.io/strudelify/'
MAIN = '0b6e42ce2fc1f236df8f673470724a564a1d1c5f'


def normalized(data):
    return data.replace(b'\r\n', b'\n')


def check(name):
    local = normalized((APP / name).read_bytes())
    request = Request(BASE + name, headers={'Cache-Control': 'no-cache'})
    with urlopen(request, timeout=30) as response:
        remote = normalized(response.read())
        status = response.status
    return {'path': name, 'http_status': status, 'bytes': len(remote),
            'local_sha256_lf': sha256(local).hexdigest(),
            'public_sha256_lf': sha256(remote).hexdigest(),
            'matches': local == remote}


def main():
    catalog = json.loads((APP / 'tracks/covers/catalog.json').read_text(encoding='utf-8'))
    tracks = catalog if isinstance(catalog, list) else catalog['tracks']
    names = ['index.html', 'app.js', 'styles.css', 'tracks/covers/catalog.json']
    for track in tracks:
        names += ['tracks/covers/' + track['codeUrl'].removeprefix('./'),
                  'tracks/covers/lyrics/' + track['id'] + '.json',
                  'tracks/covers/art/' + track['id'] + '.svg']
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(check, names))
    report = {'generated_at': datetime.now(timezone.utc).isoformat(),
              'base_url': BASE, 'main_commit': MAIN, 'pages_run_id': 39116032718,
              'normalization': 'CRLF to LF for Git text checkout comparison',
              'resource_count': len(results), 'resources': results,
              'passed': all(item['matches'] and item['http_status'] == 200 for item in results)}
    output = ROOT / 'music-audit/reports/deployed-recovery.json'
    output.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps({'passed': report['passed'], 'resources': len(results), 'main_commit': MAIN}))
    if not report['passed']:
        raise SystemExit('Public deployment does not match the tested resource set')


if __name__ == '__main__':
    main()
