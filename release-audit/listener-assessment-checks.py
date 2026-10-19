"""Synthetic in-memory trust-boundary cases; no listener response files are created."""
from pathlib import Path
import copy, json, sys
from assess_listener_review import assess, TASK_NAMES
from release_policy import validate_artifact

folder=Path(sys.argv[1]).resolve()
manifest=validate_artifact(folder)
manifest['dirty']=False
template=json.loads(Path('release-audit/approval-template.json').read_text())
catalog=json.loads((folder/'tracks/catalog.json').read_text())
fixture={'receipt':'SYNTHETIC-TEST-ONLY','publication_approved':False,'recorded_claims':{
    'kind':'actual manually submitted original listening feedback','publication_approval':False,
    'personally_performed':True,'build':manifest['commit'],'dirty':False,
    'device_type':'phone','physical_device':'yes','device':'SYNTHETIC PHONE FIXTURE',
    'reviewer':'SYNTHETIC FIXTURE, NOT A LISTENER','usability':'SYNTHETIC',
    'tasks':[{'name':name,'result':'passed'} for name in TASK_NAMES],
    'tracks':[{'id':row['id'],'score_sha256':next(f['sha256'] for f in manifest['files'] if f['path']=='tracks/'+row['codeUrl'].removeprefix('./')),
        'listened_complete':True,'decision':'yes','observations':'SYNTHETIC; NOT HUMAN FEEDBACK'} for row in catalog]}}

def check(value):
    return assess(value,manifest,manifest,folder,template)

result=check(fixture)
assert result['facts_ready_for_operator_review'] and result['publication_approved'] is False
assert result['approval_candidate']['publication_approved'] is False
checks=1
for mutation in [
    lambda d:d['tracks'][0].update(listened_complete=False),
    lambda d:d['tracks'][0].update(decision='needs-correction'),
    lambda d:d.update(device_type='emulated'),
    lambda d:d['tasks'][0].update(result='failed'),
    lambda d:d['tasks'][0].update(name='Unrecognized check'),
    lambda d:d.update(device='')]:
    changed=copy.deepcopy(fixture);mutation(changed['recorded_claims'])
    assert not check(changed)['facts_ready_for_operator_review']
    checks+=1
for mutation in [
    lambda d:d.update(build='0'*40),
    lambda d:d['tracks'][0].update(score_sha256='0'*64),
    lambda d:d.update(personally_performed=False),
    lambda d:d['tracks'].append(d['tracks'][0])]:
    changed=copy.deepcopy(fixture);mutation(changed['recorded_claims'])
    try:
        check(changed)
    except ValueError:
        checks+=1
    else:
        raise AssertionError('Invalid review crossed the assessment boundary')
report={'status':'PASSED','checks':checks,'human_review':False,'fixture_only':True,
        'publication_authorized_by_tool':False}
Path('release-audit/reports/listener-assessment-checks.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
