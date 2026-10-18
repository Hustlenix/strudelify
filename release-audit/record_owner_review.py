"""Record the owner's actual excerpt feedback; never infer a passing music review."""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
FEEDBACK = [
    ('Unsure / none', 'I dont even know what is playing, how am i suppoded to rate it?'),
    ('Babydoll', 'Idk man, it just feels off. like a random instrumens/notes playing sontinously,but it somehow feels like everything came together and formed a song'),
    ('I Thought I Saw Your Face Today', 'I am not sure whats wrong, but somethings wrong'),
    ('Everyday Normal Guy 2', 'Only this 15 sec is correctly dont in this'),
    ('Unsure / none', 'WTF?'),
    ('Unsure / none', 'I feel like i know this, but IDK. this part is only the beats, so..........'),
    ('Love Me Not', 'Not good'),
    ('Unsure / none', 'WTF IS THIS?'),
]


def main():
    key = json.loads((ROOT / 'release-audit/private/listening/answer-key.json').read_text())
    report_path = ROOT / 'release-audit/reports/music-review.json'
    report = json.loads(report_path.read_text())
    observations = []
    for case, (choice, observation) in zip(key, FEEDBACK, strict=True):
        result = {'case':case['case'], 'id':case['id'], 'expected_title':case['expected_title'],
                  'owner_choice':choice, 'owner_observation_verbatim':observation,
                  'reference_revealed':None, 'blindness':'Not independently verified; owner pasted form content',
                  'full_song_approved':False, 'fidelity_score':None}
        observations.append(result)
        track = next(track for track in report['tracks'] if track['id'] == case['id'])
        track['human_review'] = result
        track['status'] = 'owner-reviewed excerpt; musical correction still required; not approved'
    report['owner_review_sessions'] = 1
    report['independent_listener_count'] = 0
    report['real_listener_count'] = 1
    report['listener_feedback'] = observations
    report['feedback_recorded_at'] = datetime.now(timezone.utc).isoformat()
    report['decision'] = 'Do not ask for numeric ratings of unrecognizable audio. Preserve Everyday Normal Guy 2 interval 12.05–27.05 seconds; repair Babydoll phrasing first; no full song approved.'
    report_path.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print('Recorded actual owner feedback for eight excerpts; no song approved')


if __name__ == '__main__':
    main()
