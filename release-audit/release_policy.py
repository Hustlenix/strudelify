"""Shared, explicit site policy. No recursive copy of the checkout into a release."""
from pathlib import Path
import hashlib, json, re, zipfile

IDS = ('afterglow','greenline','paper-moon','soft-focus','tiny-hours','wide-awake')
BASE_FILES = ('index.html','app.js','styles.css','README.md','LICENSE','COPYING','NOTICE.md',
              'LICENSING.md','THIRD_PARTY_ASSETS.md','licenses/Strudel-AGPL-3.0.txt',
              'tracks/catalog.json','assets/icon.svg')
GENERATED_FILES = ('SOURCE.html','source.zip')
BUILD_SOURCES = ('release-audit/build_preview.py','release-audit/build_release.py','release-audit/release_policy.py')
UPSTREAM = 'cbe7aaacfbf8a51f5f5cf39bf79319f273214e24'


def public_files(root):
    root = Path(root)
    catalog = json.loads((root/'tracks/catalog.json').read_text(encoding='utf-8'))
    if not isinstance(catalog,list) or not catalog or len(catalog)>len(IDS):
        raise ValueError('Empty or oversized original-only release catalog')
    seen=set()
    for row in catalog:
        name=row['id']
        if name not in IDS or name in seen or row['codeUrl']!='./'+name+'.strudel':
            raise ValueError('Unapproved identity, duplicate or source path')
        seen.add(name)
        if row['kind']!='original' or row['rights']['status']!='project-original' or row.get('lyricsUrl'):
            raise ValueError('Only project-original instrumentals may enter this release')
        if not row['rights'].get('license') or not row['rights'].get('evidence'):
            raise ValueError('Missing provenance declaration')
    return sorted(set(BASE_FILES)|{'tracks/'+row['id']+'.strudel' for row in catalog}
                  |{'assets/covers/'+name+'.svg' for name in IDS})


def digest(data):
    return hashlib.sha256(data).hexdigest()


def validate_artifact(folder):
    folder=Path(folder).resolve()
    manifest=json.loads((folder/'release.json').read_text(encoding='utf-8'))
    expected=set(public_files(folder))|set(GENERATED_FILES)
    listed=[row['path'] for row in manifest['files']]
    actual={p.relative_to(folder).as_posix() for p in folder.rglob('*') if p.is_file()}
    if len(listed)!=len(set(listed)) or set(listed)!=expected or actual!=expected|{'release.json'}:
        raise ValueError('Artifact file set differs from the independent allowlist')
    if any(p.is_symlink() for p in folder.rglob('*')):
        raise ValueError('Artifact symlinks are forbidden')
    for row in manifest['files']:
        if digest((folder/row['path']).read_bytes())!=row['sha256']:
            raise ValueError('Artifact hash mismatch: '+row['path'])
    if not re.fullmatch('[0-9a-f]{40}',manifest['commit']):
        raise ValueError('Expected full Git revision')
    with zipfile.ZipFile(folder/'source.zip') as archive:
        names=archive.namelist()
        wanted=(expected-{'source.zip'})|set(BUILD_SOURCES)|{'BUILD.txt'}
        if set(names)!=wanted or len(names)!=len(wanted):
            raise ValueError('Unexpected files in application source archive')
        for name in expected-{'source.zip'}:
            if archive.read(name)!=(folder/name).read_bytes():
                raise ValueError('Source archive differs from served source: '+name)
    return manifest


def validate_approval(approval, manifest, folder):
    """Only record human facts after they actually occur; template deliberately fails."""
    folder=Path(folder)
    if manifest.get('dirty') or approval.get('approved_commit')!=manifest['commit']:
        raise ValueError('Approval must name the exact clean artifact commit')
    if approval.get('publication_approved') is not True or not approval.get('owner') or not approval.get('approved_at'):
        raise ValueError('Missing explicit owner publication approval')
    if approval.get('integrated_license')!='AGPL-3.0-or-later' or approval.get('original_provenance_confirmed') is not True:
        raise ValueError('License/provenance decision is pending')
    branding=approval.get('branding',{})
    if not branding.get('public_name') or not branding.get('decision_evidence'):
        raise ValueError('Branding decision is pending')
    if 'strudel' in branding['public_name'].lower() and not branding.get('upstream_permission_evidence'):
        raise ValueError('Current branding requires recorded upstream naming permission')
    if branding['public_name'] not in (folder/'index.html').read_text(encoding='utf-8'):
        raise ValueError('Approved public name differs from the built site')
    catalog=json.loads((folder/'tracks/catalog.json').read_text())
    approved=approval.get('tracks',[])
    if {r['id'] for r in approved}!={r['id'] for r in catalog} or len(approved)!=len(catalog):
        raise ValueError('Every published original needs its own listening decision')
    for row in approved:
        if row.get('listened_complete') is not True or row.get('accepted_for_beta') is not True or not row.get('reviewer') or not row.get('observations'):
            raise ValueError('Missing actual complete listening decision: '+row['id'])
        if row.get('score_sha256')!=digest((folder/'tracks'/f"{row['id']}.strudel").read_bytes()):
            raise ValueError('Approval names an earlier score: '+row['id'])
    for device in ('phone','laptop'):
        row=approval.get('devices',{}).get(device,{})
        if row.get('physical_device') is not True or row.get('passed') is not True or not row.get('model_browser') or not row.get('observations'):
            raise ValueError('Missing actual '+device+' smoke test')
    return True
