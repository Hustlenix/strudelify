"""Inspect public artifacts; require actual owner facts for a publication run."""
from pathlib import Path
import argparse, json, os
from release_policy import validate_artifact, validate_approval


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('artifact')
    parser.add_argument('--require-approval',action='store_true')
    args=parser.parse_args()
    manifest=validate_artifact(args.artifact)
    if args.require_approval:
        approval=json.loads(os.environ['RELEASE_APPROVAL_JSON'])
        validate_approval(approval,manifest,args.artifact)
        if os.environ.get('GITHUB_ACTOR') and approval['owner']!=os.environ['GITHUB_ACTOR']:
            raise ValueError('The dispatch actor must be the recorded approving owner')
    print(json.dumps({'artifact':str(Path(args.artifact).resolve()),'commit':manifest['commit'],
        'resources':len(manifest['files']),'clean':not manifest['dirty'],
        'publication_approval_checked':args.require_approval}))


if __name__=='__main__':
    main()
