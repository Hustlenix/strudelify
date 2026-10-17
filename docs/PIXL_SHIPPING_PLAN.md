# PIXL T4 Nexus candidacy — Strudelify shipping plan

Goal: aim for T4 based on genuine system depth, not appearance, code quantity or time-padding. **No tier or 30,000-pixel payout is guaranteed.**

Official sources reviewed 2026-10-17:
- https://pixl.hackclub.com/docs/energy
- https://pixl.hackclub.com/docs/rewards
- https://pixl.hackclub.com/docs/software-requirements
- https://pixl.hackclub.com/docs/submitting
- https://pixl.hackclub.com/docs/eligibility

## PIXL reward reality

T4 earns 25 Restoration Energy (RE) per reviewer-approved hour, not 25 pixels per hour. Pixels pay at a rate that starts at 40 px/h and can reach 60 px/h with lifetime RE; the current project can raise its own payout rate. 30,000 px implies roughly **500–750 approved hours** across the advertised extreme rates. This is not an instruction to log or invent those hours; eligibility and reviewer approval determine which time counts. Prior rewarded work must not be submitted again as fresh work.

A flagship build can take months. Allocate short, sustainable sessions and protect school and sleep. Stop on a verified milestone rather than continuing agent edits indefinitely.

## Review requirements to make routine from day one

- Public accessible source repository, accurate README, multiple meaningful commits and setup instructions.
- Working public demo URL or a playable build/video that is distinct from the repo URL.
- Authentic project thumbnail and progress screenshots.
- Hackatime tracking of the developer's eligible time, with correct project association.
- Journal text proportional to time (currently minimum approximately 100 characters per claimed hour, with 100-character floor). Describe actual changes, failures and verification.
- Candid AI disclosure of scaffolding, code suggestions, debugging and assistance.
- Eligibility check for prior YSWS payments and school coursework; document existing work versus new work.
- Working functionality is more valuable than untested feature count; reviewers can reduce accepted hours when they do not match scope.

If official pages disagree about a historical hour cutoff, consult the project dashboard and current PIXL staff before making a cutoff claim.

## Milestones and hard acceptance gates

### M0 — Preservation and evidence baseline
Freeze active branches, preserve backups, document which existing functionality runs. Capture the live demo, bug ledger, and starting commit. No deletion of previous arrangements.

**Gate:** reproducible local server + verified original-six playback + clean isolated worktrees.

### M1 — Professional listening core
One reliable playback state machine, search, responsive home, queue, next/previous, shuffle/repeat, favorites and playlists. Errors and loading states work. Navigation never double-plays tracks.

**Gate:** desktop/mobile browser tests, actual audible playback, deterministic stop and no stale pattern overlap.

### M2 — Developer studio and version graph
Editor, audible preview, fork, immutable save versions, version diff, undo, parent linkage, metadata attribution, project ownership.

**Gate:** real edit → preview → save → reload → compare → fork interaction, persistent identity and source hashes.

### M3 — Scale-capable music catalog
Indexed metadata, lazy-loading, ingestion validator, audio dependency manifest, search performance tests and 350-record benchmark. Distinguish validated original/authorized arrangements from private musical studies.

**Gate:** hundreds of records indexed without a slow startup, missing assets fail gracefully, reproducible test report. '350 records' is not the same as 350 faithful covers.

### M4 — Community/publishing system
Account protection, creator profiles, authenticated publishing, review queues, safe execution boundary for untrusted code, sharing, moderation and rate limits.

**Gate:** two real test users with separate state can publish and remix securely; malicious submissions are rejected/isolated. No fake community data.

### M5 — Reliability and offline
PWA of eligible assets, offline-compatible library, audio performance profiling, observability, accessible controls, integration tests, clean demo and complete contributor guide.

**Gate:** end-to-end demo from independent browser, acceptable mobile performance, outage fallback, reviewed licensing.

## Reporting

Keep `docs/devlogs/YYYY-MM-DD.md` only for legitimate session records (not invented history), screenshot evidence, commit links and actual test results. Maintain a simple checked feature matrix (not a count of commits). Prepare demo screen recording of **real behavior** and show failed-edge-case recovery.

## Policy, ethics and licensing

Strudel upstream requests that independent integrations avoid using 'Strudel' as a public product name and comply with AGPL. Resolve licensing and attribution before production. Do not upload licensed commercial MP3s or distribute unauthorized covers. AI use is allowed under PIXL rules when disclosed honestly; reviewer credit is for the eligible participant's own work.
