"""Build a fresh allowlisted site, exact source archive and manifest. Does not deploy."""
from datetime import datetime, timezone
from pathlib import Path
import argparse, json, shutil, subprocess, zipfile
from release_policy import public_files, digest, validate_artifact, BUILD_SOURCES, UPSTREAM

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',default='release-preview')
    args=parser.parse_args()
    output=(ROOT/args.output).resolve()
    if not output.is_relative_to(ROOT) or output.exists():
        raise SystemExit('Choose a fresh output directory inside the isolated checkout')
    files=public_files(ROOT)
    git=['rtk','proxy','git'] if shutil.which('rtk') else ['git']
    revision=subprocess.check_output(git+['rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    worktree_dirty=bool(subprocess.check_output(git+['status','--porcelain'],cwd=ROOT,text=True).strip())
    changed=[]
    for name in files+list(BUILD_SOURCES):
        try:
            committed=subprocess.check_output(git+['show','HEAD:'+name],cwd=ROOT,stderr=subprocess.DEVNULL)
        except subprocess.CalledProcessError:
            committed=None
        if committed is None or committed.replace(b'\r\n',b'\n')!=(ROOT/name).read_bytes().replace(b'\r\n',b'\n'):
            changed.append(name)
    for name in files:
        source=ROOT/name
        if source.is_symlink():
            raise ValueError('No linked sources: '+name)
        target=output/name
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(source.read_bytes().replace(b'\r\n',b'\n'))
    source_page=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Application source and licenses</title><body><main><h1>Application source and licenses</h1>
<p>Combined application: AGPL-3.0-or-later. Project-authored MIT notices are retained.</p>
<p>Cover studies are synthesized instrumental renditions. Underlying composition rights are reserved; the application license does not grant rights in third-party songs. See the track provenance ledger.</p>
<p><a href="source.zip">Download this build's complete application source and build scripts</a> (no charge).</p>
<p>Application commit: <a href="https://github.com/Hustlenix/strudelify/tree/{revision}">{revision}</a>{' — local uncommitted changes' if changed else ''}.</p>
<p>Powered by Strudel. Copyright Strudel contributors. Unmodified @strudel/web 1.2.6.</p>
<ul><li><a href="https://codeberg.org/uzu/strudel/src/commit/{UPSTREAM}">Exact upstream runtime source</a></li>
<li><a href="https://codeberg.org/uzu/strudel/archive/{UPSTREAM}.zip">Upstream source archive</a></li>
<li><a href="https://registry.npmjs.org/@strudel/web/-/web-1.2.6.tgz">Pinned runtime package</a></li>
<li><a href="COPYING">AGPL text</a> · <a href="LICENSE">MIT notice for project portions</a></li>
<li><a href="LICENSING.md">Release licensing decision</a> · <a href="NOTICE.md">Copyright notices</a> · <a href="THIRD_PARTY_ASSETS.md">Asset provenance</a></li></ul>
<p>The archive includes browser-readable source. Serve index.html with a static HTTP server; no application compilation is needed. The runtime is fetched from its pinned CDN URL. See BUILD.txt in the archive.</p>
<p><a href="./">Return to player</a></p></main></body></html>'''
    (output/'SOURCE.html').write_text(source_page,encoding='utf-8',newline='\n')
    with zipfile.ZipFile(output/'source.zip','x',compression=zipfile.ZIP_DEFLATED) as archive:
        sources={name:(output/name).read_bytes() for name in files+['SOURCE.html']}
        sources.update({name:(ROOT/name).read_bytes().replace(b'\r\n',b'\n') for name in BUILD_SOURCES})
        sources['BUILD.txt']=(f'Application revision: {revision}\nServe this directory with Python 3: python -m http.server 8000\nOpen http://localhost:8000/ and press Play. Internet access is required for the pinned Strudel runtime.\nNo application compilation is required. Source scores are loaded at runtime.\nFrom a full repository checkout, Python 3.10+ can run release-audit/build_preview.py --output a-new-folder\nArchive files exclude original commercial recordings, lyrics, private data and unrelated repository history.\n').encode()
        for name in sorted(sources):
            entry=zipfile.ZipInfo(name,date_time=(2026,10,18,0,0,0))
            entry.compress_type=zipfile.ZIP_DEFLATED
            archive.writestr(entry,sources[name])
    files+=['SOURCE.html','source.zip']
    manifest=[{'path':name,'sha256':digest((output/name).read_bytes())} for name in sorted(files)]
    report={'created_at':datetime.now(timezone.utc).isoformat(),'commit':revision,'dirty':bool(changed),
        'worktree_dirty_including_audit_reports':worktree_dirty,'uncommitted_payload_paths':changed,
        'publication':'review artifact; explicit approval required before deployment',
        'track_count':len(json.loads((output/'tracks/catalog.json').read_text())),
        'excluded':['all lyrics','reference audio','audit/private files'],
        'files':manifest}
    (output/'release.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    validate_artifact(output)
    (ROOT/'release-audit/reports/preview-build.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'output':str(output),'commit':revision,'dirty':bool(changed),'resources':len(manifest)}))


if __name__=='__main__':
    main()
