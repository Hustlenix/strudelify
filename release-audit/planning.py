"""Preserve the 100-slot plan and refresh only the current ten research candidates."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
OLD = ROOT.parent / 'strudelify-music/music-audit/plans/next-100'
OUT = ROOT / 'release-audit/planning'


def main():
    OUT.mkdir(exist_ok=True)
    backlog = json.loads((OLD / 'backlog.json').read_text())
    assert len(backlog['slots']) == 100
    backlog['production_gate'] = 'MVP player, publication permission, human recognition and feedback review; three pilots individually before scaling'
    backlog['recovery_report'] = '../RELEASE_CANDIDATE.md'
    backlog['distribution'] = {'pop_rnb_singer_songwriter_country':60, 'indie_alternative_rock':20, 'electronic_dance':10, 'emerging':10}
    (OUT / 'backlog.json').write_text(json.dumps(backlog, indent=2) + '\n', encoding='utf-8', newline='\n')
    data = json.loads((OLD / 'candidates-2026-10-18.json').read_text())
    data['evidence_level'] = 'Ten chart-presence entries rechecked 18 October 2026; popularity is separate from permission and human music review'
    pilots = {
        'candidate-001': ('2026-09-25', 'https://music.apple.com/us/album/patient-zero-single/6814832200',
            'Melodic pop identity; exact hook/voicings/sections require an authorized full reference.'),
        'candidate-002': ('2026-10-02', 'https://music.apple.com/us/song/6818059593',
            'Sample/interpolation and rap identity make instrumental recognition harder; no inferred lead from speech.'),
        'candidate-003': ('2026-09-04', 'https://music.apple.com/us/song/6792884088',
            'Dense modern pop; sample timbre and voice phrasing need careful manual review.'),
    }
    for entry in data['candidates']:
        entry['rights_status'] = 'not-cleared-for-publication'
        entry['rights_evidence'] = None
        entry['implementation_status'] = 'research-only'
        entry['complexity'] = {'level':None, 'basis':'Not assessed from a full authorized recording; do not invent a rating.'}
        entry['chart_evidence']['rechecked_on'] = '2026-10-18'
        if entry['candidate_id'] in pilots:
            date, url, note = pilots[entry['candidate_id']]
            entry['release_date'] = date
            entry['release_date_evidence'] = {'url':url, 'meaning':'Release date displayed for this Apple Music recording/edition; earlier releases require discography confirmation'}
            entry['official_recording_url'] = url
            entry['complexity']['basis'] = note
            entry['pilot_research_priority'] = int(entry['candidate_id'][-3:])
    data['chart_label_caution'] = 'Global URL path says billboard-global-excl-us while page heading says Global 200; preserve URL and do not silently resolve the discrepancy.'
    (OUT / 'research-batch-01.json').write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8', newline='\n')
    (OUT / 'README.md').write_text('''# Production backlog — research only

100 additional individual songs, Global/English focus, allocation 60 mainstream pop/R&B/
singer-songwriter/country, 20 indie/alternative/rock, 10 electronic/dance, 10 emerging.
All 100 slots are preserved; ten dated candidates are researched. No new composition started.
Unknown release dates, complexity, rights or references remain null, not fabricated.

## Three proposed pilots, after the MVP gates

| Candidate | Recording-date evidence | Current trend evidence | Gate |
|---|---|---|---|
| Patient Zero — Taylor Swift | [Apple Music, 25 September 2026](https://music.apple.com/us/album/patient-zero-single/6814832200) | [Hot 100, 17 October, #1](https://ca.billboard.com/charts/hot-100/2026-10-17) | Full authorized reference, rights and human review missing |
| Solar Eclipse — Drake & Don Toliver | [Apple Music, 2 October 2026](https://music.apple.com/us/song/6818059593) | [Hot 100, 17 October, #5](https://ca.billboard.com/charts/hot-100/2026-10-17) | Same; sample/interpolation identity increases arranging uncertainty |
| Nicole Kidman — ADÉLA | [Apple Music PRIMA recording, 4 September 2026](https://music.apple.com/us/song/6792884088) | [Hot 100, 17 October, #9](https://ca.billboard.com/charts/hot-100/2026-10-17) | Same; displayed edition date does not prove earliest single release |

Chart presence was rechecked against Billboard Canada and Official Charts on 18 October.
No “viral” designation or licensed release is inferred from a chart position. Refresh all
ten research choices immediately before composition work. Preserve the primary URLs in JSON.

Only after existing playback/music/publication/feedback gates: make one pilot at a time,
log actual work time and human feedback, preserve best versions, then decide the next batch.
Measure a 15–30 second identity passage before investing in full form. Runtime, headroom,
phrasing, musical recognition, publication permission and source/version history remain
separate gates. Public approved entries load from tracks/catalog.json without frontend edits.
''', encoding='utf-8', newline='\n')
    print('Preserved 100 slots and ten candidates; three research pilots recorded, zero arrangements started')


if __name__ == '__main__':
    main()
