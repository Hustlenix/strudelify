"""Read-only deployed music-catalog diagnostic; writes reports only in music-audit."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen

AUDIT = Path(__file__).resolve().parents[1]
BASE = 'https://hustlenix.github.io/strudelify/'


def fetch(relative):
    url = urljoin(BASE, relative)
    try:
        with urlopen(Request(url, headers={'Cache-Control': 'no-cache'}), timeout=25) as response:
            data = response.read()
            return {'url': url, 'status': response.status,
                    'sha256': hashlib.sha256(data).hexdigest(),
                    'text': data.decode('utf-8', errors='replace')}
    except HTTPError as error:
        return {'url': url, 'status': error.code}
    except URLError as error:
        return {'url': url, 'status': None, 'error': str(error.reason)}


def main():
    application = fetch('app.js')
    text = application.get('text', '')
    # Inspect data, never evaluate remote JavaScript.
    initial = re.search(r'const tracks\s*=\s*\[([\s\S]*?)\];', text)
    demo_entries = []
    for item in re.findall(r'\{([^{}]*)\}', initial.group(1) if initial else ''):
        fields = dict(re.findall(r"(id|title|artist|codeUrl):\s*'([^']*)'", item))
        if fields.get('codeUrl'):
            demo_entries.append(fields)
    local_catalog = json.loads((AUDIT.parent / 'tracks/covers/catalog.json').read_text(encoding='utf-8'))
    paths = [t['codeUrl'] for t in demo_entries] + ['tracks/covers/catalog.json']
    paths += [urljoin('tracks/covers/catalog.json', t['codeUrl']) for t in local_catalog]
    with ThreadPoolExecutor(max_workers=4) as pool:
        fetched = list(pool.map(fetch, paths))
    report = {
        'checked_at_utc': datetime.now(timezone.utc).isoformat(),
        'base_url': BASE,
        'method': 'Read live app.js catalog constants and perform HTTP GETs; no audio listening performed',
        'app_js': {k: v for k, v in application.items() if k != 'text'},
        'bundled_tracks': demo_entries,
        'references_music_catalog': 'tracks/covers/catalog.json' in text,
        'local_cover_ids': [t['id'] for t in local_catalog],
        'resources': [{k: v for k, v in r.items() if k != 'text'} for r in fetched],
        'musical_fidelity': 'NOT_ESTABLISHED: local covers remain runtime-verified drafts',
        'user_feedback': 'Owner reports that every song heard on the public site sounds like random beats',
    }
    destination = AUDIT / 'reports/live-catalog.json'
    destination.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
