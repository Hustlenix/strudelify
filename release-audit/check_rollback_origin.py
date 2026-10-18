"""Only a previously successful approved release run can supply a rollback artifact."""
from urllib.request import Request, urlopen
import json, os

run_id=os.environ['RELEASE_RUN_ID']
if not run_id.isdigit():
    raise ValueError('Expected a numeric GitHub Actions run ID')
repo=os.environ['GITHUB_REPOSITORY']
request=Request(f'https://api.github.com/repos/{repo}/actions/runs/{run_id}',
    headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json'})
with urlopen(request,timeout=30) as response:
    run=json.load(response)
if (run['repository']['full_name']!=repo or run['path']!='.github/workflows/pages-release.yml'
    or run['conclusion']!='success' or run['event']!='workflow_dispatch'):
    raise ValueError('Rollback must use a successful manual approved Pages release from this repository')
print(json.dumps({'verified_release_run':int(run_id),'conclusion':run['conclusion']}))
