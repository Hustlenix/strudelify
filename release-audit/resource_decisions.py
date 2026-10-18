"""Turn the supplied resource guide into an explicit, non-installing adoption matrix."""
from pathlib import Path
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]
KIT = Path('C:/Users/LalithReddy.b/Downloads/strudelify_codex_resources/strudelify_resource_kit')


def main():
    lines = (KIT / 'RESOURCE_GUIDE.md').read_text(encoding='utf-8').splitlines()
    rows = []
    tier = ''
    for line in lines:
        if line.startswith('## Tier '):
            tier = line
        if not line.startswith('| ') or not tier or 'http' not in line:
            continue
        cells = [cell.strip().replace('**', '') for cell in line.strip('|').split('|')]
        name, url, value = cells[:3]
        license_note = cells[3]
        decision, owner, reason = 'ADOPT LATER', 'No owned files changed now', value
        if name in ['Existing Strudelify', 'Official Strudel integration', 'Strudel sample docs', 'Strudel FAQ', 'GitHub Actions']:
            decision, owner = 'KEEP', 'Application and release-audit/'
        if name == 'Playwright':
            decision, owner, license_note = 'ADOPT NOW', 'release-audit/ only', 'Apache-2.0 verified from installed 1.56.1 LICENSE'
        if name == 'Official Strudel integration':
            license_note = 'AGPL-3.0-or-later verified from installed 1.2.6 metadata/LICENSE'
        if name in ['Tone.js', 'Vercel Next.js SaaS Starter', 'Better Auth', 'Neon', 'Official shadcn registry', 'Cover Art Archive', 'Pixabay terms']:
            decision = 'REJECT for this MVP'
            reason = {'Tone.js':'A second audio scheduler is unnecessary.',
                'Vercel Next.js SaaS Starter':'Billing-oriented second starter is unnecessary; study Supabase starter only later.',
                'Better Auth':'Do not mix with the single deferred Supabase Auth approach.',
                'Neon':'Do not add a second deferred database provider.',
                'Official shadcn registry':'Third-party registry licenses vary; existing vanilla UI is sufficient.',
                'Cover Art Archive':'Accessible artwork does not establish republication permission.',
                'Pixabay terms':'Custom license and standalone redistribution limits; no MVP need.'}[name]
        if name in ['shadcn/ui (official)', 'Lucide', 'Phosphor Icons', 'Google Fonts', 'Kenney Interface Sounds',
                    'Kenney UI Audio', 'Kenney Music Jingles', 'Kenney UI Pack', 'Unsplash', 'Freesound']:
            reason += ' No assets/components needed by the confirmed failures; keep current UI and native synths.'
        if name == 'librosa':
            decision, owner = 'KEEP offline only', 'Existing private music audit; no app dependency'
        if name == 'Audacity':
            reason = 'Optional human A/B annotation tool; private browser comparison already exists.'
        if name == 'Next.js Supabase Starter':
            reason = 'Only deferred auth-starter reference selected; cookie/session and RLS patterns later. No cloning, account, service or migration now.'
        rows.append((name, url, decision, license_note, owner, reason))
    content = '''# Resource adoption decisions

The supplied kit is a research reference. This MVP retains static HTML/CSS/JavaScript,
Strudel 1.2.6 and the current design. No framework, backend, paid service, UI system or
new sample pack is introduced. One Codex agent, one branch: `codex/mvp-recovery`.

Only installed license evidence is described as verified below. Other license labels are
the kit's reported terms, **not freshly verified asset permissions**; recheck the exact
item/version before adoption. Deferred resources have no installed version or file ownership.

| Resource | Decision | License / evidence | Ownership now | Integration value / reason |
|---|---|---|---|---|
'''
    for name, url, decision, license_note, owner, reason in rows:
        content += f'| [{name}]({url}) | {decision} | {license_note} | {owner} | {reason} |\n'
    content += '''
## Creative references

| Reference | Decision | Use |
|---|---|---|
| Spotify | KEEP as UX research only | No copying code, logos, fonts or artwork. No further redesign. |
| GitHub | KEEP | Source, reviewed changes and explicit listener issue intake. |
| Strudel REPL | KEEP | Official runtime API reference; source link and copyright notice. |
| Ableton Learning Music | ADOPT LATER | Optional beginner learning reference; no assets copied. |
| Sonic Pi | ADOPT LATER | Creative-workflow reference only; no second engine. |
| WaveSurfer examples | ADOPT LATER | Existing private A/B audio controls cover current review needs. |

## Staged zero-cost bootstrap

1. `cd release-audit`; `rtk proxy npm ci --ignore-scripts --no-audit --no-fund`.
   This installs exactly locked Playwright 1.56.1 development tooling. Runtime stays pinned at 1.2.6.
2. Use installed Chrome and Firefox with the audit script; CI may install Playwright's matching
   open-source browsers using `rtk proxy npx playwright install --with-deps chromium firefox`.
3. Build an explicit allowlisted local artifact with `rtk proxy python -X utf8 release-audit/build_preview.py`.
   Test that artifact with `rtk proxy node release-audit/player-checks.mjs`.
4. Run the separate live-baseline checks and compare served hashes. No current production configuration changes.
5. Review the diff, music recognition results and license/naming gates before any merge/deploy approval.

Rollback: stop the preview server and switch away from this branch after saving work.
The baseline commit and separate music branch preserve all scores and earlier audit evidence.
The public site is unchanged by local builds. No destructive reset, cleanup, new backend or
source/recording overwrite is needed. A future release must deploy only the allowlisted artifact,
not this repository root or any private review directory.
'''
    (ROOT / 'release-audit/RESOURCE_DECISIONS.md').write_text(content, encoding='utf-8', newline='\n')
    manifest = [{'file': p.name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                for p in sorted(KIT.glob('*.md'))]
    (ROOT / 'release-audit/reports/resource-kit.json').write_text(json.dumps({'source': str(KIT), 'files': manifest,
        'resource_rows': len(rows), 'new_production_dependencies': 0}, indent=2) + '\n', encoding='utf-8', newline='\n')
    print('Recorded decisions for', len(rows), 'resources and six creative references; no bulk installation')


if __name__ == '__main__':
    main()
