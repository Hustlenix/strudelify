"""Owner-authorized review notification; never starts an OpenCode assistant turn."""
import json
from pathlib import Path
import subprocess
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
SESSION = 'ses_eba92236affe78kOix7iGStNCg'
BASE = 'http://127.0.0.1:4191'
RECEIPT = ROOT / 'music-audit/artifacts/recovery-handoff-notification.json'


def git(*args):
    return subprocess.check_output(['rtk', 'proxy', 'git', *args], cwd=ROOT, text=True).strip()


def main():
    if RECEIPT.exists():
        raise SystemExit('Notification receipt exists; refusing to duplicate it')
    if git('branch', '--show-current') != 'agent/codex-music' or git('status', '--porcelain'):
        raise SystemExit('Commit the owned review package before notifying')
    with urlopen(f'{BASE}/session/{SESSION}', timeout=25) as response:
        session = json.load(response)
    if Path(session['directory']).resolve() != Path('C:/Users/LalithReddy.b/Let_It_Happen').resolve():
        raise SystemExit('Unexpected destination session directory')
    revision = git('rev-parse', 'HEAD')
    live = json.loads((ROOT / 'music-audit/reports/playback-regressions-live.json').read_text())
    deployment = json.loads((ROOT / 'music-audit/reports/deployed-recovery.json').read_text())
    assert live['status'] == 'PASSED' and len(live['checks']) == 17 and deployment['passed']
    message = f'''Owner-authorized Strudelify music and playback recovery handoff, 18 October 2026.

Music review branch agent/codex-music is pushed at {revision}. Eight arrangements, relative-path
catalog.json, 596 timed automatic lyric draft phrases, runtime/full-capture evidence and music
quality reports are in tracks/covers and music-audit. Original commercial MP3s are unchanged and
uncommitted. Read music-audit/HANDOFF.md and reports/MUSICAL_QUALITY.md, KNOWN_ISSUES.md,
RUNTIME.md, PLAYBACK_RECOVERY.md before approving any composition.

The owner explicitly authorized Codex to repair application integration/deploy and later player
logic, right-side lyrics and unchanged View code. That authorized work used the isolated
strudelify-catalog checkout, not your application checkout. PRs #3 and #4 are merged. Public main
commit {deployment['main_commit']} has a successful Pages deployment, 28 matching resources and
17 passing live playback/navigation/lyrics checks. Public URL: https://hustlenix.github.io/strudelify/.
Fixed confirmed cancellation/overlap, stale selection and detail fetches, preview cleanup,
bounded instrument loading, browser-saved cover collisions, and cooperating-tab audio ownership.
Older open legacy app tabs need one reload for the new transport and ownership protocol.

All eight current scores have matching full-length real WebAudio captures and zero clipped or
nonfinite samples. This is technical evidence, not musical approval. Babydoll's owner feedback
was partial recognition before its latest measured intonation correction. Without Me and Can't
Tell Me Nothing have bass-only repairs; their main hooks/upper harmony remain unresolved after
bounded analysis. Other machine-assisted transcription scores still need comparative listening.
Lyrics are explicitly automatic drafts and may contain mistakes or omissions. No song is approved.

The offline-context probe correction is documented; hardware checks now exclude offline reverb
impulse synthesis. Source MP3s/stems/renders/model weights remain private and ignored. The 100-song
expansion is deferred. This is a review-ready checkpoint, not a claim of eight faithful masters.

Notification only (noReply): do not start work, merge another branch or deploy automatically.
'''
    request = Request(f'{BASE}/session/{SESSION}/message',
                      data=json.dumps({'noReply': True, 'parts': [{'type': 'text', 'text': message}]}).encode(),
                      headers={'Content-Type': 'application/json'}, method='POST')
    with urlopen(request, timeout=25) as response:
        data = json.load(response)
        status = response.status
    receipt = {'session_id': SESSION, 'music_commit': revision, 'http_status': status,
               'noReply': True, 'message_id': data.get('info', {}).get('id')}
    RECEIPT.write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    main()
