"""Build a fresh, allowlisted review artifact. Never publishes or deletes a checkout."""
from datetime import datetime, timezone
import hashlib, json
from pathlib import Path
import shutil, subprocess
import argparse

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='release-preview')
    args = parser.parse_args()
    output = (ROOT / args.output).resolve()
    if not output.is_relative_to(ROOT):
        raise SystemExit('Preview output must stay inside the isolated checkout')
    if output.exists():
        raise SystemExit('Preview directory exists. Preserve it or choose a new output explicitly.')
    catalog = json.loads((ROOT / 'tracks/catalog.json').read_text())
    files = ['index.html', 'app.js', 'styles.css', 'README.md', 'LICENSE', 'THIRD_PARTY_ASSETS.md', 'licenses/Strudel-AGPL-3.0.txt', 'tracks/catalog.json']
    files += [p.relative_to(ROOT).as_posix() for p in (ROOT / 'assets').rglob('*.svg')]
    for track in catalog:
        assert track['kind'] == 'original' and track['rights']['status'] == 'project-original'
        assert track['rights']['license'] and track['rights']['evidence']
        assert not track.get('lyricsUrl')
        source = (ROOT / 'tracks' / track['codeUrl']).resolve()
        assert source.is_relative_to(ROOT / 'tracks') and source.suffix == '.strudel'
        assert 'covers' not in source.relative_to(ROOT).parts
        files.append(source.relative_to(ROOT).as_posix())
    manifest = []
    for name in sorted(set(files)):
        source = ROOT / name
        target = output / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        manifest.append({'path': name, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
    revision = subprocess.check_output(['rtk', 'proxy', 'git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    dirty = bool(subprocess.check_output(['rtk', 'proxy', 'git', 'status', '--porcelain'], cwd=ROOT, text=True).strip())
    report = {'created_at': datetime.now(timezone.utc).isoformat(), 'commit': revision, 'dirty': dirty,
              'publication': 'local preview only; approval required', 'track_count': len(catalog),
              'excluded': ['commercial cover source payloads', 'all lyrics', 'reference audio', 'audit/private files'],
              'files': manifest}
    (output / 'release.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    (ROOT / 'release-audit/reports/preview-build.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps({'output': str(output), 'commit': revision, 'dirty': dirty, 'resources': len(manifest)}))


if __name__ == '__main__':
    main()
