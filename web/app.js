const tracks = [
  { id: 'afterglow', title: 'Afterglow', artist: 'Hustlenix Music', mood: 'Warm ambient', loop: '78 BPM', codeUrl: 'tracks/afterglow.strudel', group: 'Soft focus', palette: 1 },
  { id: 'greenline', title: 'Greenline', artist: 'Hustlenix Music', mood: 'Night motion', loop: '104 BPM', codeUrl: 'tracks/greenline.strudel', group: 'Night motion', palette: 2 },
  { id: 'paper-moon', title: 'Paper Moon', artist: 'Hustlenix Music', mood: 'Dusty keys', loop: '86 BPM', codeUrl: 'tracks/paper-moon.strudel', group: 'Slow burn', palette: 3 },
  { id: 'soft-focus', title: 'Soft Focus', artist: 'Hustlenix Music', mood: 'Dreamy drift', loop: '68 BPM', codeUrl: 'tracks/soft-focus.strudel', group: 'Soft focus', palette: 4 },
  { id: 'tiny-hours', title: 'Tiny Hours', artist: 'Hustlenix Music', mood: 'Offbeat synth', loop: '112 BPM', codeUrl: 'tracks/tiny-hours.strudel', group: 'Night motion', palette: 5 },
  { id: 'wide-awake', title: 'Wide Awake', artist: 'Hustlenix Music', mood: 'Bright pulse', loop: '96 BPM', codeUrl: 'tracks/wide-awake.strudel', group: 'Slow burn', palette: 6 },
];

const palettes = [
  'linear-gradient(140deg,#b9bd92,#707b55 52%,#303c2a)',
  'linear-gradient(140deg,#b77b62,#694838 54%,#34251f)',
  'linear-gradient(140deg,#8b8191,#574d68 54%,#292631)',
  'linear-gradient(140deg,#789aa0,#46666a 54%,#26373a)',
  'linear-gradient(140deg,#c68f68,#7c523d 54%,#352820)',
  'linear-gradient(140deg,#a4a15f,#626638 54%,#2b321f)',
];
const groups = [
  { name: 'Cover studies', symbol: '♫', note: 'The original eight, played with Strudel.', palette: 1 },
  { name: 'Slow burn', symbol: '◌', note: 'Take the long way home.', palette: 3 },
  { name: 'Night motion', symbol: '↗', note: 'A little light after dark.', palette: 2 },
  { name: 'Soft focus', symbol: '✳', note: 'Let the edges blur.', palette: 4 },
];

const state = {
  current: null,
  playing: false,
  paused: false,
  loading: false,
  liked: readStorage('strudelify-liked', []),
  custom: readStorage('strudelify-custom', []),
  recent: readStorage('strudelify-recent', []),
  libraryFilter: 'all',
  groupFilter: '',
  catalogFilter: 'all',
  catalogSort: 'recommended',
  toastTimer: 0,
};
const transport = new MusicLibrary.Queue();
let playlists = MusicLibrary.playlists();
let selectedPlaylist = null;
let playlistDialogMode = null;
let playlistDialogTrack = null;
let editorSession = null;
let editorRevision = 0;
let draftTimer = 0;
let pendingImport = null;
let importRevision = 0;
const volatileDrafts = new Map();
let enginePromise;
let coverSamplesPromise;
let activeRepl;
let playbackDuration = 0;
let playbackRevision = 0;
let evaluationQueue = Promise.resolve();
let playbackStartedAt = 0;
let previewing = false;
let previewReturnTrack = null;
let playbackError = '';
let playbackAbort;
const playbackChannel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('strudelify-playback') : null;
if (playbackChannel) playbackChannel.onmessage = event => { if (event.data === 'claim') stopTrack(); };
const codeCache = new Map();
let mediaTrackKey='';
let mediaPositionKey='';
const lyricsCache = new Map();
let lyricsRevision = 0;
let lyricsCues = [];
let highlightedLyric = -1;
let detailRevision = 0;
const coverNames = ['afterglow', 'greenline', 'paper-moon', 'soft-focus', 'tiny-hours', 'wide-awake'];
function icon(name) {
  const filled = ['play', 'pause', 'stop', 'previous', 'next'].includes(name);
  return `<svg class="icon${filled ? ' fill' : ''}" aria-hidden="true"><use href="assets/icons/lucide.svg#i-${name}"/></svg>`;
}
function coverUrl(track) { return track.cover ? `tracks/covers/art/${encodeURIComponent(track.id)}.svg` : `assets/covers/${coverNames[((track.palette || 1) - 1) % coverNames.length]}.svg`; }
function coverImage(track) { return `<img src="${coverUrl(track)}" alt="" loading="lazy" decoding="async">`; }

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function readStorage(key, fallback) {
  try { const value = WorkspaceStorage.read(key, fallback); return Array.isArray(value) ? value : fallback; }
  catch { return fallback; }
}
function saveStorage(key, value) {
  try { WorkspaceStorage.write(key, value); return true; }
  catch { showToast('This browser could not save the change. Export a backup to keep your work.'); return false; }
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}
function allTracks() { return [...tracks.filter(track=>track.cover), ...state.custom, ...tracks.filter(track=>!track.cover)]; }
function getTrack(id) { return allTracks().find(track => track.id === id) || (state.current?.id === id ? state.current : null); }
function artStyle(track) { return `background:${palettes[((track.palette || 1) - 1) % palettes.length]}`; }
function artMarkup(track, className = 'row-art') {
  return `<span class="${className}" style="${artStyle(track)}" aria-hidden="true">${coverImage(track)}</span>`;
}
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}
function formatTime(seconds) {
  const time=Math.max(0,Math.floor(Number(seconds)||0));
  return `${Math.floor(time/60)}:${String(time%60).padStart(2,'0')}`;
}
function updateMediaSession() {
  if(!('mediaSession' in navigator))return;
  const track=state.current;
  const key=track?`${track.id}:${track.title}:${track.artist}`:'';
  try {
    if(key!==mediaTrackKey){
      navigator.mediaSession.metadata=track&&typeof MediaMetadata==='function'?new MediaMetadata({
        title:track.title,artist:track.artist||'Your pattern',album:track.created?'Your Studio':track.cover?'Instrumental cover studies':'Original patterns',
        artwork:[{src:new URL(coverUrl(track),document.baseURI).href,type:'image/svg+xml'}]
      }):null;
      mediaTrackKey=key;
    }
    navigator.mediaSession.playbackState=state.playing?'playing':state.paused?'paused':'none';
  } catch { /* Unsupported OS metadata must not interrupt playback. */ }
}
function updateMediaPosition(position,duration) {
  if(!navigator.mediaSession?.setPositionState)return;
  const key=`${playbackRevision}:${Math.floor(position)}:${state.playing}:${state.paused}:${duration}`;
  if(key===mediaPositionKey)return;
  mediaPositionKey=key;
  try {
    if(Number.isFinite(duration)&&duration>0&&(state.playing||state.paused))
      navigator.mediaSession.setPositionState({duration,position:Math.min(duration,Math.max(0,position)),playbackRate:1});
    else navigator.mediaSession.setPositionState();
  } catch { /* Live and unsupported patterns do not expose a seekable timeline. */ }
}
function installMediaControls() {
  if(!('mediaSession' in navigator))return;
  const actions={play:()=>{if(!state.playing)togglePlayback();},pause:()=>{if(state.playing)togglePlayback();},
    stop:stopTrack,previoustrack:()=>$('#previousButton').click(),nexttrack:()=>advancePlayback()};
  for(const [name,handler] of Object.entries(actions))try{navigator.mediaSession.setActionHandler(name,handler);}catch{}
}
async function sharePublicUrl(hash,title='Music made with Strudel') {
  if(typeof hash!=='string'||!/^#(?:track\/|artist\/|collection\/|home$|explore$|artists$|about$|help$)/.test(hash))return false;
  const url=new URL(document.baseURI);url.search='';url.hash=hash;
  if(navigator.share){
    try{await navigator.share({title,url:url.href});return true;}
    catch(error){if(error?.name==='AbortError')return false;}
  }
  try{await navigator.clipboard.writeText(url.href);showToast('Link copied');return true;}
  catch{
    $('#shareUrlInput').value=url.href;$('#shareHeading').textContent=`Share ${title}`;
    $('#shareCopyStatus').textContent='Copy this link to share the public page.';
    if(!$('#shareDialog').open)$('#shareDialog').showModal();
    $('#shareUrlInput').focus();$('#shareUrlInput').select();return false;
  }
}
function renderProgress(seconds=null) {
  const duration=playbackDuration || state.current?.durationSeconds || 0;
  const position=seconds==null ? ((state.playing||state.paused) && window.getAudioContext ? Math.max(0,window.getAudioContext().currentTime-playbackStartedAt) : 0) : Math.max(0,seconds);
  $('#elapsedTime').textContent=formatTime(position);
  $('#totalTime').textContent=duration>0?formatTime(duration):state.current?'LIVE':'—';
  $('#playbackProgress').max=duration>0?duration:1;
  $('#playbackProgress').value=duration>0?Math.min(position,duration):0;
  $('#playbackProgress').setAttribute('aria-valuetext',duration>0?`${formatTime(position)} of ${formatTime(duration)}`:'Open-ended live pattern');
  updateMediaPosition(position,duration);
}
function setStatus(message, playing = state.playing) {
  $('#playerStatus').textContent = message;
  $('#playerBar').classList.toggle('is-playing', playing);
  $('#mainPlayButton').innerHTML = icon(playing ? 'pause' : 'play');
  $('#mainPlayButton').setAttribute('aria-label', playing ? 'Pause current pattern' : state.paused ? 'Resume current pattern' : 'Play current pattern');
  $('#mainPlayButton').title = playing ? 'Pause current pattern' : state.paused ? 'Resume current pattern' : 'Play current pattern';
}
function getCode(track) {
  if (track.code) return Promise.resolve(track.code);
  if (codeCache.has(track.id)) return codeCache.get(track.id);
  const request = fetch(track.codeUrl, {cache: 'no-cache',signal:AbortSignal.timeout(15000)}).then(response => {
    if (!response.ok) throw new Error(`Could not load ${track.codeUrl} (${response.status}).`);
    return response.text();
  }).catch(error => { codeCache.delete(track.id); throw error; });
  codeCache.set(track.id, request);
  return request;
}
function ensureEngine() {
  if (typeof window.initStrudel !== 'function') throw new Error('The Strudel runtime did not load. Check your connection and refresh.');
  if (!enginePromise) enginePromise = Promise.resolve(window.initStrudel({
    // Original tracks use native synths; cover percussion is loaded on demand.
    defaultOutput: (hap, deadline, duration, cps, time) => {
      if (!state.playing || hap.value?._strudelifySession !== playbackRevision) return;
      return window.webaudioOutput(hap, deadline, duration, cps, time);
    },
  })).then(async repl => {
    activeRepl = repl;
    // defaultPrebake exposes this API. Wait for the registered first gesture's audio/worklets
    // before starting a score, so initialization cannot resume a later paused context.
    await window.initAudioOnFirstClick();
    await silenceEngine();
    return repl;
  }).catch(error => { enginePromise = null; throw error; });
  return enginePromise;
}
// Install Strudel's one-time gesture listener before the first delegated app click.
Promise.resolve().then(ensureEngine).catch(() => {});
function getEvalError(repl) { return repl?.state?.evalError || null; }
async function runCode(code) {
  if (!state.current?.preview) previewReturnTrack = state.current;
  return playTrack({id:'editor-preview', title:'Editor preview', artist:'Unsaved pattern', code, preview:true, palette:5}, true);
}
async function endEditorPreview() {
  if (!state.current?.preview) return;
  const previous = previewReturnTrack;
  const stopping = stopTrack();
  const revision = playbackRevision;
  await stopping;
  if (revision !== playbackRevision || !state.current?.preview) return;
  state.current = previous;
  previewReturnTrack = null;
  if (previous) loadLyrics(previous);
  else {
    ++lyricsRevision; lyricsCues=[];
    $('#lyricsTitle').textContent='Choose a song';
    $('#lyricsArtist').textContent='';
    $('#lyricsNotice').textContent='Choose a pattern to see its playback notes.';
    $('#lyricsLines').replaceChildren();
  }
  renderPlayer(); renderAllLists();
}
function silenceEngine() {
  // hush alone can leave this REPL's clock at the preceding song's cycle. A hard
  // Stop/new selection must reset that clock so a finite score starts at bar zero.
  // Pause/Resume does not call this function and retains its scheduler position.
  activeRepl?.stop();
  // hush stops future scheduling; resetGlobalEffects disconnects already sounding voices/tails.
  if (window.hush) window.hush();
  if (window.resetGlobalEffects) window.resetGlobalEffects();
  const context=window.getAudioContext?.();
  // Suspending the actual output also silences in-flight sample/effect work during cancellation.
  return context && context.state!=='closed' ? context.suspend() : Promise.resolve();
}
function cancellable(promise, signal) {
  if (signal.aborted) return Promise.reject(signal.reason || new DOMException('Playback canceled','AbortError'));
  return new Promise((resolve,reject)=>{
    const abort=()=>reject(signal.reason || new DOMException('Playback canceled','AbortError'));
    signal.addEventListener('abort',abort,{once:true});
    Promise.resolve(promise).then(value=>{signal.removeEventListener('abort',abort);resolve(value);},error=>{signal.removeEventListener('abort',abort);reject(error);});
  });
}
async function prepareInstruments(pattern, repl, code) {
  const duration=Number(code.match(/const (?:endSeconds|sourceDuration)\s*=\s*([\d.]+)/)?.[1]);
  const cycles=duration>0 ? Math.min(128,duration*repl.scheduler.cps+1) : 16;
  const urls=new Set();
  for (const hap of pattern.queryArc(0,cycles)) {
    const value=hap.value;
    if (!value.s) continue;
    if (typeof value.s!=='string' || (value.bank!=null && typeof value.bank!=='string')) throw new Error('This pattern has an unresolved instrument name.');
    const name=((value.bank?value.bank+'_':'')+value.s).toLowerCase();
    let sound=window.soundMap.get()[name];
    if (!sound && name.startsWith('rolandtr909_')) {
      if (!coverSamplesPromise) coverSamplesPromise=cancellable(
        window.samples(new URL('assets/samples/roland-tr909.json',document.baseURI).href),
        AbortSignal.timeout(15000)).catch(error=>{coverSamplesPromise=null;throw error;});
      await coverSamplesPromise;
      sound=window.soundMap.get()[name];
    }
    if (!sound) throw new Error(`Instrument unavailable: ${name}`);
    const samples=sound.data?.samples;
    if (samples) for (const url of (Array.isArray(samples)?samples:Object.values(samples)).flat()) urls.add(url);
  }
  await cancellable(Promise.all([...urls].map(url=>window.loadBuffer(url,window.getAudioContext()))),AbortSignal.timeout(15000));
}
async function playTrack(track, isPreview = false) {
  if (!track) return;
  // Direct selections (including integrations) must establish the same queue
  // position as a card click. Queue/playlist advances already selected their
  // exact occurrence, so retain that snapshot and any duplicate entry IDs.
  if (!isPreview && transport.current?.trackId !== track.id) {
    const entries = allTracks().map(item=>MusicLibrary.entry(item.id));
    const selected = entries.find(item=>item.trackId===track.id);
    if (selected) transport.start(entries, selected.id, 'All patterns');
  }
  const revision = ++playbackRevision;
  playbackAbort?.abort();
  const abort = playbackAbort = new AbortController();
  playbackChannel?.postMessage('claim');
  previewing = isPreview;
  playbackError = '';
  state.playing = false;
  state.paused = false;
  state.loading = true;
  playbackDuration = 0;
  const muted=silenceEngine();
  state.current = track;
  loadLyrics(track);
  renderPlayer();
  renderAllLists();
  setStatus('Waking the synth…', false);
  try {
    // Initialize during the gesture, then serialize real REPL evaluations.
    const [repl, code] = await cancellable(Promise.all([ensureEngine(), getCode(track),muted]),abort.signal);
    if (revision !== playbackRevision) return;
    const start = evaluationQueue.then(async () => {
      if (revision !== playbackRevision) return false;
      const pattern = await repl.evaluate(code, false);
      const error = getEvalError(repl);
      if (error) throw error;
      if (revision !== playbackRevision) return false;
      if (!pattern?.queryArc) throw new Error('This code did not produce a playable pattern.');
      await cancellable(prepareInstruments(pattern,repl,code),abort.signal);
      if (revision !== playbackRevision) return false;
      const sessionPattern = pattern.withValue(value => ({...value, _strudelifySession:revision}));
      await repl.setPattern(sessionPattern, false);
      if (revision !== playbackRevision) return false;
      await silenceEngine();
      await window.getAudioContext().resume();
      if (revision !== playbackRevision) return false;
      state.playing = true;
      await repl.start();
      if (revision !== playbackRevision) { await silenceEngine(); return false; }
      playbackStartedAt = window.getAudioContext().currentTime;
      return true;
    });
    evaluationQueue = start.catch(() => {});
    if (!await start || revision !== playbackRevision) return;
    // A finite source-timed score ends rather than leaving a silent "playing" state.
    const duration = Number(code.match(/const (?:endSeconds|sourceDuration)\s*=\s*([\d.]+)/)?.[1]);
    playbackDuration = duration > 0 ? duration : 0;
    if (!isPreview) {
      state.recent = [track.id, ...state.recent.filter(id => id !== track.id)].slice(0, 6);
      saveStorage('strudelify-recent', state.recent);
    }
    setStatus('Playing live pattern', true);
    renderPlayer();
    renderAllLists();
  } catch (error) {
    if (revision !== playbackRevision) return;
    state.playing = false;
    state.paused = false;
    await silenceEngine();
    playbackError = error?.name==='TimeoutError' ? 'Loading the song or instruments timed out. Try again or refresh.' : error?.message || 'Strudel could not play this track.';
    renderPlayer();
    showToast(playbackError);
    if (isPreview) throw error;
  } finally { if (revision === playbackRevision) { state.loading = false; renderPlayer(); } }
}
async function stopTrack() {
  ++playbackRevision;
  playbackAbort?.abort();
  playbackDuration = 0;
  state.playing = false;
  state.paused = false;
  state.loading = false;
  previewing = false;
  playbackError = '';
  try { await silenceEngine(); }
  catch { /* The interface can still return to its stopped state. */ }
  setStatus(state.current ? 'Pattern stopped' : 'Ready when you are', false);
  renderPlayer();
  renderAllLists();
}
async function togglePlayback() {
  if (state.loading) return stopTrack();
  if (!state.current) return playRandom();
  if (!state.playing && !state.paused) return playTrack(state.current);
  const revision = playbackRevision;
  const context = window.getAudioContext();
  if (state.playing) {
    // Keep the scheduler and scheduled voices intact. Its clock reads AudioContext.currentTime,
    // so suspending native audio preserves phase, envelopes and the finite ending position.
    await context.suspend();
    if (revision !== playbackRevision) return;
    state.playing = false;
    state.paused = true;
  } else {
    playbackChannel?.postMessage('claim');
    state.loading = true;
    renderPlayer();
    try { await context.resume(); }
    catch (error) {
      if (revision === playbackRevision) {
        state.loading = false;
        playbackError = error.message || 'Audio could not resume. Press Play to retry.';
        renderPlayer();
      }
      return;
    }
    if (revision !== playbackRevision) {
      // A completed old resume must not hush a newer selection. If Stop is still the
      // latest intent, suspend its output; a newer load/start owns its own cleanup.
      if (!state.playing && !state.loading) await context.suspend();
      return;
    }
    state.loading = false;
    state.playing = true;
    state.paused = false;
  }
  renderPlayer();
  renderAllLists();
}
function renderPlayer() {
  const track = state.current;
  $('#nowTitle').textContent = track?.title || 'Choose a track';
  $('#nowArtist').textContent = track?.artist || 'Your next loop is waiting';
  $('#playerArt').innerHTML = coverImage(track || tracks[0]);
  $('#likeButton').disabled = !track || !!track.preview;
  $('#likeButton').classList.toggle('liked', !!track && state.liked.includes(track.id));
  $('#likeButton').innerHTML = icon('heart');
  $('#codeButton').disabled = !track;
  renderQueue();
  $('#mainPlayButton').disabled = !track;
  setStatus(playbackError ? 'Could not play · press Play to retry' : state.loading ? 'Loading · press Play to cancel' : state.paused ? 'Paused · resume where you left off' : state.playing ? (previewing ? 'Previewing editor code' : 'Playing live pattern') : track ? 'Pattern stopped' : 'Ready when you are', state.playing);
  if (state.loading) {
    $('#mainPlayButton').innerHTML = icon('stop');
    $('#mainPlayButton').setAttribute('aria-label', 'Cancel loading');
  }
  $('#shuffleButton').classList.toggle('active', transport.shuffle);
  $('#shuffleButton').setAttribute('aria-pressed', String(transport.shuffle));
  $('#repeatButton').classList.toggle('active', transport.repeat !== 'off');
  $('#repeatButton').setAttribute('aria-label', `Repeat: ${transport.repeat === 'context' ? 'collection' : transport.repeat}. Change repeat mode`);
  $('#repeatButton').title = `Repeat: ${transport.repeat === 'context' ? 'collection' : transport.repeat}`;
  $('#repeatOne').classList.toggle('hidden', transport.repeat !== 'one');
  $('#queueShuffleButton').textContent = `Shuffle ${transport.shuffle?'on':'off'}`;
  $('#queueShuffleButton').setAttribute('aria-pressed',String(transport.shuffle));
  $('#queueRepeatButton').textContent = `Repeat ${transport.repeat==='context'?'collection':transport.repeat}`;
  syncPlayButtons();
  renderProgress();
  updateMediaSession();
  window.MusicSite?.syncPlayback?.();
}
function renderPlaylistNav() {
  const items = [{ name: 'All patterns', filter: '', palette: 1 }, ...groups.map(g => ({...g, filter:g.name})), {name:'Liked tracks', liked:true, palette:3}];
  $('#playlistList').innerHTML = items.map(item => `<button class="playlist-link" data-group="${escapeHtml(item.filter || '')}" data-liked-nav="${!!item.liked}" title="${escapeHtml(item.name)}"><span class="playlist-art" style="background:#45337d">${item.liked ? icon('heart') : coverImage(item)}</span><span class="playlist-copy"><strong>${escapeHtml(item.name)}</strong><small>${item.liked ? 'Collection · Saved by you' : 'Collection · Hustlenix Music'}</small></span></button>`).join('');
  $('#playlistList').insertAdjacentHTML('afterbegin', playlists.map(p=>`<button class="playlist-link" data-open-playlist="${escapeHtml(p.id)}" title="${escapeHtml(p.name)}"><span class="playlist-art playlist-placeholder">${icon('book')}</span><span class="playlist-copy"><strong>${escapeHtml(p.name)}</strong><small>Playlist · ${p.entries.length} tracks</small></span></button>`).join(''));
}
function rowMarkup(track, index) {
  const active = state.current?.id === track.id;
  const liked = state.liked.includes(track.id);
  return `<div class="track-row${active && state.playing ? ' playing' : ''}" data-track-id="${escapeHtml(track.id)}">
    <span class="row-number">${String(index + 1).padStart(2, '0')}</span>
    <button class="row-play" data-action="play" aria-label="${active && state.playing ? 'Pause' : 'Play'} ${escapeHtml(track.title)}">${icon(active && state.playing ? 'pause' : 'play')}</button>
    <div class="row-track" data-action="open" role="button" tabindex="0" aria-label="View ${escapeHtml(track.title)}">
      ${artMarkup(track)}<span class="row-title"><strong>${escapeHtml(track.title)}</strong><span>${escapeHtml(track.artist)}</span></span>
    </div>
    <span class="row-mood">${escapeHtml(track.mood || (track.created ? 'Your pattern' : 'Live-coded'))}</span>
    <span class="row-loop">${escapeHtml(track.loop || '∞ loop')}</span>
    <span class="row-options"><button class="row-like${liked ? ' liked' : ''}" data-action="like" aria-label="${liked ? 'Unlike' : 'Like'} ${escapeHtml(track.title)}">${icon('heart')}</button><button class="icon-button" data-action="options" aria-label="Options for ${escapeHtml(track.title)}">${icon('more')}</button></span>
  </div>`;
}
function cardMarkup(track) {
  const liked = state.liked.includes(track.id);
  return `<article class="track-card" data-track-id="${escapeHtml(track.id)}">
    <button class="card-like${liked ? ' liked' : ''}" data-action="like" aria-label="${liked ? 'Unlike' : 'Like'} ${escapeHtml(track.title)}">${icon('heart')}</button>
    <button class="card-options icon-button" data-action="options" aria-label="Options for ${escapeHtml(track.title)}">${icon('more')}</button>
    <div data-action="open" role="button" tabindex="0" aria-label="View ${escapeHtml(track.title)}">${artMarkup(track, 'track-card-art')}</div>
    <button class="card-play" data-action="play" aria-label="Play ${escapeHtml(track.title)}">${icon('play')}</button>
    <div class="track-card-copy" data-action="open" role="button" tabindex="0" aria-label="View ${escapeHtml(track.title)}"><strong>${escapeHtml(track.title)}</strong><span>${escapeHtml(track.cover ? track.artist : track.mood || track.artist)}</span></div>
  </article>`;
}
let homeFilter = 'all';
function renderHome() {
  const recent = state.recent.map(getTrack).filter(Boolean);
  const list = homeFilter === 'created' ? state.custom : homeFilter === 'recent' ? recent : [...new Map([...recent, ...allTracks()].map(t => [t.id,t])).values()];
  $('#quickPicksTitle').textContent = homeFilter === 'created' ? 'Made by you' : homeFilter === 'recent' || recent.length ? 'Jump back in' : 'Start listening';
  $('#quickPickGrid').innerHTML = list.slice(0,8).map(cardMarkup).join('');
  $('#emptyHome').classList.toggle('hidden', list.length > 0);
  $('#gettingStarted').classList.toggle('hidden', homeFilter !== 'all');
  $('#homeTop').classList.toggle('single-shelf', homeFilter !== 'all');
  $('#featureGrid').innerHTML = groups.map(group => `<button class="feature-card" data-group="${escapeHtml(group.name)}" aria-label="Browse ${escapeHtml(group.name)} collection"><span class="feature-art">${coverImage(group)}</span><span class="feature-info"><strong>${escapeHtml(group.name)}</strong><span>${escapeHtml(group.note)}</span></span><span class="feature-play" aria-hidden="true">${icon('play')}</span></button>`).join('');
  $('#homeTrackList').innerHTML = allTracks().map(rowMarkup).join('');
  window.MusicSite?.refreshHome?.();
}
function renderQueue() {
  const row = (entry, source, index) => {
    const track = getTrack(entry.trackId); if (!track) return '';
    return `<div class="queue-entry"><button class="queue-track" data-queue-play="${escapeHtml(entry.id)}" data-queue-source="${source}" aria-label="Play ${escapeHtml(track.title)} next">${artMarkup(track)}<span>${escapeHtml(track.title)}<small>${escapeHtml(track.artist)}</small></span></button>${source==='manual' ? `<div class="queue-entry-actions"><button class="icon-button" data-queue-move="${escapeHtml(entry.id)}" data-direction="-1" ${index===0?'disabled':''} aria-label="Move ${escapeHtml(track.title)} up">↑</button><button class="icon-button" data-queue-move="${escapeHtml(entry.id)}" data-direction="1" ${index===transport.manual.length-1?'disabled':''} aria-label="Move ${escapeHtml(track.title)} down">↓</button><button class="icon-button" data-queue-remove="${escapeHtml(entry.id)}" aria-label="Remove ${escapeHtml(track.title)} from queue">${icon('close')}</button></div>` : ''}</div>`;
  };
  $('#queueList').innerHTML = `<h3>Now playing</h3>${state.current ? `<button class="queue-track queue-current" data-action="open" data-track-id="${escapeHtml(state.current.id)}">${artMarkup(state.current)}<span>${escapeHtml(state.current.title)}<small>${state.loading?'Loading…':state.paused?'Paused':state.playing?'Playing':'Stopped'}</small></span></button>` : '<p>Choose a track to start listening.</p>'}<div class="queue-section-heading"><h3>Next in queue</h3><button class="text-button" id="clearQueueButton" ${transport.manual.length?'':'disabled'}>Clear</button></div>${transport.manual.map((e,i)=>row(e,'manual',i)).join('') || '<p>Add tracks from their options menu.</p>'}<h3>Next from: ${escapeHtml(transport.label)}</h3>${transport.upcoming().map((e,i)=>row(e,'context',i)).join('') || '<p>End of this collection.</p>'}`;
}
async function loadLyrics(track) {
  if (!$('#lyricsLines')) return; // A cached older page can still load the new transport safely.
  const revision = ++lyricsRevision;
  lyricsCues = [];
  highlightedLyric = -1;
  $('#lyricsTitle').textContent = track.title;
  $('#lyricsArtist').textContent = track.artist;
  $('#lyricsLines').replaceChildren();
  $('#retryLyrics').classList.add('hidden');
  $('#lyricsNotice').textContent = track.cover ? 'Instrumental study. No licensed lyrics are attached.' : 'Original instrumental pattern. No lyrics are attached.';
  if (!track.lyricsUrl || track.lyricsRights !== 'cleared') return;
  try {
    if (!lyricsCache.has(track.id)) lyricsCache.set(track.id,
      fetch(track.lyricsUrl, {cache:'no-cache'}).then(async response => {
        if (!response.ok) throw new Error('Lyrics could not be loaded.');
        const data = await response.json();
        if (data.id !== track.id || !Array.isArray(data.cues) || data.cues.some(cue =>
          typeof cue.text !== 'string' || !Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < 0 || cue.end < cue.start))
          throw new Error('Lyrics data is invalid.');
        return data;
      }).catch(error => {lyricsCache.delete(track.id);throw error;}));
    const data = await lyricsCache.get(track.id);
    if (revision !== lyricsRevision) return;
    lyricsCues = data.cues;
    $('#lyricsNotice').textContent = data.notice || 'Lyrics draft · timing and words may contain errors.';
    if (!lyricsCues.length) $('#lyricsNotice').textContent = 'No reliable lyric transcript is available for this recording yet.';
    $('#lyricsLines').replaceChildren(...lyricsCues.map(cue => {
      const line = document.createElement('p');
      line.textContent = cue.text;
      return line;
    }));
  } catch (error) {
    if (revision !== lyricsRevision) return;
    $('#lyricsNotice').textContent = error.message;
    $('#retryLyrics').classList.remove('hidden');
  }
}
function updateLyricsPosition() {
  const seconds = (state.playing || state.paused) && window.getAudioContext ? Math.max(0,window.getAudioContext().currentTime-playbackStartedAt) : -1;
  renderProgress(seconds);
  if (state.playing && playbackDuration > 0 && seconds >= playbackDuration + 1) {
    playbackDuration = 0;
    if (previewing) endEditorPreview(); else advancePlayback(true);
    return;
  }
  const index = lyricsCues.findIndex(cue => seconds >= cue.start && seconds < cue.end);
  if (index === highlightedLyric) return;
  highlightedLyric = index;
  [...$('#lyricsLines').children].forEach((line,i) => {
    line.classList.toggle('current-lyric', i === index);
    if (i === index) line.setAttribute('aria-current','true'); else line.removeAttribute('aria-current');
  });
  const line = $('#lyricsLines').children[index];
  if (line && $('#appShell').classList.contains('lyrics-open')) {
    const scroller=$('#lyricsLines');
    scroller.scrollTo({top:Math.max(0,line.offsetTop-scroller.clientHeight*.32),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  }
}
setInterval(updateLyricsPosition,200);
function searchResults(query = '', group = '') {
  const normalized = query.trim().toLowerCase();
  return allTracks().filter(track => {
    const matchesText = !normalized || [track.title, track.artist, track.mood, track.group].some(value => String(value || '').toLowerCase().includes(normalized));
    const matchesGroup = !group || track.group === group;
    return matchesText && matchesGroup;
  });
}
function renderSearch() {
  const query = $('#searchPageInput').value;
  let result = searchResults(query, state.groupFilter);
  if(state.catalogFilter==='covers')result=result.filter(t=>t.cover);
  if(state.catalogFilter==='originals')result=result.filter(t=>!t.cover&&!t.created);
  if(state.catalogFilter==='created')result=result.filter(t=>t.created);
  if(state.catalogSort==='title')result.sort((a,b)=>a.title.localeCompare(b.title));
  if(state.catalogSort==='tempo')result.sort((a,b)=>(a.bpm||parseFloat(a.loop)||Infinity)-(b.bpm||parseFloat(b.loop)||Infinity));
  if(state.catalogSort==='duration')result.sort((a,b)=>(a.durationSeconds||Infinity)-(b.durationSeconds||Infinity));
  $('#searchTrackList').innerHTML = result.map(cardMarkup).join('');
  $('#emptySearch').classList.toggle('hidden', result.length > 0);
  $('#resultCount').textContent = `${result.length} ${result.length === 1 ? 'pattern' : 'patterns'}`;
  $('#resultTitle').textContent = state.groupFilter || (query ? `Results for “${query}”` : 'All tracks');
  window.MusicSite?.decorateSearch?.();
}
function renderLibrary() {
  let result = allTracks();
  if (state.libraryFilter === 'liked') result = result.filter(track => state.liked.includes(track.id));
  if (state.libraryFilter === 'created') result = result.filter(track => track.created);
  $('#libraryTrackList').innerHTML = result.map(cardMarkup).join('');
  $('#libraryPlaylists').innerHTML = playlists.map(p=>`<button class="saved-playlist" data-open-playlist="${escapeHtml(p.id)}"><span class="playlist-placeholder">${icon('book')}</span><strong>${escapeHtml(p.name)}</strong><small>${p.entries.length} tracks · Saved on this device</small></button>`).join('');
  $('#emptyLibrary').classList.toggle('hidden', result.length > 0);
  renderDraftBanner();
  window.MusicSite?.refreshLibrary?.();
}
function renderAllLists() {
  renderHome();
  if (!$('#searchView').classList.contains('hidden')) renderSearch();
  if (!$('#libraryView').classList.contains('hidden')) renderLibrary();
  window.MusicSite?.refresh?.();
  syncPlayButtons();
}
function setView(name, push = true) {
  const views = ['home', 'search', 'library', 'track', 'playlist', 'site'];
  if (!views.includes(name)) name = 'home';
  if(name!=='site')document.title=`${({home:'Home',search:'Search',library:'Your library',track:'Track',playlist:'Playlist'})[name]} · Hustlenix Music`;
  for (const view of views) $(`#${view}View`).classList.toggle('hidden', view !== name);
  $$('.nav-link').forEach(button => button.classList.toggle('active', button.dataset.view === (['track','playlist'].includes(name) ? 'library' : name)));
  $$('.site-nav-link[data-view]').forEach(button=>{
    const active=button.dataset.view===name;button.classList.toggle('selected',active);
    if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  if (push && location.hash !== `#${name}`) history.pushState({ view: name }, '', `#${name}`);
  $('#homeFilters').classList.toggle('hidden', name !== 'home');
  hideSuggestions();
  if (name === 'search') { renderSearch(); $('#searchInput').focus({preventScroll:true}); }
  if (name === 'library') renderLibrary();
  window.MusicSite?.syncNavigation?.(name);
  $('#mainArea').scrollTo({ top: 0, behavior: 'smooth' });
}
async function openTrack(id, push = true) {
  const track = getTrack(id);
  if (!track) {
    setView('home', false);
    showToast('This track is not in the current release. Explore the available original patterns.');
    return;
  }
  const revision = ++detailRevision;
  setView('track', false);
  document.title=`${track.title} · ${track.artist} | Hustlenix Music`;
  const href=`#track/${encodeURIComponent(id)}`;
  if (push && location.hash !== href) history.pushState({view:'track',trackId:id},'',href);
  else history.replaceState({view:'track',trackId:id},'',href);
  $('#trackDetail').innerHTML = `<div class="detail-hero">${artMarkup(track,'detail-art')}<div class="detail-copy"><div class="eyebrow">Live-coded pattern</div><h1>${escapeHtml(track.title)}</h1><p><strong>${escapeHtml(track.artist)}</strong> · ${escapeHtml(track.mood || 'Your pattern')} · ${escapeHtml(track.loop || 'Infinite loop')}</p></div></div>
  <div class="detail-actions"><button class="detail-play" data-action="play" data-track-id="${escapeHtml(track.id)}" aria-label="Play ${escapeHtml(track.title)}">${icon('play')}</button><button class="icon-button${state.liked.includes(track.id) ? ' liked' : ''}" data-action="like" data-track-id="${escapeHtml(track.id)}" aria-label="Like ${escapeHtml(track.title)}">${icon('heart')}</button><button class="button button-quiet" data-show-code>View code</button><div style="position:relative"><button class="icon-button" data-track-menu aria-label="More options" aria-expanded="false">${icon('more')}</button><div class="detail-menu hidden" role="menu"><button role="menuitem" data-add-queue="${escapeHtml(track.id)}">Add to queue</button><button role="menuitem" data-add-playlist-track="${escapeHtml(track.id)}">Add to playlist</button><button role="menuitem" data-action="copy" data-track-id="${escapeHtml(track.id)}">Copy Strudel code</button></div></div></div>
  <details class="code-details" id="patternCode"><summary>Inside the pattern</summary><div class="code-panel"><div class="code-panel-heading"><span>${escapeHtml(track.id)}.strudel</span><span>LIVE PATTERN</span></div><pre id="detailCode">Loading pattern…</pre></div></details>
  <section class="section-block"><div class="section-heading"><h2>More to discover</h2></div><div class="shelf-grid">${allTracks().filter(t=>t.id!==track.id).map(cardMarkup).join('')}</div></section>`;
  {
    const note = document.createElement('p');
    note.className = 'empty-state';
    note.textContent = track.cover
      ? 'Instrumental study · human recognition review pending. Not an approved faithful cover.'
      : 'Original instrumental · generated live from its Strudel code. Explore the sound or make it your own.';
    $('.detail-hero').after(note);
  }
  const reportLink = document.createElement('a');
  reportLink.className = 'button button-quiet';
  reportLink.textContent = 'Report a problem';
  reportLink.dataset.feedback = track.id;
  reportLink.href = feedbackUrl(track);
  reportLink.target = '_blank';
  reportLink.rel = 'noreferrer';
  reportLink.title = 'Opens a public GitHub report; sign-in required to submit';
  $('.detail-actions').append(reportLink);
  const studioButton=document.createElement('button');
  studioButton.className='button button-quiet';studioButton.dataset.action='studio';studioButton.dataset.trackId=track.id;
  studioButton.textContent=track.created?'Edit in Studio':'Remix in Studio';
  $('.detail-actions').append(studioButton);
  window.MusicSite?.decorateTrack?.(track);
  try { const code=await getCode(track); if (revision===detailRevision) $('#detailCode').textContent=code; }
  catch (error) { if (revision===detailRevision) $('#detailCode').textContent=error.message; }
}
function likeTrack(track) {
  if (!track) return;
  const liked = state.liked.includes(track.id) ? state.liked.filter(id => id !== track.id) : [...state.liked, track.id];
  if (!saveStorage('strudelify-liked', liked)) return;
  state.liked = liked;
  renderPlayer(); renderAllLists();
  showToast(state.liked.includes(track.id) ? 'Added to liked tracks' : 'Removed from liked tracks');
}
async function copyTrackCode(track) {
  try {
    const code = await getCode(track);
    await navigator.clipboard.writeText(code);
    showToast('Strudel code copied');
  } catch {
    showToast('Could not copy code here. Try the app over localhost or HTTPS.');
  }
}
function playRandom(group = '') {
  const candidates = searchResults('', group);
  if (!candidates.length) { showToast('There are no tracks in this collection yet.'); return; }
  const other = candidates.filter(track => track.id !== state.current?.id);
  const choice = (other.length ? other : candidates)[Math.floor(Math.random() * (other.length || candidates.length))];
  startCollection(candidates.map(t=>MusicLibrary.entry(t.id)), choice.id, group || 'All patterns');
}
function studioDrafts() { return readStorage('strudelify-studio-drafts-v1',[]); }
function availableDrafts() {
  const drafts=new Map(studioDrafts().map(d=>[d.id,d]));
  for(const [id,draft] of volatileDrafts)drafts.set(id,draft);
  return [...drafts.values()].sort((a,b)=>String(a.modifiedAt).localeCompare(String(b.modifiedAt)));
}
function studioFields() { return {title:$('#editorTitle').value,artist:$('#editorArtist').value,code:$('#editorCode').value}; }
function renderDraftBanner() {
  const drafts=availableDrafts();
  $('#draftBanner').classList.toggle('hidden',!drafts.length);
  $('#draftBannerTitle').textContent=drafts.length?`${drafts.length} ${drafts.length===1?'draft':'drafts'} on this device · ${drafts.at(-1).title||'Untitled pattern'}`:'';
  $('#studioDraftList').innerHTML=[...drafts].reverse().map(d=>`<button type="button" class="studio-version" data-open-draft="${escapeHtml(d.id)}" aria-current="${d.id===editorSession?.draftId}"><strong>${escapeHtml(d.title||'Untitled pattern')}</strong><span>${volatileDrafts.has(d.id)?'Not saved · keep this tab open':'Resume draft'}</span></button>`).join('')||'<p class="empty-history">No unfinished drafts.</p>';
}
function updateCodeMeta() {
  const code=$('#editorCode').value;
  $('#editorLineCount').textContent=`${code.split('\n').length} lines · ${code.length.toLocaleString()} characters`;
}
function persistStudioDraft() {
  clearTimeout(draftTimer);
  if(!editorSession || editorSession.loading)return;
  const fields=studioFields(), base=editorSession.base;
  const changed=!base || ['title','artist','code'].some(key=>fields[key]!==base[key]);
  const drafts=studioDrafts().filter(d=>d.id!==editorSession.draftId);
  const draft={id:editorSession.draftId,targetId:editorSession.targetId,sourceId:editorSession.sourceId,
    ...fields,modifiedAt:new Date().toISOString()};
  if(changed)drafts.push(draft);
  try {
    if(drafts.length>100)throw new Error('Draft limit reached. Save or export your drafts.');
    WorkspaceStorage.write('strudelify-studio-drafts-v1',drafts);
    volatileDrafts.delete(draft.id);
    $('#studioDraftStatus').textContent=changed?'Draft saved on this device':'All changes saved';
    $('#studioDraftStatus').classList.remove('save-failed');
  } catch {
    if(changed)volatileDrafts.set(draft.id,draft);
    $('#studioDraftStatus').textContent='Could not save this draft. Download the pattern before leaving.';
    $('#studioDraftStatus').classList.add('save-failed');
  }
  renderDraftBanner();
}
function renderStudioVersions() {
  const versions=editorSession?.targetId?WorkspaceStorage.read('strudelify-track-versions-v1',{})[editorSession.targetId]||[]:[];
  $('#studioVersionList').innerHTML=[...versions].reverse().map((v,i)=>{
    const date=new Date(v.createdAt);
    return `<button type="button" class="studio-version" data-load-version="${escapeHtml(v.id)}"><strong>${i===0?'Latest save':escapeHtml(v.title)}</strong><small>${Number.isNaN(date.getTime())?'Previous saved pattern':escapeHtml(date.toLocaleString())}</small><span>Open as draft</span></button>`;
  }).join('') || '<p class="empty-history">Save this pattern to start its version history.</p>';
}
async function openEditor(track = null, resumedDraft = null) {
  if($('#editorDialog').open)persistStudioDraft();
  if(state.current?.preview)await endEditorPreview();
  const revision=++editorRevision;
  const target=track?.created?track:null;
  const draftId=resumedDraft?.id || (target?'edit-'+target.id:track?'remix-'+track.id:'new');
  const draft=resumedDraft || volatileDrafts.get(draftId) || studioDrafts().find(d=>d.id===draftId);
  const sourceId=draft?.sourceId || (track&&!target?track.id:target?.forkedFrom)||null;
  const targetId=draft?.targetId || target?.id || null;
  const saved=state.custom.find(t=>t.id===targetId);
  editorSession={draftId,targetId:saved?.id||null,sourceId,base:saved?{title:saved.title,artist:saved.artist,code:saved.code}:null,loading:true};
  $('#studioHeading').textContent=saved?'Edit your pattern':sourceId?'Remix in Studio':'Create a pattern';
  $('#studioSource').textContent=sourceId?`Based on ${getTrack(sourceId)?.title||sourceId} · Your copy stays local`:'Compose, preview and save your own Strudel pattern.';
  $('#editorTitle').value=draft?.title ?? saved?.title ?? (track?`${track.title} (remix)`:'');
  $('#editorArtist').value=draft?.artist ?? saved?.artist ?? (track?'You':'');
  $('#editorCode').value=draft?.code ?? saved?.code ?? track?.code ?? (track?'Loading source…':'setcps(0.5)\n\n$: note("c3 e3 g3 b3").s("triangle").slow(2).gain(.24).room(.4)');
  $('#editorError').classList.add('hidden');
  if(!$('#editorDialog').open)$('#editorDialog').showModal();
  $('#editorPreviewButton').disabled=!!(track&&!draft&&!track.code);
  $('#saveTrackButton').disabled=$('#editorPreviewButton').disabled;
  $('#editorCode').disabled=$('#editorPreviewButton').disabled;
  $('#saveTrackButton').textContent=saved?'Save changes':'Save track';
  renderStudioVersions();updateCodeMeta();
  try {
    if(track&&!draft&&!track.code){
      const code=await getCode(track);
      if(revision!==editorRevision||!$('#editorDialog').open)return;
      $('#editorCode').value=code;
    }
    if(revision!==editorRevision)return;
    editorSession.loading=false;
    $('#editorPreviewButton').disabled=false;$('#saveTrackButton').disabled=false;$('#editorCode').disabled=false;
    updateCodeMeta();persistStudioDraft();$('#editorTitle').focus();
  } catch(error) {
    if(revision!==editorRevision)return;
    $('#editorError').textContent=error.message;$('#editorError').classList.remove('hidden');
  }
}
function downloadText(name,text,type='text/plain') {
  const url=URL.createObjectURL(new Blob([text],{type})), link=document.createElement('a');
  link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function openLibraryBackup() {
  const drafts=studioDrafts();
  const count=(n,label)=>`${n} ${label}${n===1?'':'s'}`;
  $('#libraryBackupSummary').textContent=[count(state.custom.length,'pattern'),count(playlists.length,'playlist'),count(state.liked.length,'like'),count(drafts.length,'draft')].join(' · ');
  $('#libraryImportFile').value='';pendingImport=null;++importRevision;
  $('#importPreview').classList.add('hidden');$('#confirmImportButton').disabled=true;$('#backupStatus').textContent='';
  $('#libraryBackupDialog').showModal();
}

for(const id of ['editorTitle','editorArtist','editorCode'])$('#'+id).addEventListener('input',()=>{
  updateCodeMeta();$('#studioDraftStatus').textContent='Saving draft…';clearTimeout(draftTimer);draftTimer=setTimeout(persistStudioDraft,350);
});
$('#editorCode').addEventListener('keydown',event=>{
  if(event.key==='Tab'&&!event.shiftKey){event.preventDefault();const el=event.target;el.setRangeText('  ',el.selectionStart,el.selectionEnd,'end');el.dispatchEvent(new Event('input'));}
});
$('#editorDialog').addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();$('#editorPreviewButton').click();}
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();if(!$('#saveTrackButton').disabled)$('#editorForm').requestSubmit();}
});
$('#editorStopButton').addEventListener('click',()=>{if(state.current?.preview)endEditorPreview();});
$('#downloadPatternButton').addEventListener('click',()=>{
  const name=$('#editorTitle').value.trim().replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,80)||'untitled-pattern';
  downloadText(name+'.strudel',$('#editorCode').value);
});
$('#studioVersionList').addEventListener('click',event=>{
  const button=event.target.closest('[data-load-version]');if(!button||!editorSession?.targetId)return;
  const versions=WorkspaceStorage.read('strudelify-track-versions-v1',{})[editorSession.targetId]||[];
  const version=versions.find(v=>v.id===button.dataset.loadVersion);if(!version)return;
  if(state.current?.preview)endEditorPreview();
  for(const [key,id] of [['title','editorTitle'],['artist','editorArtist'],['code','editorCode']])$('#'+id).value=version[key];
  updateCodeMeta();persistStudioDraft();showToast('Version opened as a draft. Save to keep it.');
});
$('#resumeStudioDraftButton').addEventListener('click',()=>{
  const draft=availableDrafts().at(-1);
  if(draft)openEditor(null,draft);
});
$('#studioDraftList').addEventListener('click',event=>{
  const button=event.target.closest('[data-open-draft]');if(!button)return;
  if(button.dataset.openDraft===editorSession?.draftId){$('#editorCode').focus();return;}
  const draft=availableDrafts().find(d=>d.id===button.dataset.openDraft);
  if(draft)openEditor(null,draft);
});
$('#libraryBackupButton').addEventListener('click',openLibraryBackup);
$('#exportLibraryButton').addEventListener('click',()=>{
  try { downloadText('strudelify-library-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(WorkspaceStorage.backup(),null,2),'application/json');$('#backupStatus').textContent='Backup downloaded. Keep it somewhere safe.'; }
  catch(error){$('#backupStatus').textContent=error.message||'The backup could not be created.';}
});
$('#libraryImportFile').addEventListener('change',async event=>{
  const revision=++importRevision;pendingImport=null;$('#confirmImportButton').disabled=true;$('#importPreview').classList.add('hidden');
  const file=event.target.files[0];if(!file)return;
  try {
    if(file.size>5*1024*1024)throw new Error('Choose a backup smaller than 5 MB.');
    const data=JSON.parse(await file.text());
    if(revision!==importRevision||!$('#libraryBackupDialog').open)return;
    const {stats}=WorkspaceStorage.planImport(data,tracks.map(t=>t.id));
    pendingImport=data;
    $('#importSummary').textContent=`Add ${stats.tracks} patterns, ${stats.playlists} playlists, ${stats.likes} likes, ${stats.drafts} drafts, ${stats.versions} saved versions, ${stats.artists} followed artists and ${stats.collections} saved collections. ${stats.conflicts} conflicts kept as separate copies. ${stats.versionsSkipped?`${stats.versionsSkipped} older imported versions exceed the 20-version limit and will be skipped. `:''}Current playback and preferences stay as they are.`;
    $('#importPreview').classList.remove('hidden');$('#confirmImportButton').disabled=false;$('#backupStatus').textContent='Nothing has changed yet.';
  } catch(error){if(revision===importRevision)$('#backupStatus').textContent=error.message||'This backup could not be read.';}
});
$('#confirmImportButton').addEventListener('click',()=>{
  if(!pendingImport)return;
  try {
    WorkspaceStorage.importBackup(pendingImport,tracks.map(t=>t.id));
    state.custom=readStorage('strudelify-custom',[]);state.liked=readStorage('strudelify-liked',[]);playlists=MusicLibrary.playlists();
    renderPlaylistNav();renderAllLists();renderPlayer();
    pendingImport=null;$('#confirmImportButton').disabled=true;$('#backupStatus').textContent='Library merged. Imported patterns are ready to open in Studio.';
    showToast('Library merged without replacing your saved patterns');
  } catch(error){$('#backupStatus').textContent=error.message||'Storage is full. Your library was not changed.';}
});
window.addEventListener('beforeunload',event=>{
  if($('#editorDialog').open)persistStudioDraft();
  if(volatileDrafts.size){event.preventDefault();event.returnValue='';}
});

function syncPlayButtons() {
  $$('[data-action="play"]').forEach(button => {
    const id = button.dataset.trackId || button.closest('[data-track-id]')?.dataset.trackId;
    const track = getTrack(id), active = id===state.current?.id;
    button.innerHTML = icon(active && state.loading ? 'stop' : active && state.playing ? 'pause' : 'play');
    button.setAttribute('aria-label', `${active && state.loading ? 'Cancel loading' : active && state.playing ? 'Pause' : active && state.paused ? 'Resume' : 'Play'} ${track?.title || 'track'}`);
    button.closest('.track-row, .track-card')?.classList.toggle('playing', active && state.playing);
  });
}
function visibleCollection(button) {
  const container = button.closest('.track-table, .track-card-grid, .shelf-grid');
  const ids = container ? [...new Set($$('[data-track-id]',container).map(el=>el.dataset.trackId))] : allTracks().map(t=>t.id);
  return ids.filter(id=>getTrack(id)).map(MusicLibrary.entry);
}
function startCollection(entries, trackId, label, entryId=null) {
  const selected = transport.start(entries, entryId || entries.find(e=>e.trackId===trackId)?.id, label);
  if (selected) playTrack(getTrack(selected.trackId));
}
function selectTrack(track, button) {
  if (!track) return;
  if (state.current?.id===track.id && (state.playing || state.paused || state.loading)) return togglePlayback();
  const entries = visibleCollection(button);
  startCollection(entries, track.id, !$('#searchView').classList.contains('hidden') ? state.groupFilter || 'Search results' : !$('#libraryView').classList.contains('hidden') ? 'Your library' : 'All patterns');
}
async function advancePlayback(automatic=false) {
  const next = transport.next(automatic);
  if (next && getTrack(next.trackId)) return playTrack(getTrack(next.trackId));
  await stopTrack();
  if (!automatic) showToast('End of the queue. Choose another track or enable repeat.');
}
function persistPlaylists(next) {
  if (!saveStorage('strudelify-playlists-v1', next)) return false;
  playlists = next; renderPlaylistNav();
  if (!$('#libraryView').classList.contains('hidden')) renderLibrary();
  window.MusicSite?.refresh?.();
  return true;
}
function openPlaylist(id, push=true) {
  const playlist = playlists.find(p=>p.id===id);
  if (!playlist) { setView('library',push); showToast('This playlist is no longer available.'); return; }
  selectedPlaylist = id;
  setView('playlist',false);
  document.title=`${playlist.name} · Your playlist | Hustlenix Music`;
  const href = `#playlist/${encodeURIComponent(id)}`;
  if (push && location.hash!==href) history.pushState({view:'playlist',playlistId:id},'',href);
  renderPlaylist();
}
function renderPlaylist() {
  const p = playlists.find(p=>p.id===selectedPlaylist); if (!p) return;
  $('#playlistDetail').innerHTML = `<div class="detail-hero playlist-hero"><div class="detail-art playlist-placeholder">${icon('book')}</div><div class="detail-copy"><div class="eyebrow">Your playlist · On this device</div><h1>${escapeHtml(p.name)}</h1><p>${escapeHtml(p.description)}</p><p>${p.entries.length} ${p.entries.length===1?'track':'tracks'}</p></div></div><div class="detail-actions"><button class="detail-play" data-play-playlist aria-label="Play ${escapeHtml(p.name)}" ${p.entries.some(e=>getTrack(e.trackId))?'':'disabled'}>${icon('play')}</button><button class="button button-quiet" data-edit-playlist>Edit details</button><button class="button button-quiet" data-view="search">Add tracks</button><button class="icon-button" data-delete-playlist aria-label="Delete playlist">${icon('close')}</button></div><div class="playlist-tracks">${p.entries.map((e,i)=>{
    const track=getTrack(e.trackId);
    return `<div class="playlist-entry" data-entry-id="${escapeHtml(e.id)}"><span class="entry-number">${i+1}</span><button class="playlist-entry-play" data-play-entry="${escapeHtml(e.id)}" ${track?'':'disabled'} aria-label="Play ${escapeHtml(track?.title || 'unavailable track')}">${track?artMarkup(track):''}<span><strong>${escapeHtml(track?.title || 'Unavailable track')}</strong><small>${escapeHtml(track?.artist || 'Not in this release')}</small></span></button><div class="entry-actions"><button class="icon-button" data-move-entry="${escapeHtml(e.id)}" data-direction="-1" ${i===0?'disabled':''} aria-label="Move track ${i+1} up">↑</button><button class="icon-button" data-move-entry="${escapeHtml(e.id)}" data-direction="1" ${i===p.entries.length-1?'disabled':''} aria-label="Move track ${i+1} down">↓</button>${track?`<button class="icon-button" data-action="options" data-track-id="${escapeHtml(track.id)}" aria-label="Track options">${icon('more')}</button>`:''}<button class="icon-button" data-remove-entry="${escapeHtml(e.id)}" aria-label="Remove track ${i+1} from playlist">${icon('close')}</button></div></div>`;
  }).join('') || '<div class="playlist-empty"><h2>Let’s find something for your playlist</h2><p>Browse tracks and choose “Add to playlist” in a track’s options.</p><button class="button button-primary" data-view="search">Browse tracks</button></div>'}</div>`;
}
function openPlaylistDialog(mode, track=null) {
  playlistDialogMode=mode; playlistDialogTrack=track;
  const p=playlists.find(p=>p.id===selectedPlaylist);
  $('#playlistDialogTitle').textContent=mode==='edit'?'Edit details':mode==='add'?'Add to playlist':'Create playlist';
  $('#playlistName').value=mode==='edit'?p?.name || '':'';
  $('#playlistDescription').value=mode==='edit'?p?.description || '':'';
  $('#playlistExisting').classList.toggle('hidden',mode!=='add');
  $('#playlistExisting').innerHTML=playlists.map(item=>`<button type="button" class="playlist-choice" data-add-to-playlist="${escapeHtml(item.id)}">${icon('book')}<span>${escapeHtml(item.name)}<small>${item.entries.length} tracks</small></span>${icon('plus')}</button>`).join('') || '<p>No playlists yet. Create your first below.</p>';
  $('#playlistSaveButton').textContent=mode==='edit'?'Save':'Create playlist'+(mode==='add'?' and add track':'');
  $('#playlistName').placeholder='My playlist';
  $('#playlistDialog').showModal();
  if (mode!=='add') $('#playlistName').focus();
}
function addToPlaylist(id,track) {
  if (!track) return;
  const next=playlists.map(p=>p.id===id?{...p,entries:[...p.entries,MusicLibrary.entry(track.id)]}:p);
  if (persistPlaylists(next)) { $('#playlistDialog').close(); showToast('Added to playlist'); if (!$('#playlistView').classList.contains('hidden')) renderPlaylist(); }
}
let optionsTrigger;
function openTrackOptions(track, trigger) {
  optionsTrigger=trigger;
  $('#trackOptionsTitle').textContent=track.title;
  $('#trackOptionsBody').innerHTML=`<button class="playlist-choice" data-add-queue="${escapeHtml(track.id)}">${icon('queue')} Add to queue</button><button class="playlist-choice" data-add-playlist-track="${escapeHtml(track.id)}">${icon('plus')} Add to playlist</button><button class="playlist-choice" data-option-studio="${escapeHtml(track.id)}">${icon('code')} ${track.created?'Edit':'Remix'} in Studio</button><button class="playlist-choice" data-option-code="${escapeHtml(track.id)}">${icon('code')} View code</button>`;
  $('#trackOptionsDialog').showModal();
}

$('#playlistForm').addEventListener('submit',event=>{
  event.preventDefault();
  const name=$('#playlistName').value.trim(); if (!name) return;
  const description=$('#playlistDescription').value.trim();
  const id=playlistDialogMode==='edit'?selectedPlaylist:MusicLibrary.uid();
  const next=playlistDialogMode==='edit'?playlists.map(p=>p.id===id?{...p,name,description}:p):[{id,name,description,entries:playlistDialogTrack?[MusicLibrary.entry(playlistDialogTrack.id)]:[]},...playlists];
  if (persistPlaylists(next)) { $('#playlistDialog').close(); openPlaylist(id); showToast(playlistDialogMode==='edit'?'Playlist updated':'Playlist created'); }
});
$('#trackOptionsDialog').addEventListener('close',()=>{if(optionsTrigger?.isConnected)optionsTrigger.focus();});
document.addEventListener('click',event=>{
  const button=event.target.closest('button'); if(!button)return;
  const d=button.dataset;
  if ('closeDialog' in d) button.closest('dialog').close();
  if (d.openPlaylist) openPlaylist(d.openPlaylist);
  if ('createPlaylist' in d) openPlaylistDialog('create');
  if ('editPlaylist' in d) openPlaylistDialog('edit');
  if (d.addToPlaylist) addToPlaylist(d.addToPlaylist,playlistDialogTrack);
  if (d.addQueue) {
    transport.manual.push(MusicLibrary.entry(d.addQueue)); renderQueue();
    $('#trackOptionsDialog').close(); showToast('Added to queue');
  }
  if (d.addPlaylistTrack) { $('#trackOptionsDialog').close(); openPlaylistDialog('add',getTrack(d.addPlaylistTrack)); }
  if (d.optionCode) { $('#trackOptionsDialog').close(); openTrack(d.optionCode).then(()=>$('#patternCode').open=true); }
  if (d.optionStudio) { $('#trackOptionsDialog').close(); openEditor(getTrack(d.optionStudio)); }
  const p=playlists.find(p=>p.id===selectedPlaylist);
  if (p && ('playPlaylist' in d || d.playEntry)) {
    const entries=p.entries.filter(e=>getTrack(e.trackId));
    startCollection(entries,null,p.name,d.playEntry || entries[0]?.id);
  }
  if (p && d.removeEntry) {
    if(persistPlaylists(playlists.map(item=>item.id===p.id?{...item,entries:item.entries.filter(e=>e.id!==d.removeEntry)}:item))) renderPlaylist();
  }
  if (p && d.moveEntry) {
    const entries=[...p.entries], index=entries.findIndex(e=>e.id===d.moveEntry), next=index+Number(d.direction);
    if(index>=0 && next>=0 && next<entries.length){[entries[index],entries[next]]=[entries[next],entries[index]];
      if(persistPlaylists(playlists.map(item=>item.id===p.id?{...item,entries}:item))){ renderPlaylist(); $(`[data-move-entry="${d.moveEntry}"][data-direction="${d.direction}"]`)?.focus(); }
    }
  }
  if(p && 'deletePlaylist' in d) { $('#deletePlaylistName').textContent=p.name; $('#deletePlaylistDialog').showModal(); }
  if(p && 'confirmDeletePlaylist' in d && persistPlaylists(playlists.filter(item=>item.id!==p.id))) { $('#deletePlaylistDialog').close(); setView('library'); showToast('Playlist deleted'); }
  if(d.queueRemove){transport.manual=transport.manual.filter(e=>e.id!==d.queueRemove);renderQueue();}
  if(d.queueMove){
    const i=transport.manual.findIndex(e=>e.id===d.queueMove),j=i+Number(d.direction);
    if(i>=0&&j>=0&&j<transport.manual.length){[transport.manual[i],transport.manual[j]]=[transport.manual[j],transport.manual[i]];renderQueue();$(`[data-queue-move="${d.queueMove}"][data-direction="${d.direction}"]`)?.focus();}
  }
  if(button.id==='clearQueueButton')$('#clearQueueDialog').showModal();
  if('confirmClearQueue' in d){transport.manual=[];renderQueue();$('#clearQueueDialog').close();showToast('Queued tracks cleared');}
  if(d.queuePlay){
    let entry;
    if(d.queueSource==='manual'){const i=transport.manual.findIndex(e=>e.id===d.queuePlay);if(i>=0)entry=transport.manual.splice(i,1)[0];}
    else {const i=transport.order.findIndex(e=>e.id===d.queuePlay);if(i>=0){transport.cursor=i;entry=transport.order[i];}}
    if(entry){transport.select(entry);playTrack(getTrack(entry.trackId));}
  }
});

function handleAction(event) {
  const actionTarget = event.target.closest('[data-action]');
  if (!actionTarget) return;
  const id = actionTarget.dataset.trackId || actionTarget.closest('[data-track-id]')?.dataset.trackId;
  const track = getTrack(id);
  if (actionTarget.dataset.action === 'play') { event.stopPropagation(); selectTrack(track, actionTarget); }
  else if (actionTarget.dataset.action === 'options' && track) openTrackOptions(track, actionTarget);
  else if (actionTarget.dataset.action === 'like') {
    event.stopPropagation(); likeTrack(track);
    if (track) {
      const liked = state.liked.includes(track.id);
      actionTarget.classList.toggle('liked', liked);
      actionTarget.setAttribute('aria-label', `${liked ? 'Unlike' : 'Like'} ${track.title}`);
    }
  }
  else if (actionTarget.dataset.action === 'open' && track) openTrack(track.id);
  else if (actionTarget.dataset.action === 'copy' && track) copyTrackCode(track);
  else if (actionTarget.dataset.action === 'studio' && track) openEditor(track);
}

document.addEventListener('click', event => {
  if(event.target.closest('[data-site-route]'))return;
  if(event.target.closest('[data-open-studio]')){openEditor();return;}
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) { setView(viewButton.dataset.view); return; }
  const likedNavigation = event.target.closest('[data-liked-nav="true"]');
  if (likedNavigation) {
    if(window.MusicSite){window.MusicSite.route('#liked',true);return;}
    state.libraryFilter = 'liked'; $$('[data-library-filter]').forEach(item => { const active = item.dataset.libraryFilter === 'liked'; item.classList.toggle('selected', active); item.setAttribute('aria-selected', String(active)); }); setView('library'); return;
  }
  const groupButton = event.target.closest('[data-group]');
  if (groupButton) {
    if(groupButton.dataset.group&&window.MusicSite){window.MusicSite.route('#collection/'+encodeURIComponent(groupButton.dataset.group),true);return;}
    state.groupFilter = groupButton.dataset.group || '';
    $('#searchInput').value = '';
    $('#searchPageInput').value = '';
    setView('search');
    return;
  }
  handleAction(event);
});
document.addEventListener('keydown', event => {
  if (['Enter', ' '].includes(event.key) && event.target.matches('[data-action="open"]')) {
    event.preventDefault();
    const id = event.target.closest('[data-track-id]')?.dataset.trackId;
    if (id) openTrack(id);
    return;
  }
  if (event.key === '/' && !/input|textarea/i.test(document.activeElement.tagName) && !$('dialog[open]')) {
    event.preventDefault(); setView('search'); $('#searchInput').focus();
  }
  if (event.code === 'Space' && !/input|textarea|button/i.test(document.activeElement.tagName) && !$('dialog[open]')) {
    event.preventDefault(); togglePlayback();
  }
});

$('#searchInput').addEventListener('input', event => {
  $('#searchPageInput').value = event.target.value;
  state.groupFilter = '';
  setView('search');
  renderSearch();
  showSuggestions();
});
$('#searchPageInput').addEventListener('input', () => { $('#searchInput').value = $('#searchPageInput').value; state.groupFilter = ''; renderSearch(); });
$('#newTrackButton').addEventListener('click', () => openPlaylistDialog('create'));
$('#libraryCreateButton').addEventListener('click', () => openPlaylistDialog('create'));
$('#libraryTrackCreateButton').addEventListener('click', () => openEditor());
$('#heroPlayButton').addEventListener('click', () => playRandom());
$('#starterPlayButton').addEventListener('click', () => playRandom());
$('#mainPlayButton').addEventListener('click', togglePlayback);
$('#stopButton').addEventListener('click', stopTrack);
$('#previousButton').addEventListener('click', () => {
  const elapsed=(state.playing || state.paused) ? (window.getAudioContext?.().currentTime || 0)-playbackStartedAt : 0;
  if(elapsed>3 && state.current && !previewing) return playTrack(state.current);
  const previous=transport.previous();
  if(previous) playTrack(getTrack(previous.trackId));
  else if(state.current && !previewing) playTrack(state.current);
});
$('#nextButton').addEventListener('click', () => advancePlayback());
$('#shuffleButton').addEventListener('click', () => {
  const enabled=!transport.shuffle;
  if(!saveStorage('strudelify-shuffle',enabled))return;
  transport.setShuffle(enabled);renderPlayer();showToast(`Shuffle ${enabled?'on':'off'}`);
});
$('#repeatButton').addEventListener('click',()=>{
  const modes=['off','context','one'],next=modes[(modes.indexOf(transport.repeat)+1)%3];
  if(!saveStorage('strudelify-repeat',next))return;
  transport.repeat=next;renderPlayer();showToast(`Repeat ${next==='context'?'collection':next}`);
});
$('#queueShuffleButton').addEventListener('click',()=>$('#shuffleButton').click());
$('#queueRepeatButton').addEventListener('click',()=>$('#repeatButton').click());
$('#likeButton').addEventListener('click', () => likeTrack(state.current));
$('#codeButton').addEventListener('click', async () => { if(state.current) { await openTrack(state.current.id); $('#patternCode').open=true; } });
$('#trackBackButton').addEventListener('click', () => setView('search'));
$('#backButton').addEventListener('click', () => history.back());
$('#forwardButton').addEventListener('click', () => history.forward());
$('#profileButton').addEventListener('click', () => window.MusicSite ? window.MusicSite.route('#profile',true) : openLibraryBackup());
$('#volumeButton').addEventListener('click', () => showToast('Adjust the volume with your device controls.'));
$('#copyShareButton').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('#shareUrlInput').value);$('#shareCopyStatus').textContent='Link copied.';}
  catch{$('#shareUrlInput').focus();$('#shareUrlInput').select();$('#shareCopyStatus').textContent='Select the link and use your device’s Copy action.';}
});
$$('[data-library-filter]').forEach(button => button.addEventListener('click', () => {
  state.libraryFilter = button.dataset.libraryFilter;
  $$('[data-library-filter]').forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-selected', String(item === button)); });
  renderLibrary();
}));

$('#editorPreviewButton').addEventListener('click', async () => {
  const button = $('#editorPreviewButton');
  button.disabled = true; $('#editorError').classList.add('hidden');
  try { await runCode($('#editorCode').value); if (previewing && state.playing && $('#editorDialog').open) showToast('Previewing your pattern'); }
  catch (error) { $('#editorError').textContent = error?.message || 'This pattern could not be played.'; $('#editorError').classList.remove('hidden'); }
  finally { button.disabled = false; }
});
$('#editorForm').addEventListener('submit', async event => {
  event.preventDefault();
  const title = $('#editorTitle').value.trim();
  const artist = $('#editorArtist').value.trim() || 'You';
  const code = $('#editorCode').value.trim();
  if (!title || !code) return;
  if(!editorSession || editorSession.loading)return;
  clearTimeout(draftTimer);
  const existing=state.custom.find(t=>t.id===editorSession.targetId);
  if(existing && existing.title===title && existing.artist===artist && existing.code===code){
    persistStudioDraft();showToast('This version is already saved');return;
  }
  const track = { ...(existing||{}),id:existing?.id||`custom-${crypto.randomUUID()}`, title, artist, mood: 'Your pattern', loop: '∞ loop', code, created: true, cover:false,palette: 5,
    ...(editorSession.sourceId?{forkedFrom:editorSession.sourceId}:{}) };
  const declaredDuration=Number(code.match(/const (?:endSeconds|sourceDuration)\s*=\s*([\d.]+)/)?.[1]);
  if(declaredDuration>0)track.durationSeconds=declaredDuration;else delete track.durationSeconds;
  const custom = existing?state.custom.map(t=>t.id===track.id?track:t):[track,...state.custom];
  const histories=WorkspaceStorage.read('strudelify-track-versions-v1',{});
  const versions=histories[track.id]||[];
  if(existing&&!versions.length)versions.push({id:crypto.randomUUID(),title:existing.title,artist:existing.artist,code:existing.code,createdAt:existing.createdAt||''});
  versions.push({id:crypto.randomUUID(),title,artist,code,createdAt:new Date().toISOString()});
  histories[track.id]=versions.slice(-20);
  try {
    if(custom.length>300)throw new Error('Pattern limit reached. Export your library before adding more.');
    WorkspaceStorage.update({'strudelify-custom':custom,'strudelify-track-versions-v1':histories,
      'strudelify-studio-drafts-v1':studioDrafts().filter(d=>d.id!==editorSession.draftId)});
    state.custom = custom;
    volatileDrafts.delete(editorSession.draftId);
    editorSession={...editorSession,draftId:'edit-'+track.id,targetId:track.id,base:{title,artist,code}};
    $('#editorTitle').value=title;$('#editorArtist').value=artist;$('#editorCode').value=code;
    $('#studioHeading').textContent='Edit your pattern';$('#saveTrackButton').textContent='Save changes';
    $('#studioDraftStatus').textContent='Saved a new version on this device';$('#studioDraftStatus').classList.remove('save-failed');
    if (state.current?.preview) await endEditorPreview();
    if(existing && state.current?.id===track.id){
      if(existing.code!==code)await stopTrack();
      if(state.current?.id===track.id)state.current=track;
    }
    codeCache.delete(track.id);renderPlaylistNav();renderAllLists();renderStudioVersions();renderPlayer();
    showToast(existing?'Changes saved as a new version':'Saved to your local library');
    openTrack(track.id);
  } catch(error) {
    $('#editorError').textContent=error.message||'Could not save. Download the pattern to keep a copy.';$('#editorError').classList.remove('hidden');
  }
});
$('#editorDialog').addEventListener('close', () => {
  persistStudioDraft();++editorRevision;
  if (state.current?.preview) endEditorPreview();
});
window.addEventListener('pagehide', () => {if($('#editorDialog').open)persistStudioDraft();stopTrack();});
$$('[data-catalog-filter]').forEach(button=>button.addEventListener('click',()=>{
  state.catalogFilter=button.dataset.catalogFilter;
  $$('[data-catalog-filter]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});renderSearch();
}));
$('#catalogSort').addEventListener('change',event=>{state.catalogSort=event.target.value;renderSearch();});
function routeFromLocation() {
  if (window.MusicSite?.route(location.hash,false))return;
  if (location.hash.startsWith('#playlist/')) {
    try { openPlaylist(decodeURIComponent(location.hash.slice(10)),false); }
    catch { setView('library',false); }
  }
  else if (location.hash.startsWith('#track/')) {
    try { openTrack(decodeURIComponent(location.hash.slice(7)), false); }
    catch { setView('home', false); }
  }
  else if (location.hash === '#track' && history.state?.trackId) openTrack(history.state.trackId, false);
  else setView(location.hash.slice(1) || 'home', false);
}
installMediaControls();
window.addEventListener('popstate', routeFromLocation);

document.querySelector('a[href="#mainArea"]').addEventListener('click', event => { event.preventDefault(); $('#mainArea').focus(); });
document.addEventListener('keydown', event => { if(event.key==='Escape'){hideSuggestions();$$('.detail-menu').forEach(menu=>menu.classList.add('hidden'));$$('[data-track-menu]').forEach(button=>button.setAttribute('aria-expanded','false'));} });
document.querySelector('[data-close-editor]').addEventListener('click', () => $('#editorDialog').close('cancel'));
$('#createHeaderButton').addEventListener('click', () => openEditor());
$('#librarySearchButton').addEventListener('click', () => { setView('search'); $('#searchInput').focus(); });
$('#clearSearchButton').addEventListener('click', () => { $('#searchInput').value=''; $('#searchPageInput').value=''; renderSearch(); hideSuggestions(); $('#clearSearchButton').classList.add('hidden'); $('#searchInput').focus(); });
$$('[data-home-filter]').forEach(button => button.addEventListener('click', () => { homeFilter=button.dataset.homeFilter; $$('[data-home-filter]').forEach(b=>{b.classList.toggle('selected',b===button); b.setAttribute('aria-pressed',String(b===button));}); renderHome(); }));
function setRightPanel(panel) {
  $('#appShell').classList.toggle('queue-open',panel==='queue');
  $('#appShell').classList.toggle('lyrics-open',panel==='lyrics');
  $$('[data-toggle-queue]').forEach(button=>button.setAttribute('aria-expanded',String(panel==='queue')));
  $$('[data-toggle-lyrics]').forEach(button=>button.setAttribute('aria-expanded',String(panel==='lyrics')));
}
$$('[data-toggle-queue]').forEach(button=>button.addEventListener('click',()=>setRightPanel($('#appShell').classList.contains('queue-open')?'':'queue')));
$$('[data-toggle-lyrics]').forEach(button=>button.addEventListener('click',()=>setRightPanel($('#appShell').classList.contains('lyrics-open')?'':'lyrics')));
$('#retryLyrics')?.addEventListener('click',()=>{if(state.current)loadLyrics(state.current);});
$('#collapseSidebarButton').addEventListener('click',()=>{ const collapsed=$('#appShell').classList.toggle('library-collapsed'); $('#appShell').style.removeProperty('--library-width'); const label=collapsed?'Expand your library':'Collapse your library'; $('#collapseSidebarButton').setAttribute('aria-expanded',String(!collapsed)); $('#collapseSidebarButton').setAttribute('aria-label',label); $('#collapseSidebarButton').title=label; });
let libraryWidth = 280;
const resizer=$('#libraryResizer');
function resizeLibrary(width) { libraryWidth=Math.max(220,Math.min(420,width)); $('#appShell').classList.remove('library-collapsed'); $('#appShell').style.setProperty('--library-width',libraryWidth+'px'); resizer.setAttribute('aria-valuenow',String(libraryWidth)); $('#collapseSidebarButton').setAttribute('aria-expanded','true'); $('#collapseSidebarButton').setAttribute('aria-label','Collapse your library'); $('#collapseSidebarButton').title='Collapse your library'; }
resizer.addEventListener('pointerdown',e=>{ if(e.button!==0)return; resizer.setPointerCapture(e.pointerId); resizer.dataset.dragging='true'; });
resizer.addEventListener('pointermove',e=>{if(resizer.dataset.dragging==='true')resizeLibrary(e.clientX-8);});
resizer.addEventListener('pointerup',()=>delete resizer.dataset.dragging);
resizer.addEventListener('lostpointercapture',()=>delete resizer.dataset.dragging);
resizer.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();resizeLibrary(libraryWidth+(e.key==='ArrowLeft'?-10:10));}});
function hideSuggestions(){ $('#searchSuggestions').classList.add('hidden'); $('#searchInput').setAttribute('aria-expanded','false'); }
function showSuggestions(){
  const query=$('#searchInput').value.trim();
  $('#clearSearchButton').classList.toggle('hidden',!query);
  if(!query){hideSuggestions();return;}
  const result=searchResults(query).slice(0,5);
  $('#searchSuggestions').innerHTML='<div class="suggestion-heading">Patterns</div>'+result.map(track=>`<button class="suggestion" data-action="open" data-track-id="${escapeHtml(track.id)}">${artMarkup(track)}<span><strong>${escapeHtml(track.title)}</strong><small>${escapeHtml(track.artist)}</small></span></button>`).join('')+`<button class="suggestion-all" data-view="search">Show all results for “${escapeHtml(query)}”</button>`;
  $('#searchSuggestions').classList.remove('hidden'); $('#searchInput').setAttribute('aria-expanded','true');
}
$('#searchInput').addEventListener('focus',showSuggestions);
$('#searchInput').addEventListener('keydown',e=>{if(e.key==='Escape')hideSuggestions();if(e.key==='Enter'){hideSuggestions();$('#mainArea').focus();}if(e.key==='ArrowDown'){e.preventDefault();$('#searchSuggestions button')?.focus();}});
$('#searchSuggestions').addEventListener('keydown',e=>{const buttons=$$('button',$('#searchSuggestions')),i=buttons.indexOf(document.activeElement);if(e.key==='Escape'){hideSuggestions();$('#searchInput').focus();hideSuggestions();}else if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}});
document.addEventListener('click',e=>{
  if(!e.target.closest('.search-wrap'))hideSuggestions();
  if(e.target.closest('[data-show-code]')){ $('#patternCode').open=!$('#patternCode').open; }
  const trigger=e.target.closest('[data-track-menu]');
  if(trigger){const menu=trigger.nextElementSibling;menu.classList.toggle('hidden');trigger.setAttribute('aria-expanded',String(!menu.classList.contains('hidden')));}
  else $$('.detail-menu').forEach(menu=>menu.classList.add('hidden'));
});
renderPlaylistNav();
renderHome();
renderPlayer();
setRightPanel($('#lyricsLines') && matchMedia('(min-width:1101px)').matches ? 'lyrics' : '');
if (!location.hash) history.replaceState({ view: 'home' }, '', '#home');

async function loadCoverCatalog() {
  const catalogUrl = new URL('tracks/catalog.json', document.baseURI);
  const response = await fetch(catalogUrl, {cache: 'no-cache'});
  if (!response.ok) throw new Error(`Music catalog unavailable (${response.status}).`);
  const catalog = await response.json();
  const statuses = ['draft', 'runtime-verified', 'listening-reviewed', 'approved'];
  if (!Array.isArray(catalog) || !catalog.length) throw new Error('Music catalog is empty.');
  const ids = new Set();
  const covers = catalog.map((entry, index) => {
    if (!entry.id || ids.has(entry.id) || !entry.title || !entry.artist || !entry.genre ||
        !Number.isFinite(entry.bpm) || entry.bpm <= 0 || !statuses.includes(entry.status))
      throw new Error('Music catalog contains an invalid entry.');
    ids.add(entry.id);
    const codeUrl = new URL(entry.codeUrl, catalogUrl);
    if (!entry.codeUrl || codeUrl.origin !== catalogUrl.origin ||
        !codeUrl.pathname.startsWith(new URL('./', catalogUrl).pathname) ||
        !codeUrl.pathname.endsWith('.strudel')) throw new Error('Invalid track code path.');
    const study=entry.kind==='cover-study' && entry.rights?.status==='owner-requested-study'
      && entry.status==='runtime-verified' && entry.reviewStatus==='unreviewed'
      && /^0[1-8]-/.test(entry.id);
    if (!['project-original', 'cleared', 'owner-requested-study'].includes(entry.rights?.status) ||
        !entry.rights.evidence || !entry.rights.license ||
        (entry.kind !== 'original' && !study && (entry.status !== 'approved' || !entry.humanReview)))
      throw new Error('A track has not passed the public release gate.');
    if (entry.lyricsUrl) throw new Error('Lyrics are not enabled in this release.');
    return {...entry, codeUrl: codeUrl.href, cover: entry.kind !== 'original', mood: entry.genre,
      loop: `${entry.bpm} BPM`, group: entry.group || 'Original patterns', palette: entry.palette || index % palettes.length + 1};
  });
  // Preserve older saved copies under distinct IDs so they cannot shadow a deployed cover.
  const canonical = new Set(covers.map(track=>track.id));
  const used = new Set([...canonical,...tracks.map(track=>track.id),...state.custom.map(track=>track.id)]);
  let migrated = false;
  state.custom = state.custom.map((track,index)=>{
    if (!canonical.has(track.id)) return track;
    let suffix=index,id=`saved-${track.id}-${suffix}`;
    while (used.has(id)) id=`saved-${track.id}-${++suffix}`;
    used.add(id);
    codeCache.delete(track.id);
    const saved={...track,id,title:`${track.title} (saved version)`};
    if (state.liked.includes(track.id) && !state.liked.includes(id)) state.liked.push(id);
    if (state.current===track) state.current=saved;
    migrated=true;
    return saved;
  });
  if (migrated) {
    saveStorage('strudelify-custom',state.custom);
    saveStorage('strudelify-liked',state.liked);
  }
  tracks.splice(0, tracks.length, ...covers);
  $('#catalogStatus')?.classList.add('hidden');
  if ($('#catalogIntro')) $('#catalogIntro').textContent = `${covers.filter(t=>t.cover).length} instrumental cover studies and ${covers.filter(t=>!t.cover).length} originals. Press play, explore the code, and find your sound.`;
  renderAllLists();
  renderPlayer();
  showSuggestions();
}
loadCoverCatalog().catch(error => {
  const status=$('#catalogStatus');
  if (status) {status.textContent = `${error.message} Reload to try again. Original patterns are still available.`;status.setAttribute('role', 'alert');}
  else showToast(error.message);
}).finally(routeFromLocation);

function feedbackUrl(track = state.current) {
  const seconds = window.getAudioContext && (state.playing || state.paused)
    ? Math.max(0, window.getAudioContext().currentTime - playbackStartedAt).toFixed(1) : 'not playing';
  const body = `Track: ${track?.title || 'General feedback'} (${track?.id || 'none'})\n` +
    `Playback position: ${seconds}\nBuild: ${window.releaseVersion || 'review candidate'}\n` +
    `Browser: ${navigator.userAgent}\nViewport: ${innerWidth} x ${innerHeight}\n\n` +
    'What happened?\n\nWhat did you expect?\n\nSteps to reproduce:\n1. \n\n' +
    'Music feedback (optional): describe timing, melody, sound, or the passage that needs work.\n\n' +
    'This report is public. Remove anything personal before submitting. No report is sent automatically.';
  return 'https://github.com/Hustlenix/strudelify/issues/new?' + new URLSearchParams({
    title: `[Listener feedback] ${track?.title || 'Player'}`, body,
  });
}
document.addEventListener('click', event => {
  const link = event.target.closest('[data-feedback]');
  if (link) link.href = feedbackUrl(getTrack(link.dataset.feedback) || state.current);
});
fetch('release.json', {cache:'no-cache'}).then(response => response.ok ? response.json() : null)
  .then(data => { if (data) window.releaseVersion = data.commit + (data.dirty ? ' (working copy)' : ''); }).catch(() => {});
