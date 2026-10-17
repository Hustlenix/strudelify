# OpenCode / Codex coexistence contract

The same repo has suffered overlapping AI-agent edits. Avoid recurrence by isolating filesystem access and establishing merge boundaries.

## Worktree rule

**OpenCode:** separate worktree `strudelify-ui` on `agent/opencode-ui`.
**Codex:** separate worktree `strudelify-music` on `agent/codex-music`.

Before creating worktrees, inspect status and preserve existing uncommitted progress. Never run `git clean`, `git reset --hard`, blind stashes, or workspace-wide destructive commands. Do not auto-merge into `main`.

## Exclusive responsibilities

| OpenCode — Product/Platform | Codex — Engine/Catalog |
|---|---|
| Listener, search, playlists, artist/album pages, design system | Strudel adapter and Web Audio execution |
| State management and single playback coordinator | Track source loading, sample dependencies, validation |
| Studio UI and user-facing editor controls | Audited patterns, version schema, catalog ingestion |
| Accounts, backend API, authorized libraries | Music-specific tests, audio-analysis and quality reports |
| Browser/device accessibility and deployability | Catalog scale/performance fixtures |

Ownership paths are specified in `SYSTEM_ARCHITECTURE.md`. Existing root paths are treated as OpenCode-controlled until migration. Modifications to another owner's paths must be proposed, not directly edited.

## Contract-first dependency flow

1. Codex publishes a stable engine API contract with a mock implementation and test fixture.
2. OpenCode codes against that interface without editing engine internals.
3. Codex delivers changes on its own branch/PR with tests.
4. An integrator reviews and cherry-picks/merges when files and tests are compatible.
5. OpenCode wires the accepted engine through its own application controller; Codex runs the music QA suite against the integrated build without editing OpenCode's files.
6. Every merge records the source commits and test results.

A missing dependency is a blocker to report, not a reason to silently rewrite someone else's subsystem.

## Anti-loop acceptance policy

- Record an acceptance test before modifying a module.
- Work on one bounded issue at a time.
- Make the smallest evidence-supported change.
- Three failed attempts against the same issue triggers a documented blocker and handoff, not a fourth speculative rewrite.
- Once tests pass, commit and stop. Never create activity merely to prove the agent is busy.
- A passing file must not be rewritten for cosmetic reasons without a new acceptance criterion.
- Shared configs and version upgrades require integrator approval.
- AI-generated or inherited code is never represented as wholly human-written work.

## Git and audit trail

Each milestone produces a focused commit or PR, changed-file list, commands/test results, actual sample/audio findings and known failures. Tracked author hours must represent the actual eligible human developer's work as defined by PIXL, not hypothetical machine processing time.

Recommended deliverable sequence:
1. Codex: stable engine facade plus music test harness.
2. OpenCode: stable listener/player using mocked facade.
3. Codex: catalog/source validator, verified sample dependencies.
4. OpenCode: search, queue, library, playlist integration.
5. Integrator: join both and test complete user flow.
