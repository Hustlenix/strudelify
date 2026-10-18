"""Original abstract SVG artwork with the actual cover's title and credit."""
from pathlib import Path
import json, math, html, shutil

repo=Path(__file__).resolve().parents[2]
dest=repo/'tracks/covers/art';dest.mkdir(exist_ok=True)
colors=[('#b84c5e','#253e52'),('#b47d34','#212c32'),('#558c70','#173a38'),('#587ca7','#1f304e'),
        ('#aa5e44','#302b36'),('#9f688e','#403858'),('#80915a','#343d42'),('#508b99','#273149')]
for i,t in enumerate(json.loads((repo/'tracks/covers/catalog.json').read_text())):
    a,b=colors[i]; paths=[]
    for row in range(19):
        points=' '.join(f'{x},{105+row*5+math.sin(x/39+row*.18)*22:.1f}' for x in range(0,321,4))
        paths.append(f'<polyline points="{points}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>')
    title=html.escape(t['title']);artist=html.escape(t['artist'])
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="{title} — instrumental Strudel cover">
<defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient></defs>
<rect width="320" height="320" fill="url(#g)"/><circle cx="232" cy="83" r="39" fill="#fff" opacity=".18"/>
{''.join(paths)}<text x="22" y="29" font-family="sans-serif" font-size="9" letter-spacing="2" fill="#fff">STRUDELIFY / COVER {i+1:02}</text>
<text x="22" y="265" font-family="sans-serif" font-size="{11 if len(title)>24 else 16}" font-weight="bold" fill="#fff">{title}</text>
<text x="22" y="288" font-family="sans-serif" font-size="11" fill="#fff" opacity=".75">{artist}</text></svg>'''
    (dest/(t['id']+'.svg')).write_text(svg,encoding='utf-8')
if len(__import__('sys').argv)>1:
    shutil.copytree(dest,Path(__import__('sys').argv[1])/'tracks/covers/art',dirs_exist_ok=True)
