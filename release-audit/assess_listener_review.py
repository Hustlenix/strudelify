"""Turn a submitted review into a factual, still-unapproved release record.

No listener is simulated. This tool neither publishes nor grants owner approval.
The receipt is explicitly selected by the operator after the authorized review flow.
"""
from pathlib import Path
from datetime import datetime, timezone
import argparse, copy, json
from release_policy import validate_artifact, digest

ROOT=Path(__file__).resolve().parents[1]
RECEIPTS=ROOT/'release-audit/private/received-original-reviews'
TASK_NAMES=('First Play','Pause and Resume','Stop','Switch tracks','Search','View Code',
            'Portrait and touch controls','Background and return','Device volume','Connectivity loss and retry')


def assess(receipt, review_manifest, release_manifest, release_folder, template):
    data=receipt['recorded_claims']
    if data.get('kind')!='actual manually submitted original listening feedback':
        raise ValueError('Unexpected receipt kind')
    if receipt.get('publication_approved') is not False or data.get('publication_approval') is not False:
        raise ValueError('A review receipt cannot grant publication approval')
    if data.get('personally_performed') is not True or data.get('dirty') is not False:
        raise ValueError('Missing manual declaration or a clean reviewed build')
    if data.get('build')!=review_manifest['commit'] or release_manifest.get('dirty'):
        raise ValueError('Review or release revision mismatch')
    a={row['path']:row['sha256'] for row in review_manifest['files']}
    b={row['path']:row['sha256'] for row in release_manifest['files']}
    if set(a)!=set(b) or any(a[name]!=b[name] for name in a if name not in {'SOURCE.html','source.zip'}):
        raise ValueError('Application/music changed after the review; review the changed candidate')
    result=copy.deepcopy(template)
    result.update(approved_commit=release_manifest['commit'],publication_approved=False,approved_at=None,
        review_receipt=receipt['receipt'],reviewed_build=data['build'])
    catalog=json.loads((release_folder/'tracks/catalog.json').read_text())
    responses={row['id']:row for row in data.get('tracks',[])}
    if set(responses)!={row['id'] for row in catalog} or len(data['tracks'])!=len(catalog):
        raise ValueError('Missing or unexpected track responses')
    pending=[]
    result['tracks']=[]
    for row in catalog:
        response=responses[row['id']]
        expected=digest((release_folder/'tracks'/f"{row['id']}.strudel").read_bytes())
        if response.get('score_sha256')!=expected:
            raise ValueError('Reviewed score differs: '+row['id'])
        complete=response.get('listened_complete') is True
        accepted=response.get('decision')=='yes' and complete
        if not accepted:
            pending.append({'track':row['id'],'decision':response.get('decision'),'complete':complete,
                            'observations':response.get('observations','')})
        observations=response.get('observations','').strip()
        if not observations:
            observations=f"Explicit review choices: complete={complete}; suitable for beta={response.get('decision')}. No additional remarks supplied."
        result['tracks'].append({'id':row['id'],'score_sha256':expected,'listened_complete':complete,
            'accepted_for_beta':accepted,'reviewer':data.get('reviewer') or 'Anonymous submitted review',
            'observations':observations})
    tasks=data.get('tasks',[])
    task_results=[row.get('result') for row in tasks]
    phone=data.get('device_type')=='phone' and data.get('physical_device')=='yes'
    correct_tasks=len(tasks)==len(TASK_NAMES) and {row.get('name') for row in tasks}==set(TASK_NAMES)
    phone_passed=phone and correct_tasks and bool(data.get('device','').strip()) and all(value=='passed' for value in task_results)
    if not phone_passed:
        pending.append({'phone_passed':False,'physical_phone_claimed':phone,
            'unchecked_or_failed_tasks':[row for row in tasks if row.get('result')!='passed']})
    if phone:
        result['devices']['phone']={'physical_device':True,'passed':phone_passed,
            'model_browser':data.get('device') or 'Device/browser unspecified',
            'observations':data.get('usability') or 'Explicit device checklist results recorded in the selected receipt.',
            'checklist':tasks}
    return {'created_at':datetime.now(timezone.utc).isoformat(),'facts_ready_for_operator_review':not pending,
        'pending':pending,'approval_candidate':result,'publication_approved':False,
        'identity_note':'Receipt records reviewer declarations. Resolve ambiguous sender identity with the owner; do not count this as independently recruited listener evidence.'}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--receipt',required=True,help='Exact receipt UUID filename, selected from the authorized review')
    parser.add_argument('--review-artifact',required=True)
    parser.add_argument('--release-artifact',required=True)
    parser.add_argument('--output',default='release-audit/private/assessed-owner-review.json')
    args=parser.parse_args()
    receipt_path=(RECEIPTS/args.receipt).resolve()
    if receipt_path.parent!=RECEIPTS.resolve():
        raise ValueError('Receipt must remain in the dedicated review folder')
    review_folder=(ROOT/args.review_artifact).resolve()
    release_folder=(ROOT/args.release_artifact).resolve()
    if not review_folder.is_relative_to(ROOT) or not release_folder.is_relative_to(ROOT):
        raise ValueError('Artifacts must stay in this checkout')
    output=(ROOT/args.output).resolve()
    if not output.is_relative_to(ROOT/'release-audit/private') or output.exists():
        raise ValueError('Choose a fresh private audit output')
    result=assess(json.loads(receipt_path.read_text()),validate_artifact(review_folder),
        validate_artifact(release_folder),release_folder,
        json.loads((ROOT/'release-audit/approval-template.json').read_text()))
    output.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'receipt':args.receipt,'facts_ready':result['facts_ready_for_operator_review'],
        'pending_count':len(result['pending']),'publication_approved':False}))


if __name__=='__main__':
    main()
