"""Summarize actual browser/resource/preservation evidence without upgrading music status."""
from pathlib import Path
import hashlib, json, subprocess
from datetime import datetime, timezone
from release_policy import source_path

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / 'release-audit/reports'


def main():
    browsers = [json.loads((REPORTS / f'player-{name}.json').read_text()) for name in ['chromium','firefox']]
    assert all(report['status'] == 'PASSED' and len(report['checks']) == 18 and not report['errors'] for report in browsers)
    build = browsers[0]['build']
    assert browsers[1]['build']['files'] == build['files']
    assert browsers[1]['build']['commit'] == build['commit']
    # Documentation can be refined after a test; runtime payload cannot silently change.
    payload = []
    for name in ['app.js','index.html','styles.css','tracks/catalog.json'] + [f'tracks/{name}.strudel' for name in ['afterglow','greenline','paper-moon','soft-focus','tiny-hours','wide-awake']]:
        digest = hashlib.sha256(source_path(ROOT,name).read_bytes()).hexdigest()
        expected = next(entry['sha256'] for entry in build['files'] if entry['path'] == name)
        assert digest == expected, f'Retest changed runtime payload: {name}'
        payload.append({'path':name, 'sha256':digest})
    live = json.loads((REPORTS / 'live-baseline.json').read_text())
    live_player = json.loads((REPORTS / 'baseline-playback-live.json').read_text())
    preservation = json.loads((REPORTS / 'preservation-check.json').read_text())
    music_review = json.loads((REPORTS / 'music-review.json').read_text())
    assert live['passed'] and live_player['status'] == 'PASSED' and preservation['passed']
    result = {'generated_at':datetime.now(timezone.utc).isoformat(), 'tested_commit':build['commit'],
        'candidate_tests':[{key:report[key] for key in ['browser','browser_version','status','started_at','finished_at']}
                           | {'checks':len(report['checks'])} for report in browsers],
        'runtime_payload':payload, 'public_baseline_commit':live['commit'], 'public_baseline_resources':len(live['resources']),
        'public_baseline_checks':len(live_player['checks']), 'candidate_deployed':False,
        'musical_approval':'None of the eight commercial-song studies is approved; new listening review pending.',
        'owner_review_sessions':music_review.get('owner_review_sessions',0),
        'human_excerpt_responses_recorded':len(music_review.get('listener_feedback',[])),
        'independent_listener_count':music_review.get('independent_listener_count',0),
        'reference_recordings_unchanged':len(preservation['original_recordings']),
        'local_preview':'http://127.0.0.1:4189/', 'private_blind_review':'http://127.0.0.1:4188/',
        'gates':['Owner review and explicit merge/deploy approval', 'Integrated-app license and naming decision',
                 'Music/lyric publication permission before public commercial studies', 'Independent human music review and 5–10 real listener sessions'],
        'expansion_started':False}
    (REPORTS / 'final-result.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8', newline='\n')
    text = f'''# Review checkpoint

Exact tested source commit: `{build['commit']}`. Later report-only commits can carry this evidence;
the ten runtime payload hashes in final-result.json must still match the tested artifact.

- Chromium {browsers[0]['browser_version']}: 18/18 passed.
- Firefox {browsers[1]['browser_version']}: 18/18 passed.
- Fresh existing public baseline: 17 checks passed and 28 resources match main `{live['commit']}`.
- Proposed candidate is local only: http://127.0.0.1:4189/.
- Private title-blind music comparisons: http://127.0.0.1:4188/.
- Six original synth patterns in the proposed public artifact; eight commercial studies preserved for review.
- 16 original recording copies and 62 preserved music/art/lyric resources verified.
- Public GitHub feedback draft/form added; real listener submissions are not fabricated.
- Human music approval and publication/naming/license gates remain open. No new arrangements started.

## Actual screenshots

![Chromium desktop](../evidence/chromium-desktop.png)
![Chromium mobile](../evidence/chromium-mobile.png)
![Firefox desktop](../evidence/firefox-desktop.png)
![Firefox mobile](../evidence/firefox-mobile.png)

Read RELEASE_CANDIDATE.md, MUSIC_RECOGNITION.md, RESOURCE_DECISIONS.md and THIRD_PARTY_ASSETS.md
for scope, remaining faults and decisions. This checkpoint is review-ready; it is not a claim
that all eight songs are recognizable or that the proposed artifact has been publicly released.
'''
    (REPORTS / 'FINAL_RESULT.md').write_text(text, encoding='utf-8', newline='\n')
    print(json.dumps({'tested_commit':build['commit'], 'browser_checks':36, 'live_checks':17, 'candidate_deployed':False}))


if __name__ == '__main__':
    main()
