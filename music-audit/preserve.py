"""Read-only source preservation. Run only from the isolated music worktree."""
from pathlib import Path
import hashlib, json, shutil

ROOT = Path(__file__).resolve().parent
OLD = Path(r'C:\Users\LalithReddy.b\.codex\Let_It_Happen\strudel-album-audit')
ALBUM = Path(r'C:\Users\LalithReddy.b\Let_It_Happen\album\strudel')
APP = Path(r'C:\Users\LalithReddy.b\strudelify\tracks')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
inventory=[]
for p in OLD.rglob('*'):
    rel=p.relative_to(OLD)
    if not p.is_file() or any(x in {'.venv','node_modules','cache','__pycache__'} for x in rel.parts): continue
    dest=ROOT/'preserved'/rel
    dest.parent.mkdir(parents=True,exist_ok=True)
    if dest.exists() and sha(dest)!=sha(p): raise RuntimeError(f'Preserved evidence differs: {rel}')
    if not dest.exists(): shutil.copy2(p,dest)
    inventory.append({'source':str(p),'preserved':str(dest.relative_to(ROOT)),'sha256':sha(p)})
manifest=json.loads((OLD/'album-manifest.json').read_text(encoding='utf-8'))
covers=ROOT.parent/'tracks'/'covers'; covers.mkdir(parents=True,exist_ok=True)
selections=[]
for t in manifest:
    a=ALBUM/t['expected_filename']; b=APP/t['expected_filename']
    if not a.exists() or not b.exists(): raise RuntimeError(f'Missing candidate: {t["id"]}')
    # A divergent implementation requires review, never a blind overwrite.
    same=sha(a)==sha(b)
    dest=covers/a.name
    if not dest.exists(): shutil.copy2(a,dest)
    backup=ROOT/'baseline'/a.name; backup.parent.mkdir(exist_ok=True)
    if not backup.exists(): shutil.copy2(a,backup)
    selections.append({'id':t['id'],'album_source':str(a),'album_sha256':sha(a),'application_source':str(b),'application_sha256':sha(b),'identical':same,'selected':'album baseline; no fidelity approval inferred'})
(ROOT/'preservation.json').write_text(json.dumps({'evidence':inventory,'arrangements':selections},indent=2),encoding='utf-8')
print(json.dumps({'preserved_files':len(inventory),'arrangements':selections},indent=2))
