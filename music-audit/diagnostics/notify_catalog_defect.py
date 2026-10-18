"""Send the owner's authorized integration-defect report; do not start an OpenCode turn."""
import json
from pathlib import Path
import subprocess
from urllib.request import Request, urlopen

AUDIT = Path(__file__).resolve().parents[1]
SESSION = 'ses_eba92236affe78kOix7iGStNCg'
BASE = 'http://127.0.0.1:4191'
RECEIPT = AUDIT / 'artifacts/catalog-defect-notification.json'


def git(*args):
    return subprocess.check_output(['rtk', 'proxy', 'git', *args], cwd=AUDIT.parent, text=True).strip()


def main():
    if RECEIPT.exists():
        raise SystemExit('Defect report already sent; refusing a duplicate notification')
    if git('branch', '--show-current') != 'agent/codex-music' or git('status', '--porcelain'):
        raise SystemExit('Commit the owned music report on agent/codex-music before notifying')
    with urlopen(f'{BASE}/session/{SESSION}', timeout=25) as response:
        session = json.load(response)
    if Path(session['directory']).name != 'Let_It_Happen':
        raise SystemExit('Unexpected OpenCode session directory; notification not sent')
    revision = git('rev-parse', 'HEAD')
    text = f'''Owner-authorized music integration defect report, 18 October 2026.

The owner says EVERY song heard on the public Strudelify site sounds like random beats.
Read music-audit/reports/RECOGNIZABILITY_RECOVERY.md and live-catalog.json at music branch
agent/codex-music commit {revision}.

Reproduced against https://hustlenix.github.io/strudelify/:
- app.js bundles only Afterglow, Greenline, Paper Moon, Soft Focus, Tiny Hours and Wide Awake,
  credited to Strudelify; all six demo source URLs return 200.
- app.js does not reference tracks/covers/catalog.json. That catalog URL and all eight
  requested cover URLs currently return 404.
- The public bundled originals therefore are not the requested cover catalog. Browser-local
  saved tracks and the owner's exact clicked title were not inspected.

Separate music quality problem: the eight music-branch cover drafts remain runtime-verified,
not faithful/approved. Their full melodies, harmony, bass and form need repair and actual
comparative listening. Wiring these drafts into the player alone will not solve the complaint.
The confirmed 100-song Global / English expansion is deferred behind this musical review gate.

You own application/player/catalog consumption. Please retain this reproducible catalog mismatch
for your integration workflow, ensure future selected songs resolve to their intended reviewed
music source, and do not relabel generic demos or unreviewed drafts as faithful covers.
This is a notification only (noReply); it does not request an automatic merge, deployment or
application edit now. Codex modified only music-audit files and did not change the frontend.
'''
    body = {'noReply': True, 'parts': [{'type': 'text', 'text': text}]}
    request = Request(f'{BASE}/session/{SESSION}/message', data=json.dumps(body).encode(),
                      headers={'Content-Type': 'application/json'}, method='POST')
    with urlopen(request, timeout=25) as response:
        data = json.load(response)
        status = response.status
    receipt = {'session_id': SESSION, 'commit': revision, 'http_status': status,
               'noReply': True, 'message_id': data.get('info', {}).get('id')}
    RECEIPT.parent.mkdir(exist_ok=True)
    RECEIPT.write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    main()
