"""Rebuild our small Lucide sprite from an exact, integrity-pinned official package.

No npm install, package scripts, tar extraction, or runtime network dependency.
Run from the repository: python release-audit/vendor_icons.py
"""
from pathlib import Path
import base64
import hashlib
import io
import json
import tarfile
import urllib.request
import xml.etree.ElementTree as ET
from release_policy import source_path

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.59.0'
URL = f'https://registry.npmjs.org/lucide-static/-/lucide-static-{VERSION}.tgz'
INTEGRITY = 'sha512-MuHZYaXbHgzN2QO6D3OM19bj09A+8GJiFSdXIMlbnLLEGQQ9+NRH2KaCxuivevD3Y23vM74kV17XBifgtqhfEg=='
ICONS = {
    'home':'house', 'search':'search', 'book':'library', 'plus':'plus',
    'close':'x', 'left':'chevron-left', 'right':'chevron-right',
    'grid':'layout-grid', 'play':'play', 'pause':'pause', 'stop':'square',
    'shuffle':'shuffle', 'previous':'skip-back', 'next':'skip-forward',
    'heart':'heart', 'code':'code', 'volume':'volume-2', 'queue':'list-music',
    'more':'ellipsis', 'sort':'list-filter', 'repeat':'repeat',
}


def main():
    payload = urllib.request.urlopen(URL, timeout=60).read()
    integrity = 'sha512-' + base64.b64encode(hashlib.sha512(payload).digest()).decode()
    if integrity != INTEGRITY:
        raise ValueError('Upstream icon package integrity differs from the pinned receipt')
    symbols = []
    sources = []
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    with tarfile.open(fileobj=io.BytesIO(payload), mode='r:gz') as archive:
        license_bytes = archive.extractfile('package/LICENSE').read()
        for target, source in ICONS.items():
            member = f'package/icons/{source}.svg'
            original = archive.extractfile(member).read()
            svg = ET.fromstring(original)
            # Only static geometric elements are admitted to the sprite.
            for element in svg.iter():
                if element.tag.split('}')[-1] not in {'svg','path','rect','circle','line','polyline','polygon','ellipse'}:
                    raise ValueError('Unexpected SVG element')
                if any(key.lower().startswith('on') or key in {'href','style'} for key in element.attrib):
                    raise ValueError('Unexpected SVG attribute')
            geometry = ''.join(ET.tostring(child, encoding='unicode').replace(' xmlns="http://www.w3.org/2000/svg"', '') for child in svg)
            symbols.append(f'<symbol id="i-{target}" viewBox="0 0 24 24">{geometry}</symbol>')
            sources.append({'symbol':f'i-{target}', 'source':member, 'sha256':hashlib.sha256(original).hexdigest()})
    folder = source_path(ROOT,'assets/icons')
    folder.mkdir(parents=True, exist_ok=True)
    sprite = '<svg xmlns="http://www.w3.org/2000/svg">\n' + '\n'.join(symbols) + '\n</svg>\n'
    (folder/'lucide.svg').write_text(sprite, encoding='utf-8', newline='\n')
    source_path(ROOT,'licenses/Lucide-LICENSE.txt').write_bytes(license_bytes)
    receipt = {'package':'lucide-static', 'version':VERSION, 'source':URL, 'integrity':INTEGRITY,
        'retrieved_on':'2026-10-19', 'license':'ISC AND MIT (Feather-derived icons)',
        'license_source':'package/LICENSE', 'license_sha256':hashlib.sha256(license_bytes).hexdigest(),
        'changes':'Selected static geometry, renamed symbol IDs, combined in one SVG sprite; styling inherited from host.',
        'used_in':['index.html','app.js'], 'icons':sources,
        'sprite_sha256':hashlib.sha256(sprite.encode()).hexdigest()}
    (folder/'lucide-provenance.json').write_text(json.dumps(receipt,indent=2)+'\n', encoding='utf-8', newline='\n')
    print(json.dumps({'package':f'lucide-static@{VERSION}', 'symbols':len(sources), 'sprite_bytes':len(sprite.encode()), 'integrity_verified':True}))


if __name__ == '__main__':
    main()
