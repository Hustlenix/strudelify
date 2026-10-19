"""Read public release facts and compare live payloads with this checkout.

Ordinary HTTP GETs; no browser interaction, playback, storage writes or app tests.
Run with RTK and Python. Saves hashes/facts, not remote source bodies.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import subprocess
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
BASE = 'https://hustlenix.github.io/strudelify/'


def get(path):
    url = urljoin(BASE, path)
    if not url.startswith(BASE):
        raise ValueError('Resource outside public project path')
    with urlopen(Request(url, headers={'Accept-Encoding': 'identity'}), timeout=30) as response:
        if not response.url.startswith(BASE):
            raise ValueError('Unexpected redirect')
        raw = response.read(10 * 1024 * 1024 + 1)
        if len(raw) > 10 * 1024 * 1024:
            raise ValueError('Resource over capture limit')
        return raw, response.status


def main():
    manifest_raw, _ = get('release.json')
    manifest = json.loads(manifest_raw)
    catalog_raw, _ = get('tracks/catalog.json')
    catalog = json.loads(catalog_raw)
    paths = ['index.html', 'styles.css', 'app.js', 'tracks/catalog.json']
    paths += [urlsplit(urljoin('tracks/catalog.json', entry['codeUrl'])).path for entry in catalog]
    paths = list(dict.fromkeys(paths))
    expected = {entry['path']: entry['sha256'] for entry in manifest['files']}

    def inspect(path):
        try:
            raw, status = get(path)
            local = ROOT / path
            digest = sha256(raw).hexdigest()
            return {'path': path, 'httpStatus': status, 'bytes': len(raw),
                    'sha256': digest, 'matchesManifest': digest == expected.get(path),
                    'matchesCheckoutAfterNewlineNormalization': local.is_file() and
                    raw.replace(b'\r\n', b'\n') == local.read_bytes().replace(b'\r\n', b'\n')}
        except Exception as error:
            return {'path': path, 'error': str(error)}

    with ThreadPoolExecutor(max_workers=4) as pool:
        assets = list(pool.map(inspect, paths))
    commit = subprocess.check_output(['rtk', 'proxy', 'git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    report = {'capturedAtUtc': datetime.now(timezone.utc).isoformat(), 'baseUrl': BASE,
              'method': 'Anonymous HTTP resource and source inspection; no runtime interaction',
              'checkoutCommit': commit, 'liveApplicationCommit': manifest.get('commit'),
              'livePayloadDirty': manifest.get('dirty'), 'manifestResourceCount': len(manifest['files']),
              'liveCatalog': [{key: entry.get(key) for key in ['id', 'title', 'bpm', 'genre', 'kind', 'status', 'durationSeconds']} for entry in catalog],
              'assets': assets,
              'limitations': ['Resource equality is not browser execution or audible proof',
                              'Hash routes are resolved client-side; an HTTP 200 does not verify a rendered route',
                              'No live browser DOM, storage, network session or UI state was inspected']}
    output = Path(__file__).with_name('live-assets.json')
    output.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
