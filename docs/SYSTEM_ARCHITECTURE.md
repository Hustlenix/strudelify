# Strudelify — system architecture proposal

This is a target architecture. The current public site is a static HTML/CSS/JS player with six original demo patterns; do not present the layers below as already implemented.

## Topology

```text
Browser UI (OpenCode)
  |   listener routes, editor, playlists, track cards
  v
Application state/controller (OpenCode)
  |   one authoritative playback state machine
  v
MusicEngine interface (frozen integration boundary)
  |   Promise<load/prepare/play/stop>; events; source validation
  v
Strudel runtime adapter (Codex)
  |   musical code evaluator; sample-bank loading; error/telemetry mapping
  v
Web Audio output

Browser UI
  |
  v
Catalog API + auth + storage (OpenCode, later milestone)
  |---- tracks / creators / search / playlists
  |---- versions / forks / attribution / moderation
  |
  v
Catalog import + analysis validators (Codex)
  |---- source schema validation / dependency detection
  |---- runnable pattern smoke tests / audible output probes
  |---- provenance and copyright metadata checks
```

## Ownership and communication

OpenCode owns `src/ui/**`, `src/app/**`, `src/server/**`, and `tests/platform/**` after they are introduced, plus user journeys and deployment.

Codex owns `src/engine/**`, `catalog/**`, `tracks/**`, `tools/music/**`, and `tests/music/**`.

Shared root files (including `index.html`, `app.js`, `styles.css`, `package.json`, `README.md`, CI configs and docs) require an assigned integrator. Codex must request root-level changes by PR; OpenCode must not silently change engine/catalog files. Preserve the existing static app before restructuring it incrementally.

## Frozen engine boundary — proposed interface

```ts
type PlaybackState = 'idle' | 'loading' | 'ready' | 'playing' | 'stopping' | 'stopped' | 'error';

type EngineTrack = {
  id: string;
  versionId: string;
  sourceUrl: string;           // same-origin, approved pattern file or a trusted URL policy
  tempoBpm?: number;           // informational, not a claim of perfect beat detection
  assets: Array<{id: string; url: string; license: string}>;
};

interface MusicEngine {
  prepare(track: EngineTrack, signal?: AbortSignal): Promise<void>;
  play(track: EngineTrack, signal?: AbortSignal): Promise<void>;
  stop(): Promise<void>;
  getState(): PlaybackState;
  onStateChange(listener: (state: PlaybackState, trackId?: string, error?: Error) => void): () => void;
}
```

A single browser audio owner serializes transitions; track A's obsolete async work must never become audible after selecting track B. Track changes cancel or supersede earlier loads, hush old voices, and provide a definite visual state. Explicit user interaction unlocks Web Audio. Never fake seek/progress for endlessly repeating patterns.

## Catalog model

Keep a stable `trackId` separate from immutable `versionId`; include `creatorId`, source attribution, display title, optional album, genre, optional BPM, playback capability, audit status, source path, dependency manifest, provenance/rights declaration, and hashes.

Optional `parentVersionId` creates an inspectable remix lineage. A separate user library stores liked tracks, playlists and history. Publish versions atomically; never mutate published source bytes.

Public publishing checks: syntactic validity, supported Strudel runtime version, resource availability, maximum execution time/event rate, basic audio presence, clipping observation, metadata validation and manual review when needed. Passing an automated test must not be called a verified faithful cover.

## Security model

Strudel patterns may contain executable JavaScript. Do not auto-run arbitrary third-party submissions in the main application origin, with account cookies or full browser privileges. First scope an isolated preview boundary and a content policy, and review limitations of sandboxing and Web Audio before implementing community uploads.

Validate imported schemas, defend against malicious asset URLs, constrain memory/event output, reject secrets in source, implement rate limits and abuse reports before open publishing, and test cross-account data access. Local reference recordings must stay in the user's browser unless they explicitly initiate a permitted upload.

## Evolution without churn

Stage 1: wrap the current running `app.js` playback behavior in a stable facade without replacing every UI surface.

Stage 2: introduce typed catalog schema and persistent source versions; migrate existing six original demos and the reviewed eight-song studies.

Stage 3: add creator accounts, server-side search, persistent libraries and version graph only after basic listening is robust.

Stage 4: add permissioned publication, safe preview, collaboration workflow, offline caching of eligible sound resources, performance profiling and observability.

## Validation gates

- Browser: no overlapping playback or stranded audio; failure states and controls reliable.
- Music: all shipped patterns evaluate on pinned runtime, output audible audio and stop promptly.
- Catalog: IDs unique, linked files exist, versions immutable, permissions/attribution consistent.
- Security: untrusted source is never silently executed with user credentials.
- Product: search → listen → like/queue → remix → save/fork completes in a real browser.
- Scale: benchmark hundreds of indexed track records and lazy-loaded source assets before claiming 350-song readiness.
