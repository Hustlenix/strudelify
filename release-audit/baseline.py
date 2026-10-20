"""Read-only identity/preservation snapshot. Original media are never rewritten."""
from pathlib import Path
import hashlib, json, subprocess
from datetime import datetime, timezone
from release_policy import public_files, source_path

ROOT = Path(__file__).resolve().parents[1]
MUSIC = ROOT.parent / 'strudelify-music'
OUT = ROOT / 'release-audit/reports'
OUT.mkdir(exist_ok=True)


def git(root, *args):
    return subprocess.check_output(['rtk', 'proxy', 'git', *args], cwd=root, text=True).strip()


def track_resources(root):
    """Require the catalog before recording logical, layout-independent paths."""
    tracks = source_path(root, 'tracks') if root == ROOT else root / 'tracks'
    catalog = source_path(root, 'tracks/catalog.json') if root == ROOT else tracks / 'covers/catalog.json'
    if not catalog.is_file():
        raise FileNotFoundError('Required preservation catalog is missing: ' + str(catalog))
    rows = json.loads(catalog.read_text(encoding='utf-8'))
    if not isinstance(rows, list) or not rows:
        raise ValueError('Preservation catalog must contain tracks: ' + str(catalog))
    required = {catalog}
    tracks_root = tracks.resolve()
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get('codeUrl'), str) or not row['codeUrl']:
            raise ValueError('Preservation catalog has a missing score path: ' + str(catalog))
        for field in ('codeUrl', 'lyricsUrl'):
            value = row.get(field)
            if value is None:
                continue
            if not isinstance(value, str) or not value:
                raise ValueError('Invalid preservation resource path: ' + str(catalog))
            path = (catalog.parent / value).resolve()
            if not path.is_relative_to(tracks_root):
                raise ValueError('Preservation resource escapes tracks: ' + value)
            required.add(path)
    if root == ROOT:
        # Include catalog-derived artwork and any other required public track resource.
        required.update(source_path(root, name) for name in public_files(root) if name.startswith('tracks/'))
    for path in sorted(required):
        if not path.is_file():
            raise FileNotFoundError('Required preservation resource is missing: ' + str(path))
    return tracks, sorted(path for path in tracks.rglob('*') if path.is_file())


def main():
    report = {'checked_at': datetime.now(timezone.utc).isoformat(), 'repositories': [], 'files': []}
    for root in [ROOT, MUSIC]:
        report['repositories'].append({'path': str(root), 'branch': git(root, 'branch', '--show-current'),
            'commit': git(root, 'rev-parse', 'HEAD'), 'status': git(root, 'status', '--porcelain'),
            'origin': git(root, 'remote', 'get-url', 'origin')})
        tracks, resources = track_resources(root)
        for path in resources:
            report['files'].append({'repository': root.name, 'path': 'tracks/' + path.relative_to(tracks).as_posix(),
                'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    source = MUSIC / 'music-audit/reports/recovery/final-source-integrity.json'
    report['previous_source_integrity'] = json.loads(source.read_text())
    (OUT / 'baseline.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print('Preservation snapshot:', len(report['files']), 'tracked music/art/lyric resources; no files changed')


if __name__ == '__main__':
    main()
