"""After an approved deploy, compare served bytes and check withheld paths return 404."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import argparse, hashlib, json, time
from release_policy import validate_artifact

IDS=('01-babydoll','02-without-me','03-everyday-normal-guy-2','04-sailor-song',
     '05-cant-tell-me-nothing','06-love-me-not','07-i-thought-i-saw-your-face-today','08-lonely')


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('artifact')
    parser.add_argument('url')
    parser.add_argument('--output',default='release-audit/reports/public-release.json')
    args=parser.parse_args()
    manifest=validate_artifact(args.artifact)
    base=args.url.rstrip('/')+'/'
    def fetch(name):
        with urlopen(Request(base+name,headers={'Cache-Control':'no-cache'}),timeout=25) as response:
            return response.read()
    def check(row):
        for attempt in range(4):
            try:
                actual=hashlib.sha256(fetch(row['path'])).hexdigest()
                if actual==row['sha256']:
                    return {'path':row['path'],'status':'PASSED','sha256':actual}
            except (OSError,TimeoutError):
                pass
            if attempt<3:
                time.sleep(2)
        return {'path':row['path'],'status':'FAILED'}
    with ThreadPoolExecutor(max_workers=4) as pool:
        rows=list(pool.map(check,manifest['files']))
    served=json.loads(fetch('release.json'))
    if served!=manifest:
        raise ValueError('Served manifest differs from approved artifact')
    published={row['path'] for row in manifest['files']}
    excluded=[f'tracks/covers/{name}.strudel' for name in IDS if f'tracks/covers/{name}.strudel' not in published]
    excluded += [f'tracks/covers/lyrics/{name}.json' for name in IDS]
    excluded+=['release-audit/private/listening/answer-key.json','.git/config','release-audit/reports/baseline.json']
    for name in excluded:
        try:
            fetch(name)
            rows.append({'path':name,'expected':404,'status':'FAILED'})
        except HTTPError as error:
            rows.append({'path':name,'expected':404,'actual':error.code,'status':'PASSED' if error.code==404 else 'FAILED'})
    report={'checked_at':datetime.now(timezone.utc).isoformat(),'url':base,'commit':manifest['commit'],
        'checks':rows,'passed':all(r['status']=='PASSED' for r in rows),
        'boundary':'Manifest resources and enumerated withheld URLs only; no claim about third-party copies or caches.'}
    Path(args.output).parent.mkdir(parents=True,exist_ok=True)
    Path(args.output).write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'passed':report['passed'],'commit':manifest['commit'],'checks':len(rows)}))
    if not report['passed']:
        raise SystemExit('Deployed release did not match approved artifact')


if __name__=='__main__':
    main()
