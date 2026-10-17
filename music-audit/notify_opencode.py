"""Authorized handoff notification only; no assistant turn or application work."""
from pathlib import Path
import json,urllib.request,subprocess
ROOT=Path(__file__).resolve().parent
session='ses_eba92236affe78kOix7iGStNCg'
receipt=ROOT/'artifacts/opencode-notification.json'
if receipt.exists():raise SystemExit('Notification receipt already exists; do not send duplicates')
revision=subprocess.check_output(['rtk','proxy','git','rev-parse','HEAD'],cwd=ROOT.parent,text=True).strip()
assert subprocess.check_output(['rtk','proxy','git','branch','--show-current'],cwd=ROOT.parent,text=True).strip()=='agent/codex-music'
assert not subprocess.check_output(['rtk','proxy','git','status','--porcelain'],cwd=ROOT.parent,text=True).strip(),'Commit review package before notifying'
text=f'''Codex music handoff notification, authorized by the owner. Music review branch `agent/codex-music` is available at commit {revision}; worktree C:\\Users\\LalithReddy.b\\strudelify-music.

Eight arrangements and tracks/covers/catalog.json are ready for technical integration review. All eight current hashes pass real Strudel 1.2.6 cycle queries, finite endings, named sample-bank validation and 32-second stereo WebAudio captures with zero samples >=0 dBFS. Catalog codeUrl values resolve relative to the catalog file.

Musical approval is still pending: catalog statuses are runtime-verified. Most full melodies, bass/chord sequences, semantic song structures and critical listening remain incomplete. Do not describe these as eight approved faithful covers. Read music-audit/HANDOFF.md, reports/RUNTIME.md, reports/MUSICAL_QUALITY.md, reports/KNOWN_ISSUES.md and reports/COMPARISON.md. Local A/B audio: http://127.0.0.1:4186/review.html.

Important requirement: load fully qualified drum banks, preserve composition headroom/all transforms, and expose Pattern/Hap/TimeSpan for Babydoll. The earlier bare-sound audit missed bank qualification; the fully loaded old mixes exceeded 0 dBFS in Without Me, Can't Tell Me Nothing and She & Him. Composition trims fix the measured windows.

I edited only tracks/covers and music-audit in my isolated worktree. I did not edit your application worktree, merge main, deploy or start the 350-song expansion. This is a notification only: no application edit, automatic merge or deployment is requested. Await the owner's review workflow.'''
body={'noReply':True,'parts':[{'type':'text','text':text}]}
req=urllib.request.Request(f'http://127.0.0.1:4191/session/{session}/message',data=json.dumps(body).encode(),headers={'Content-Type':'application/json'},method='POST')
with urllib.request.urlopen(req,timeout=60) as response:
    data=json.load(response);status=response.status
receipt.write_text(json.dumps({'session_id':session,'commit':revision,'http_status':status,'noReply':True,'response':data},indent=2),encoding='utf-8')
print(json.dumps({'http_status':status,'session_id':session,'commit':revision,'noReply':True,'message_id':data.get('info',{}).get('id')},indent=2))
