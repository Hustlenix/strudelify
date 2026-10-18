"""Read-only identity/preservation snapshot. Original media are never rewritten."""
from pathlib import Path
import hashlib, json, subprocess
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
MUSIC = ROOT.parent / 'strudelify-music'
OUT = ROOT / 'release-audit/reports'
OUT.mkdir(exist_ok=True)


def git(root, *args):
    return subprocess.check_output(['rtk', 'proxy', 'git', *args], cwd=root, text=True).strip()


def main():
    report = {'checked_at': datetime.now(timezone.utc).isoformat(), 'repositories': [], 'files': []}
    for root in [ROOT, MUSIC]:
        report['repositories'].append({'path': str(root), 'branch': git(root, 'branch', '--show-current'),
            'commit': git(root, 'rev-parse', 'HEAD'), 'status': git(root, 'status', '--porcelain'),
            'origin': git(root, 'remote', 'get-url', 'origin')})
        for path in sorted((root / 'tracks').rglob('*')):
            if path.is_file():
                report['files'].append({'repository': root.name, 'path': path.relative_to(root).as_posix(),
                    'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    source = MUSIC / 'music-audit/reports/recovery/final-source-integrity.json'
    report['previous_source_integrity'] = json.loads(source.read_text())
    (OUT / 'baseline.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print('Preservation snapshot:', len(report['files']), 'tracked music/art/lyric resources; no files changed')


if __name__ == '__main__':
    main()
