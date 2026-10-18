"""Encode owned original renders for the temporary phone review; no reference MP3 access."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib, json, subprocess

ROOT=Path(__file__).resolve().parents[1]
FOLDER=ROOT/'release-audit/private/originals-v2'


def main():
    catalog=json.loads((ROOT/'tracks/catalog.json').read_text())
    def encode(row):
        source=FOLDER/(row['id']+'.wav')
        target=FOLDER/(row['id']+'.mp3')
        subprocess.run(['rtk','proxy','ffmpeg','-v','error','-nostdin','-n','-i',str(source),
            '-c:a','libmp3lame','-b:a','192k',str(target)],check=True)
        return {'id':row['id'],'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
            'encoded_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size,
            'kind':'Project-original synthesized listening render, not commercial audio'}
    with ThreadPoolExecutor(max_workers=2) as pool:
        rows=list(pool.map(encode,catalog))
    report={'tracks':rows,'publication':'temporary HTTPS review only; excluded from Pages artifact',
        'commercial_reference_files_read':0}
    (ROOT/'release-audit/reports/phone-review-audio.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'tracks':len(rows),'total_bytes':sum(row['bytes'] for row in rows)}))


if __name__=='__main__':
    main()
