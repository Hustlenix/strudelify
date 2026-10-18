"""Apply the owner-requested lyric panel to the isolated integration checkout."""
from pathlib import Path
import sys
root=Path(sys.argv[1]);p=root/'index.html';s=p.read_text(encoding='utf-8')
if 'id="lyricsLines"' in s:raise SystemExit('Lyric panel already installed')
s=s.replace('app.js?v=catalog-20261018','app.js?v=playback-lyrics-20261018')
s=s.replace('class="app-shell" id="appShell"','class="app-shell lyrics-open" id="appShell"')
marker='<div class="queue-panel">'
assert marker in s
panel='''<section class="lyrics-panel" aria-label="Lyrics"><header><h2>Lyrics</h2><div><button class="icon-button" data-toggle-queue aria-label="Show play queue" title="Queue"><svg class="icon" aria-hidden="true"><use href="#i-queue"/></svg></button><button class="icon-button" data-toggle-lyrics aria-label="Close lyrics" title="Close lyrics"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button></div></header><strong id="lyricsTitle">Choose a song</strong><p id="lyricsArtist"></p><p id="lyricsNotice" role="status">Play a cover to follow its lyrics.</p><button id="retryLyrics" class="button button-quiet hidden">Retry lyrics</button><div id="lyricsLines" class="lyrics-lines" aria-label="Song lyrics"></div></section>'''
s=s.replace(marker,panel+marker)
marker='<div class="player-tools">'
assert marker in s
s=s.replace(marker,marker+'<button class="icon-button" data-toggle-lyrics aria-label="Show lyrics" title="Lyrics" aria-expanded="true"><svg class="icon" aria-hidden="true"><use href="#i-book"/></svg></button>')
p.write_text(s,encoding='utf-8',newline='\n')
