"""Encode owned original renders for the temporary phone review; no reference MP3 access."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib, json, re, subprocess
from release_policy import source_path

ROOT=Path(__file__).resolve().parents[1]
FOLDER=ROOT/'release-audit/private/originals-v2'
REPORT=ROOT/'release-audit/reports/phone-review-audio.json'


def plan_original_renders(catalog, folder, report):
    """Reject every known input/output conflict before starting any encoder."""
    if not isinstance(catalog,list) or any(not isinstance(row,dict) for row in catalog):
        raise ValueError('The catalog must contain track objects')
    originals=[row for row in catalog if row.get('kind')=='original']
    if not originals:
        raise ValueError('The catalog contains no project-original tracks')
    folder=folder.resolve()
    errors=[]
    jobs=[]
    seen=set()
    if not folder.is_dir():
        errors.append(f'Missing original-render directory: {folder}')
    if not report.parent.is_dir():
        errors.append(f'Missing report directory: {report.parent}')
    if report.exists() or report.is_symlink():
        errors.append(f'Preserve the existing review report before encoding again: {report}')
    for row in originals:
        track_id=row.get('id')
        if not isinstance(track_id,str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',track_id):
            errors.append(f'Unsafe original track ID: {track_id!r}')
            continue
        if track_id in seen:
            errors.append(f'Duplicate original track ID: {track_id}')
            continue
        seen.add(track_id)
        rights=row.get('rights')
        if not isinstance(rights,dict) or rights.get('status')!='project-original':
            errors.append(f'Missing project-original provenance: {track_id}')
            continue
        source=folder/(track_id+'.wav')
        target=folder/(track_id+'.mp3')
        if source.is_symlink() or source.resolve().parent!=folder or not source.is_file():
            errors.append(f'Missing or linked original WAV: {source}')
        if target.exists() or target.is_symlink() or target.resolve().parent!=folder:
            errors.append(f'Preserve the existing review render before encoding again: {target}')
        jobs.append((row,source,target))
    if errors:
        raise ValueError('Phone review preflight failed:\n'+'\n'.join(errors))
    return jobs


def file_sha256(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream,'sha256').hexdigest()


def main():
    catalog=json.loads(source_path(ROOT,'tracks/catalog.json').read_text(encoding='utf-8'))
    jobs=plan_original_renders(catalog,FOLDER,REPORT)
    def encode(job):
        row,source,target=job
        subprocess.run(['rtk','proxy','ffmpeg','-v','error','-nostdin','-n','-i',str(source),
            '-c:a','libmp3lame','-b:a','192k',str(target)],check=True)
        return {'id':row['id'],'source_sha256':file_sha256(source),
            'encoded_sha256':file_sha256(target),'bytes':target.stat().st_size,
            'source_kind':row['kind'],'rights':row['rights'],
            'kind':'Project-original synthesized listening render, not commercial audio'}
    with ThreadPoolExecutor(max_workers=2) as pool:
        rows=list(pool.map(encode,jobs))
    report={'tracks':rows,'publication':'temporary HTTPS review only; excluded from Pages artifact',
        'commercial_reference_files_read':0}
    # Exclusive creation also protects against a report appearing after preflight.
    with REPORT.open('x',encoding='utf-8',newline='\n') as stream:
        stream.write(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'tracks':len(rows),'total_bytes':sum(row['bytes'] for row in rows)}))


if __name__=='__main__':
    main()
