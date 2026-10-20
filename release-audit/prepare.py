"""Prepare release metadata and minimal markup without replacing the application."""
from pathlib import Path
import json
from release_policy import source_path

ROOT = Path(__file__).resolve().parents[1]


def main():
    originals = [
        ('afterglow', 'Afterglow', 78, 'Warm ambient', 'Soft focus'),
        ('greenline', 'Greenline', 104, 'Night motion', 'Night motion'),
        ('paper-moon', 'Paper Moon', 86, 'Dusty keys', 'Slow burn'),
        ('soft-focus', 'Soft Focus', 68, 'Dreamy drift', 'Soft focus'),
        ('tiny-hours', 'Tiny Hours', 112, 'Offbeat synth', 'Night motion'),
        ('wide-awake', 'Wide Awake', 96, 'Bright pulse', 'Slow burn'),
    ]
    catalog = [{'id': ident, 'title': title, 'artist': 'Strudelify', 'codeUrl': './' + ident + '.strudel',
                'bpm': bpm, 'genre': genre, 'group': group, 'palette': index + 1,
                'kind': 'original', 'status': 'draft', 'reviewStatus': 'unreviewed',
                'rights': {'status': 'project-original', 'license': 'MIT',
                           'evidence': '../README.md#interface-and-features'}}
               for index, (ident, title, bpm, genre, group) in enumerate(originals)]
    source_path(ROOT,'tracks/catalog.json').write_text(json.dumps(catalog, indent=2) + '\n', encoding='utf-8', newline='\n')
    html = source_path(ROOT,'index.html').read_text(encoding='utf-8')
    html = html.replace('playback-lyrics-20261018', 'mvp-review-20261018')
    html = html.replace('app-shell lyrics-open', 'app-shell')
    html = html.replace('Eight instrumental covers in review.<br>Six original patterns to explore.',
                        'Six original instrumental patterns.<br>Drafts for listening and feedback.')
    html = html.replace('Play a cover to follow its lyrics.', 'Commercial lyrics are withheld pending permission.')
    html = html.replace('<h2>Lyrics</h2>', '<h2>Track notes</h2>')
    html = html.replace('Show lyrics', 'Show track notes').replace('Close lyrics', 'Close track notes')
    html = html.replace('title="Lyrics"', 'title="Track notes"')
    html = html.replace('<section class="lyrics-panel" aria-label="Lyrics">', '<section class="lyrics-panel" aria-label="Track notes">')
    old = '<a href="https://strudel.cc" target="_blank" rel="noreferrer">Powered by Strudel ↗</a>'
    new = ('<div class="release-links"><a href="https://github.com/Hustlenix/strudelify/issues/new" '
           'data-feedback="" target="_blank" rel="noreferrer">Report an issue (GitHub) ↗</a>'
           '<a href="https://github.com/Hustlenix/strudelify" target="_blank" rel="noreferrer">Application source ↗</a>'
           '<a href="https://strudel.cc" target="_blank" rel="noreferrer">Powered by Strudel ↗</a>'
           '<a href="THIRD_PARTY_ASSETS.md">Licenses and sources</a></div>')
    if old in html:
        html = html.replace(old, new)
    source_path(ROOT,'index.html').write_text(html, encoding='utf-8', newline='\n')
    print('Prepared original-only public catalog and review markup; eight cover sources are unchanged')


if __name__ == '__main__':
    main()
